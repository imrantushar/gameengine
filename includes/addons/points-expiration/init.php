<?php

namespace GameEngine\Addons\PointsExpiration;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Points Expiration Addon.
 * Automatically deducts points that have passed their expires_at date.
 */
class Init
{
    const CRON_HOOK = 'gameengine_expire_points';
    const ADDON_SLUG = 'points_expiration';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (in_array(self::ADDON_SLUG, $active_addons, true)) {
            self::schedule_cron();
            add_action(self::CRON_HOOK, [__CLASS__, 'run_expiration']);
        } else {
            self::clear_cron();
        }
    }

    /**
     * Schedule the daily expiration cron if not already scheduled.
     */
    public static function schedule_cron()
    {
        if (! wp_next_scheduled(self::CRON_HOOK)) {
            wp_schedule_event(time(), 'daily', self::CRON_HOOK);
        }
    }

    /**
     * Remove the scheduled cron when addon is disabled.
     */
    public static function clear_cron()
    {
        $timestamp = wp_next_scheduled(self::CRON_HOOK);
        if ($timestamp) {
            wp_unschedule_event($timestamp, self::CRON_HOOK);
        }
    }

    /**
     * Process expired points. Called by cron or WP-CLI.
     *
     * @param bool $dry_run When true, returns counts without making DB changes.
     * @return array Summary: [users_affected, points_expired]
     */
    public static function run_expiration(bool $dry_run = false): array
    {
        global $wpdb;

        $now   = current_time('mysql');
        $table = $wpdb->prefix . 'gameengine_points_log';

        // Fetch all unprocessed expired rows grouped by user/point_type.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT user_id, point_type_id, SUM(points) AS expiring_points, GROUP_CONCAT(id) AS row_ids
             FROM {$table}
             WHERE points > 0
               AND expires_at IS NOT NULL
               AND expires_at <= %s
               AND expired = 0
             GROUP BY user_id, point_type_id",
            $now
        ), ARRAY_A);

        if (empty($rows)) {
            return ['users_affected' => 0, 'points_expired' => 0];
        }

        $users_affected = 0;
        $points_expired = 0;

        foreach ($rows as $row) {
            $user_id       = (int) $row['user_id'];
            $point_type_id = (int) $row['point_type_id'];
            $due           = (int) $row['expiring_points'];
            $ids           = array_map('intval', explode(',', $row['row_ids']));

            if ($dry_run) {
                $users_affected++;
                $points_expired += $due;
                continue;
            }

            // Get current balance; deduct only what is available.
            $points_manager = new \GameEngine\Classes\PointsManager();
            $current        = $points_manager->get_total($user_id, $point_type_id);
            $to_deduct      = min($due, max(0, $current));

            // Mark all expired rows as processed regardless of balance.
            $placeholders = implode(',', array_fill(0, count($ids), '%d'));
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $wpdb->query($wpdb->prepare(
                "UPDATE {$table} SET expired = 1 WHERE id IN ({$placeholders})",
                ...$ids
            ));

            if ($to_deduct > 0) {
                $points_manager->deduct(
                    $user_id,
                    $to_deduct,
                    'expiration',
                    [
                        'point_type_id' => $point_type_id,
                        'description'   => __('Points expired', 'gameengine'),
                    ]
                );
                $points_expired += $to_deduct;
            }

            $users_affected++;
        }

        return compact('users_affected', 'points_expired');
    }
}

Init::init();
