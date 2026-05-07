<?php

namespace GameEngine\Classes;

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
        $safe_user_id = (int) $user_id;
        $safe_pt_id   = (int) $point_type_id;

        if ($safe_user_id <= 0) {
            return 0;
        }

        // Check Cache first
        $cache_key = "gameengine_user_points_{$safe_user_id}_{$safe_pt_id}";
        $total     = wp_cache_get($cache_key, 'gameengine');

        if (false === $total) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $total = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log WHERE user_id = %d AND point_type_id = %d",
                $safe_user_id,
                $safe_pt_id
            ));

            wp_cache_set($cache_key, $total, 'gameengine');
        }

        return (int) $total;
    }

    /**
     * Internal function to handle the database insertion.
     */
    private function log_transaction(int $user_id, int $points_value, string $context, array $args)
    {
        global $wpdb;

        $safe_user_id   = (int) $user_id;
        $point_type_id  = isset($args['point_type_id']) ? absint($args['point_type_id']) : 1;
        $requirement_id = isset($args['requirement_id']) ? absint($args['requirement_id']) : null;
        $description    = isset($args['description']) ? sanitize_text_field($args['description']) : null;

        // Cap enforcement: truncate award when points-cap addon is active (award path only).
        if ($points_value > 0) {
            $attempted = $points_value;
            $points_value = $this->apply_cap($safe_user_id, $point_type_id, $points_value);
            if ($points_value <= 0) {
                do_action('gameengine_points_capped', $safe_user_id, $point_type_id, $attempted, 0);
                return false;
            }
            if ($points_value < $attempted) {
                do_action('gameengine_points_capped', $safe_user_id, $point_type_id, $attempted, $points_value);
            }
        }

        // Expiration: set expires_at when expiry_days is provided.
        $expires_at = null;
        if ($points_value > 0 && ! empty($args['expiry_days'])) {
            $days       = absint($args['expiry_days']);
            $expires_at = gmdate('Y-m-d H:i:s', strtotime("+{$days} days", current_time('timestamp')));
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->insert(
            $wpdb->prefix . 'gameengine_points_log',
            [
                'user_id'        => $safe_user_id,
                'point_type_id'  => $point_type_id,
                'points'         => (int) $points_value,
                'context'        => sanitize_key($context),
                'requirement_id' => $requirement_id,
                'description'    => $description,
                'expires_at'     => $expires_at,
                'expired'        => 0,
                'created_at'     => current_time('mysql'),
            ],
            ['%d', '%d', '%d', '%s', '%d', '%s', '%s', '%d', '%s']
        );

        if (! $result) {
            return false;
        }

        $log_id = $wpdb->insert_id;

        // Clear User Level Cache (if applicable)
        wp_cache_delete("gameengine_user_points_{$safe_user_id}_{$point_type_id}", 'gameengine');
        wp_cache_delete("gameengine_user_grand_total_{$safe_user_id}", 'gameengine');

        // Increment Global Frontend Cache Versions
        \GameEngine\Helper::clear_cache_group('leaderboard');
        \GameEngine\Helper::clear_cache_group('dashboard');

        if ($points_value > 0) {
            do_action('gameengine_points_added', $safe_user_id, $points_value, $context, $log_id, $point_type_id);
        } else {
            do_action('gameengine_points_deducted', $safe_user_id, abs($points_value), $context, $log_id, $point_type_id);
        }

        return $log_id;
    }

    /**
     * Apply balance cap for the given user/point type.
     * Returns the (possibly truncated) points amount to award.
     * Returns 0 if the user is already at or above cap.
     * Returns the original amount unchanged if no cap is set.
     */
    private function apply_cap(int $user_id, int $point_type_id, int $points): int
    {
        // Cap is enforced via filter so the pro addon can hook in without modifying this class.
        $cap = (int) apply_filters('gameengine_get_point_cap', 0, $user_id, $point_type_id);

        if ($cap <= 0) {
            return $points;
        }

        $current = $this->get_total($user_id, $point_type_id);
        $room    = $cap - $current;

        if ($room <= 0) {
            return 0;
        }

        return min($points, $room);
    }

    /**
     * Get grand total points (sum of all point types).
     */
    public function get_grand_total(int $user_id): int
    {
        $safe_user_id = (int) $user_id;

        if ($safe_user_id <= 0) {
            return 0;
        }

        global $wpdb;

        $cache_key = "gameengine_user_grand_total_{$safe_user_id}";
        $total     = wp_cache_get($cache_key, 'gameengine');

        if (false === $total) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $total = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log WHERE user_id = %d",
                $safe_user_id
            ));
            
            wp_cache_set($cache_key, $total, 'gameengine');
        }

        return (int) $total;
    }
}
