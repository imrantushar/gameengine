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
    public function add(int $user_id, int $points, string $context, array $args = [])
    {
        if ($user_id <= 0 || $points <= 0) return false;
        return $this->log_transaction($user_id, abs($points), $context, $args);
    }

    public function deduct(int $user_id, int $points, string $context, array $args = [])
    {
        if ($user_id <= 0 || $points <= 0) return false;
        return $this->log_transaction($user_id, -abs($points), $context, $args);
    }

    public function get_total(int $user_id, int $point_type_id = 1): int
    {
        if ($user_id <= 0) return 0;
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_points_log';
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$table} WHERE user_id = %d AND point_type_id = %d",
            $user_id,
            $point_type_id
        ));
    }

    private function log_transaction(int $user_id, int $points_value, string $context, array $args)
    {
        global $wpdb;

        // FIX 1: Correct Table Name
        $table = $wpdb->prefix . 'gamify_points_log';

        // Extract Data
        $point_type_id  = isset($args['point_type_id']) ? absint($args['point_type_id']) : 1;
        $requirement_id = isset($args['requirement_id']) ? absint($args['requirement_id']) : null;
        $description    = isset($args['description']) ? sanitize_text_field($args['description']) : null;

        // Insert
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

        // FIX 2: Pass correct arguments to Logger (user, points, point_type, log_id)
        if ($points_value > 0) {
            do_action('gamify_points_added', $user_id, $points_value, $point_type_id, $log_id);
        } else {
            do_action('gamify_points_deducted', $user_id, abs($points_value), $point_type_id, $log_id);
        }

        return $log_id;
    }
}
