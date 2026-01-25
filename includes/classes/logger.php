<?php

namespace GameEngine\Classes;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles system-wide logging for audit and history purposes.
 */
class Logger
{
    /**
     * Initialize the Logger.
     */
    public static function init()
    {
        $self = new self();
        add_action('gameengine_points_added', [$self, 'handle_points_added'], 10, 5);
        add_action('gameengine_points_deducted', [$self, 'handle_points_deducted'], 10, 5);
    }

    /**
     * Callback when points are added.
     */
    public function handle_points_added($user_id, $points, $context, $log_id, $point_type_id)
    {
        self::log(
            $context,
            "User received {$points} points.",
            $user_id,
            $points,
            [
                'log_id' => $log_id,
                'point_type_id' => $point_type_id,
                'type' => 'award'
            ],
            'success'
        );
    }

    /**
     * Callback when points are deducted.
     */
    public function handle_points_deducted($user_id, $points, $context, $log_id, $point_type_id)
    {
        self::log(
            $context,
            "User lost {$points} points.",
            $user_id,
            -$points,
            [
                'log_id' => $log_id,
                'point_type_id' => $point_type_id,
                'type' => 'deduct'
            ],
            'success'
        );
    }

    /**
     * Static method to insert a log entry into the database.
     */
    public static function log($trigger_key, $message, $user_id = 0, $points_awarded = 0, $meta = [], $status = 'success')
    {

        $settings = get_option('gameengine_log_settings', []);
        $allowed_levels = isset($settings['log_levels']) ? (array) $settings['log_levels'] : ['success', 'error'];

        if (!in_array($status, $allowed_levels, true)) {
            return; // Stop if admin disabled this log level
        }
        global $wpdb;
        $table = $wpdb->prefix . 'gameengine_logs';

        if (!$user_id) {
            $user_id = get_current_user_id();
        }

        // Check if table exists securely
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) != $table) {
            return;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->insert($table, [
            'user_id'        => $user_id,
            'trigger_key'    => sanitize_key($trigger_key),
            'status'         => $status,
            'points_awarded' => intval($points_awarded),
            'message'        => sanitize_text_field($message),
            'meta'           => json_encode($meta),
            'created_at'     => current_time('mysql')
        ]);
    }
}
