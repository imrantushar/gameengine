<?php

namespace Gamify\Classes;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Manages all point-related database operations.
 * This class is instantiated by Controllers and Schedulers to manipulate points.
 */
class PointsManager
{
    /**
     * Add points to a user and log the transaction.
     *
     * @param int    $user_id The ID of the user.
     * @param int    $points  The number of points to award (must be a positive integer).
     * @param string $context A key to identify the reason (e.g., 'wp_login').
     * @param array  $args    Optional arguments like 'point_type_id' and 'description'.
     * @return int|false Returns the new log ID on success, false on failure.
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
     * Get the total points for a specific user and point type.
     *
     * @param int $user_id The ID of the user.
     * @param int $point_type_id The ID of the point type (default: 1).
     * @return int The user's total points.
     */
    public function get_total(int $user_id, int $point_type_id = 1): int
    {
        if ($user_id <= 0) {
            return 0;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gamify_points_log';

        // Check table exists logic can be added here if needed, but usually handled by installer.

        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$table} WHERE user_id = %d AND point_type_id = %d",
            $user_id,
            $point_type_id
        ));

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
        $table = $wpdb->prefix . 'gamify_points_log';

        // Extract arguments or set defaults
        $point_type_id  = isset($args['point_type_id']) ? absint($args['point_type_id']) : 1;
        $requirement_id = isset($args['requirement_id']) ? absint($args['requirement_id']) : null;
        $description    = isset($args['description']) ? sanitize_text_field($args['description']) : null;

        // Insert into Points Log table
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

        // Fire actions for the Logger and other hooks.
        // We ensure 5 arguments are passed so Logger::handle_points_added catches them correctly.
        if ($points_value > 0) {
            do_action('gamify_points_added', $user_id, $points_value, $context, $log_id, $point_type_id);
        } else {
            do_action('gamify_points_deducted', $user_id, abs($points_value), $context, $log_id, $point_type_id);
        }

        return $log_id;
    }
}
