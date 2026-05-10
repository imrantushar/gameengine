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
        'achievements', 'levels', 'point_types', 'ranks', 'streaks',
    );

    /**
     * Import rows from a file.
     *
     * @param string $type      Entity type.
     * @param string $file_path Temp file path.
     * @param bool   $overwrite Whether to overwrite existing slugs.
     * @return array{imported: int, skipped: int, errors: array}
     */
    public static function import(string $type, string $file_path, bool $overwrite = false): array
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

        $ext  = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
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
            $handle = fopen($file_path, 'r');
            if (!$handle) {
                $result['errors'][] = __('Cannot read file.', 'gameengine');
                return $result;
            }
            $headers = fgetcsv($handle);
            if (!$headers) {
                fclose($handle);
                $result['errors'][] = __('Empty or invalid CSV file.', 'gameengine');
                return $result;
            }
            while (($line = fgetcsv($handle)) !== false) {
                if (count($line) === count($headers)) {
                    $rows[] = array_combine($headers, $line);
                }
            }
            fclose($handle);
        }

        $rows = array_slice($rows, 0, self::ROW_LIMIT);

        foreach ($rows as $row) {
            $res = self::import_row($type, $row, $overwrite);
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

    private static function import_row(string $type, array $row, bool $overwrite): string
    {
        global $wpdb;

        $table_map = array(
            'achievements' => "{$wpdb->prefix}gameengine_achievements",
            'levels'       => "{$wpdb->prefix}gameengine_levels",
            'point_types'  => "{$wpdb->prefix}gameengine_point_types",
            'ranks'        => "{$wpdb->prefix}gameengine_ranks",
            'streaks'      => "{$wpdb->prefix}gameengine_streaks",
        );

        $required_map = array(
            'achievements' => array('title', 'slug'),
            'levels'       => array('title', 'slug'),
            'point_types'  => array('name', 'slug'),
            'ranks'        => array('title', 'slug'),
            'streaks'      => array('title', 'slug'),
        );

        $table    = $table_map[$type];
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

        $slug = sanitize_title($row['slug']);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $existing_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE slug = %s", $slug));

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

        if ($existing_id && $overwrite) {
            unset($clean['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update($table, $clean, array('id' => (int) $existing_id));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->insert($table, $clean);
        }

        return 'imported';
    }
}
