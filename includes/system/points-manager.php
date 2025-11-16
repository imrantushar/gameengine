<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Manages all point-related database operations.
 */
final class PointsManager
{
    /**
     * Add points to a user and log the transaction.
     *
     * @param int    $user_id The ID of the user.
     * @param int    $points  The number of points to award (must be a positive integer).
     * @param string $context A key to identify the reason (e.g., 'wp_login').
     * @param array  $args    Optional arguments like 'reference_id' and 'description'.
     * @return int|false Returns the new log ID on success, false on failure.
     */
    public function add(int $user_id, int $points, string $context, array $args = [])
    {
        if ($user_id <= 0 || $points <= 0) {
            return false;
        }

        return $this->log_transaction($user_id, $points, $context, $args);
    }

    /**
     * Deduct points from a user and log the transaction.
     *
     * @param int    $user_id The ID of the user.
     * @param int    $points  The number of points to deduct (must be a positive integer).
     * @param string $context A key to identify the reason.
     * @param array  $args    Optional arguments.
     * @return int|false Returns the new log ID on success, false on failure.
     */
    public function deduct(int $user_id, int $points, string $context, array $args = [])
    {
        if ($user_id <= 0 || $points <= 0) {
            return false;
        }

        return $this->log_transaction($user_id, -abs($points), $context, $args);
    }

    /**
     * Get the total points for a specific user.
     *
     * @param int $user_id The ID of the user.
     * @return int The user's total points.
     */
    public function get_total(int $user_id): int
    {
        if ($user_id <= 0) {
            return 0;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gamify_points';

        $total = $wpdb->get_var($wpdb->prepare("SELECT SUM(points) FROM {$table} WHERE user_id = %d", $user_id));

        return (int) $total;
    }

    /**
     * Internal function to handle the database insertion.
     *
     * @param int    $user_id
     * @param int    $points_value (+ or -)
     * @param string $context
     * @param array  $args
     * @return int|false
     */
    private function log_transaction(int $user_id, int $points_value, string $context, array $args)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_points';

        $result = $wpdb->insert($table, [
            'user_id'      => $user_id,
            'points'       => $points_value,
            'context'      => sanitize_key($context),
            'reference_id' => isset($args['reference_id']) ? absint($args['reference_id']) : null,
            'description'  => isset($args['description']) ? sanitize_textarea_field($args['description']) : null,
            'created_at'   => current_time('mysql'),
        ]);

        if (! $result) {
            return false;
        }

        $log_id = $wpdb->insert_id;

        // Fire actions for other parts of the plugin to hook into.
        if ($points_value > 0) {
            do_action('gamify_points_added', $user_id, $points_value, $context, $log_id);
        } else {
            do_action('gamify_points_deducted', $user_id, abs($points_value), $context, $log_id);
        }

        return $log_id;
    }
}
