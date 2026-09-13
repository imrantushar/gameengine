<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles CSV/JSON data import for GameEngine entities.
 */
class ImportManager
{

    private const ROW_LIMIT = 1000;

    private static $allowed_types = array(
        'achievements', 'levels', 'point_types',
    );

    /**
     * Import rows from a file.
     *
     * @param string $type      Entity type.
     * @param string $file_path Temp file path.
     * @param bool   $overwrite Whether to overwrite existing slugs.
     * @param string $format    'json' or 'csv'. Taken from the uploaded file's
     *                          name by the caller: $file_path is PHP's upload
     *                          temp file, which has no extension, so sniffing
     *                          it here read every upload as CSV.
     * @return array{imported: int, skipped: int, errors: array}
     */
    public static function import(string $type, string $file_path, bool $overwrite = false, string $format = ''): array
    {
        $result = array('imported' => 0, 'skipped' => 0, 'errors' => array());

        if (!in_array($type, self::$allowed_types, true)) {
            $result['errors'][] = __('Invalid import type.', 'gameengine');
            return $result;
        }

        if (!file_exists($file_path)) {
            $result['errors'][] = __('File not found.', 'gameengine');
            return $result;
        }

        $ext  = $format !== ''
            ? strtolower($format)
            : strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
        $rows = array();

        if ($ext === 'json') {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            $content = file_get_contents($file_path);
            $decoded = json_decode($content, true);
            if (!is_array($decoded)) {
                $result['errors'][] = __('Invalid JSON file.', 'gameengine');
                return $result;
            }
            $rows = $decoded;
        } else {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- fgetcsv() reads the uploaded file as a stream; WP_Filesystem has no streaming reader.
            $handle = fopen($file_path, 'r');
            if (!$handle) {
                $result['errors'][] = __('Cannot read file.', 'gameengine');
                return $result;
            }
            $headers = fgetcsv($handle);
            if (!$headers) {
                // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
                fclose($handle);
                $result['errors'][] = __('Empty or invalid CSV file.', 'gameengine');
                return $result;
            }
            while (($line = fgetcsv($handle)) !== false) {
                if (count($line) === count($headers)) {
                    $rows[] = array_combine($headers, $line);
                }
            }
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
            fclose($handle);
        }

        $rows = array_slice($rows, 0, self::ROW_LIMIT);

        // Pre-fetch existing slug => id pairs once, instead of one SELECT per
        // row; the map is updated in place as rows are imported so duplicate
        // slugs within the same file are still caught.
        $table       = self::table_for_type($type);
        $slug_to_id  = self::get_existing_slugs($table);

        foreach ($rows as $row) {
            $res = self::import_row($type, $table, $row, $overwrite, $slug_to_id);
            if ($res === 'imported') {
                $result['imported']++;
            } elseif ($res === 'skipped') {
                $result['skipped']++;
            } else {
                $result['errors'][] = $res;
            }
        }

        return $result;
    }

    private static function table_for_type(string $type): string
    {
        global $wpdb;

        $table_map = array(
            'achievements' => "{$wpdb->prefix}gameengine_achievements",
            'levels'       => "{$wpdb->prefix}gameengine_levels",
            'point_types'  => "{$wpdb->prefix}gameengine_point_types",
        );

        return $table_map[$type];
    }

    /**
     * One query for every existing slug in the target table, instead of a
     * per-row existence lookup.
     */
    private static function get_existing_slugs(string $table): array
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results("SELECT id, slug FROM {$table}", ARRAY_A) ?: array();

        $map = array();
        foreach ($rows as $row) {
            $map[$row['slug']] = (int) $row['id'];
        }
        return $map;
    }

    private static function import_row(string $type, string $table, array $row, bool $overwrite, array &$slug_to_id): string
    {
        global $wpdb;

        $required_map = array(
            'achievements' => array('title', 'slug'),
            'levels'       => array('title', 'slug'),
            'point_types'  => array('name', 'slug'),
        );

        $required = $required_map[$type];

        foreach ($required as $field) {
            if (empty($row[$field])) {
                return sprintf(
                    /* translators: %s: field name */
                    __('Missing required field: %s', 'gameengine'),
                    $field
                );
            }
        }

        $slug        = sanitize_title($row['slug']);
        $existing_id = $slug_to_id[$slug] ?? 0;

        if ($existing_id && !$overwrite) {
            return 'skipped';
        }

        $clean = array('slug' => $slug);
        foreach ($row as $key => $value) {
            if ($key === 'id' || $key === 'created_at') {
                continue;
            }
            $clean[sanitize_key($key)] = sanitize_text_field($value);
        }
        $clean['created_at'] = current_time('mysql');

        // Only write columns the table actually has. A file carrying a heading
        // this entity does not know about used to fail the whole row with an
        // "Unknown column" error that was then reported as a success.
        $clean = array_intersect_key($clean, array_flip(self::columns_for($table)));

        if ($existing_id && $overwrite) {
            unset($clean['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $written = $wpdb->update($table, $clean, array('id' => $existing_id));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $written = $wpdb->insert($table, $clean);
            if (false !== $written) {
                $slug_to_id[$slug] = $wpdb->insert_id;
            }
        }

        // $wpdb returns false on a database error; an update that changed
        // nothing returns 0, which is not a failure.
        if (false === $written) {
            return sprintf(
                /* translators: %s: row slug */
                __('Could not save row: %s', 'gameengine'),
                $slug
            );
        }

        return 'imported';
    }

    /**
     * Column names of a table, read once per request.
     */
    private static function columns_for(string $table): array
    {
        static $cache = array();

        if (isset($cache[$table])) {
            return $cache[$table];
        }

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $cache[$table] = $wpdb->get_col("SHOW COLUMNS FROM {$table}") ?: array();

        return $cache[$table];
    }
}
