<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles data export for all GameEngine entities.
 */
class ExportManager
{

    private const ROW_LIMIT = 10000;

    private static $allowed_types = array(
        'achievements', 'levels', 'point_types', 'ranks', 'streaks',
        'user_points', 'user_achievements', 'user_levels', 'user_ranks', 'logs',
    );

    /**
     * Export data as CSV or JSON string.
     *
     * @param string $type   Entity type.
     * @param string $format 'csv' or 'json'.
     * @return array{data: string, truncated: bool, rows: int}
     */
    public static function export(string $type, string $format = 'csv'): array
    {
        if (!in_array($type, self::$allowed_types, true)) {
            return array('data' => '', 'truncated' => false, 'rows' => 0);
        }

        $rows      = self::fetch_rows($type);
        $truncated = count($rows) >= self::ROW_LIMIT;

        if ($format === 'json') {
            return array('data' => wp_json_encode($rows), 'truncated' => $truncated, 'rows' => count($rows));
        }

        return array('data' => self::to_csv($rows), 'truncated' => $truncated, 'rows' => count($rows));
    }

    private static function fetch_rows(string $type): array
    {
        global $wpdb;
        $limit = self::ROW_LIMIT;

        $table_map = array(
            'achievements'     => "{$wpdb->prefix}gameengine_achievements",
            'levels'           => "{$wpdb->prefix}gameengine_levels",
            'point_types'      => "{$wpdb->prefix}gameengine_point_types",
            'ranks'            => "{$wpdb->prefix}gameengine_ranks",
            'streaks'          => "{$wpdb->prefix}gameengine_streaks",
            'user_achievements' => "{$wpdb->prefix}gameengine_user_achievements",
            'user_levels'      => "{$wpdb->prefix}gameengine_user_levels",
            'user_ranks'       => "{$wpdb->prefix}gameengine_user_ranks",
            'logs'             => "{$wpdb->prefix}gameengine_logs",
        );

        if ($type === 'user_points') {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            return $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_points_log ORDER BY id DESC LIMIT %d", $limit),
                ARRAY_A
            ) ?: array();
        }

        if (isset($table_map[$type])) {
            $table = $table_map[$type];
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            return $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$table} ORDER BY id DESC LIMIT %d", $limit),
                ARRAY_A
            ) ?: array();
        }

        return array();
    }

    private static function to_csv(array $rows): string
    {
        if (empty($rows)) {
            return '';
        }

        $output = fopen('php://temp', 'r+');

        fputcsv($output, array_keys($rows[0]));

        foreach ($rows as $row) {
            fputcsv($output, array_values($row));
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
