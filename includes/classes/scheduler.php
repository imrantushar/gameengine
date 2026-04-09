<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Scheduler
 * Handles Async/Scheduled tasks and automatic database maintenance.
 */
class Scheduler
{

    /**
     * Initialize the Scheduler.
     */
    public static function init()
    {
        $self = new self();

        // Hook for Action Scheduler (Points Adjustment).
        add_action('gameengine_execute_scheduled_action', array($self, 'process_scheduled_action'), 10, 4);

        // Hook for Daily Log Cleanup Cron.
        add_action('gameengine_cleanup_logs_cron', array($self, 'handle_logs_cleanup'));

        // Hook for Daily Inactivity Checker Cron.
        add_action('gameengine_daily_inactivity_cron', array($self, 'check_user_inactivity'));

        // Schedule the daily cleanup event if not already scheduled.
        if (!wp_next_scheduled('gameengine_cleanup_logs_cron')) {
            wp_schedule_event(time(), 'daily', 'gameengine_cleanup_logs_cron');
        }

        // Schedule the daily inactivity checker if not already scheduled.
        if (!wp_next_scheduled('gameengine_daily_inactivity_cron')) {
            wp_schedule_event(time(), 'daily', 'gameengine_daily_inactivity_cron');
        }
    }

    /**
     * The callback function for the scheduled points adjustment.
     */
    public function process_scheduled_action($user_id, $points, $action_type, $meta)
    {
        $points_manager = new PointsManager();

        $description = isset($meta['description']) ? $meta['description'] : 'Scheduled Action';
        $meta['description'] = $description . ' (Executed)';

        $log_id = false;
        if ('deduct' === $action_type) {
            $log_id = $points_manager->deduct($user_id, $points, 'scheduled_execution', $meta);
        } else {
            $log_id = $points_manager->add($user_id, $points, 'scheduled_execution', $meta);
        }

        if ($log_id) {
            $final_points = ('deduct' === $action_type) ? -$points : $points;
            Logger::log(
                'schedule_executed',
                "Successfully executed scheduled {$action_type} of {$points} points.",
                $user_id,
                $final_points,
                array(
                    'scheduled_time' => current_time('mysql'),
                    'original_meta' => $meta,
                    'log_id' => $log_id,
                ),
                'success'
            );
        } else {
            Logger::log('schedule_failed', "Failed to execute scheduled action for user {$user_id}.", $user_id, 0, $meta, 'failed');
        }
    }

    /**
     * Automatically deletes old logs based on Admin Settings.
     */
    public function handle_logs_cleanup()
    {
        global $wpdb;

        // Fetch Admin Settings.
        $settings = get_option('gameengine_log_settings');
        $days = isset($settings['retention_days']) ? absint($settings['retention_days']) : 0;

        /**
         * If retention is set to 0 (Never), do nothing.
         * Otherwise, delete logs older than X days.
         */
        if ($days > 0) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- DELETE operation, caching not applicable.
            $wpdb->query(
                $wpdb->prepare(
                    "DELETE FROM {$wpdb->prefix}gameengine_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
                    $days
                )
            );
        }
    }

    /**
     * Checks for user inactivity and triggers nudge emails.
     */
    public function check_user_inactivity()
    {
        global $wpdb;

        $email_settings = get_option('gameengine_email_templates', []);
        $inactivity_days = isset($email_settings['inactivity_days']) ? absint($email_settings['inactivity_days']) : 7;

        if ($inactivity_days === 0) {
            return;
        }

        // Find users whose last log entry was exactly X days ago
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $inactive_users = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT user_id FROM {$wpdb->prefix}gameengine_logs GROUP BY user_id HAVING MAX(created_at) >= DATE_SUB(NOW(), INTERVAL %d DAY) AND MAX(created_at) < DATE_SUB(NOW(), INTERVAL %d DAY)", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $inactivity_days,
                $inactivity_days - 1
            )
        );

        if (!empty($inactive_users)) {
            $points_manager = new PointsManager();
            foreach ($inactive_users as $user_id) {
                $points_balance = $points_manager->get_points($user_id);
                // Trigger the email hook for EmailManager to pick up
                do_action('gameengine_user_inactivity_detected', $user_id, $points_balance);
            }
        }
    }
}
