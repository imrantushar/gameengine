<?php

namespace Gamify\System;

if (! defined('ABSPATH')) exit;

class Logger
{
    /**
     * Constructor.
     * Automatically registers hooks when the class is instantiated by the Loader.
     */
    public function __construct()
    {
        // Points Added Hook
        add_action('gamify_points_added', [$this, 'handle_points_added'], 10, 4);

        // Points Deducted Hook
        add_action('gamify_points_deducted', [$this, 'handle_points_deducted'], 10, 4);
    }

    /**
     * Callback when points are added.
     */
    public function handle_points_added($user_id, $points, $point_type_id, $log_id)
    {
        self::log(
            'points_awarded',
            "User received {$points} points.",
            $user_id,
            ['points' => $points, 'log_id' => $log_id, 'type_id' => $point_type_id]
        );
    }

    /**
     * Callback when points are deducted.
     */
    public function handle_points_deducted($user_id, $points, $point_type_id, $log_id)
    {
        self::log(
            'points_deducted',
            "User lost {$points} points.",
            $user_id,
            ['points' => -$points, 'log_id' => $log_id, 'type_id' => $point_type_id]
        );
    }

    /**
     * Static method to insert log into DB.
     * Can be called manually from anywhere: \Gamify\System\Logger::log(...)
     */
    public static function log($event_name, $message, $user_id = 0, $meta = [], $status = 'success')
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_logs';

        if (!$user_id) {
            $user_id = get_current_user_id();
        }

        $wpdb->insert($table, [
            'user_id'    => $user_id,
            'event_name' => sanitize_key($event_name),
            'status'     => $status,
            'message'    => sanitize_text_field($message),
            'meta'       => json_encode($meta),
            'created_at' => current_time('mysql')
        ]);
    }
}
