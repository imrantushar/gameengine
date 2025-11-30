<?php

namespace Gamify\System;

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
     * Constructor.
     * Automatically registers hooks when the class is instantiated.
     */
    public function __construct()
    {
        // Listen for points added/deducted hooks.
        // Important: '5' indicates we expect 5 arguments from the do_action call.
        add_action('gamify_points_added', [$this, 'handle_points_added'], 10, 5);
        add_action('gamify_points_deducted', [$this, 'handle_points_deducted'], 10, 5);
    }

    /**
     * Callback when points are added.
     *
     * @param int    $user_id
     * @param int    $points
     * @param string $context       The trigger key or event name (e.g., 'wp_login', 'manual_award').
     * @param int    $log_id        The ID from the points_log table.
     * @param int    $point_type_id The ID of the currency/point type.
     */
    public function handle_points_added($user_id, $points, $context, $log_id, $point_type_id)
    {
        self::log(
            $context, // This maps to 'trigger_key' in the DB
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
     *
     * @param int    $user_id
     * @param int    $points
     * @param string $context       The trigger key.
     * @param int    $log_id
     * @param int    $point_type_id
     */
    public function handle_points_deducted($user_id, $points, $context, $log_id, $point_type_id)
    {
        self::log(
            $context, // This maps to 'trigger_key' in the DB
            "User lost {$points} points.",
            $user_id,
            -$points, // Store as negative for deduction visibility
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
     *
     * @param string $trigger_key    The unique identifier for the event (e.g., 'wp_login').
     * @param string $message        A human-readable message.
     * @param int    $user_id        The user ID associated with the log.
     * @param int    $points_awarded The amount of points involved (optional).
     * @param array  $meta           Additional technical data (JSON encoded).
     * @param string $status         Status of the event ('success', 'failed', 'skipped').
     */
    public static function log($trigger_key, $message, $user_id = 0, $points_awarded = 0, $meta = [], $status = 'success')
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_logs';

        if (!$user_id) {
            $user_id = get_current_user_id();
        }

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
