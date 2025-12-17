<?php

namespace Gamify\Classes;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Manages all point-related database operations.
 */
class PointsManager
{
    /**
     * Add points to a user and log the transaction.
     */
    public function add(int $user_id, int $points, string $context, array $args = [])
    {
        if ($user_id <= 0 || $points <= 0) {
            return false;
        }

        return $this->log_transaction($user_id, abs($points), $context, $args);
    }

    /**
     * Deduct points from a user and log the transaction.
     */
    public function deduct(int $user_id, int $points, string $context, array $args = [])
    {
        if ($user_id <= 0 || $points <= 0) {
            return false;
        }

        return $this->log_transaction($user_id, -abs($points), $context, $args);
    }

    /**
     * Get the total points for a specific user and point type.
     * Includes caching to prevent heavy queries.
     */
    public function get_total(int $user_id, int $point_type_id = 1): int
    {
        if ($user_id <= 0) {
            return 0;
        }

        // Check Cache first
        $cache_key = "gamify_user_points_{$user_id}_{$point_type_id}";
        $total = wp_cache_get($cache_key, 'gamify');

        if (false === $total) {
            global $wpdb;
            $table = $wpdb->prefix . 'gamify_points_log';

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
            $total = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(points) FROM {$table} WHERE user_id = %d AND point_type_id = %d",
                $user_id,
                $point_type_id
            ));

            wp_cache_set($cache_key, $total, 'gamify');
        }

        return (int) $total;
    }

    /**
     * Internal function to handle the database insertion.
     */
    private function log_transaction(int $user_id, int $points_value, string $context, array $args)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_points_log';

        $point_type_id  = isset($args['point_type_id']) ? absint($args['point_type_id']) : 1;
        $requirement_id = isset($args['requirement_id']) ? absint($args['requirement_id']) : null;
        $description    = isset($args['description']) ? sanitize_text_field($args['description']) : null;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $result = $wpdb->insert($table, [
            'user_id'        => $user_id,
            'point_type_id'  => $point_type_id,
            'points'         => $points_value,
            'context'        => sanitize_key($context),
            'requirement_id' => $requirement_id,
            'description'    => $description,
            'created_at'     => current_time('mysql'),
        ]);

        if (! $result) {
            return false;
        }

        $log_id = $wpdb->insert_id;

        // Clear Cache so get_total returns fresh value
        wp_cache_delete("gamify_user_points_{$user_id}_{$point_type_id}", 'gamify');

        if ($points_value > 0) {
            do_action('gamify_points_added', $user_id, $points_value, $context, $log_id, $point_type_id);
        } else {
            do_action('gamify_points_deducted', $user_id, abs($points_value), $context, $log_id, $point_type_id);
        }

        return $log_id;
    }

    /**
     * Get grand total points (sum of all point types).
     */
    public function get_grand_total(int $user_id): int
    {
        if ($user_id <= 0) {
            return 0;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gamify_points_log';

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $total = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$table} WHERE user_id = %d",
            $user_id
        ));

        return $total;
    }
}
