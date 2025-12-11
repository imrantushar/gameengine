<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\Logger;
use Gamify\Classes\PointsManager;

/**
 * Manages all achievement-related database operations.
 */
class AchievementsManager
{
    /**
     * Initialize Achievement System.
     */
    public static function init()
    {
        $self = new self();
        add_action('gamify_points_added', [$self, 'check_achievements_on_point_change'], 10, 5);
    }

    /**
     * Check if user earned achievements based on point balance.
     */
    public function check_achievements_on_point_change($user_id, $points_added, $context, $log_id, $point_type_id)
    {
        $points_manager = new PointsManager();
        $total_points = $points_manager->get_total($user_id, $point_type_id);

        global $wpdb;
        $table = $wpdb->prefix . 'gamify_achievements';

        // Sanitize inputs for strict checking
        $safe_point_type_id = absint($point_type_id);
        $safe_total_points  = absint($total_points);

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $achievements = $wpdb->get_results($wpdb->prepare(
            "SELECT id, title, max_earnings_per_user 
             FROM {$table} 
             WHERE unlock_with_points_enabled = 1 
             AND required_point_type_id = %d 
             AND required_points_amount <= %d",
            $safe_point_type_id,
            $safe_total_points
        ));

        if (empty($achievements)) {
            return;
        }

        foreach ($achievements as $achievement) {
            $max_earnings = intval($achievement->max_earnings_per_user);
            $current_count = $this->get_user_achievement_count($user_id, $achievement->id);

            if ($max_earnings > 0) {
                if ($current_count >= $max_earnings) {
                    continue;
                }
            } else {
                if ($current_count > 0) {
                    continue;
                }
            }

            $this->award($user_id, $achievement->id, 'point_milestone');
        }
    }

    /**
     * Unlock an achievement for a user.
     */
    public function award(int $user_id, int $achievement_id, string $context = 'system', array $args = [])
    {
        global $wpdb;

        $user_id = absint($user_id);
        $achievement_id = absint($achievement_id);

        if ($user_id <= 0 || $achievement_id <= 0) {
            return false;
        }

        $table_achievements = $wpdb->prefix . 'gamify_achievements';

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $achievement = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message, max_earnings_per_user FROM {$table_achievements} WHERE id = %d",
            $achievement_id
        ));

        if (!$achievement) {
            return false;
        }

        $max_earnings = intval($achievement->max_earnings_per_user);

        if ($max_earnings > 0) {
            $current_count = $this->get_user_achievement_count($user_id, $achievement_id);
            if ($current_count >= $max_earnings) {
                return false;
            }
        }

        $table_user_achievements = $wpdb->prefix . 'gamify_user_achievements';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $result = $wpdb->insert(
            $table_user_achievements,
            [
                'user_id'        => $user_id,
                'achievement_id' => $achievement_id,
                'achieved_at'    => current_time('mysql'),
            ],
            ['%d', '%d', '%s']
        );

        if (! $result) {
            return false;
        }

        $user_achievement_id = $wpdb->insert_id;

        // Clear Caches
        wp_cache_delete("gamify_ach_count_{$user_id}_{$achievement_id}", 'gamify');
        wp_cache_delete("gamify_user_achs_{$user_id}", 'gamify');

        // Log
        $title = $achievement->title;
        $congrats_msg = $achievement->congratulations_message;

        Logger::log(
            'achievement_unlocked',
            "Unlocked: {$title}",
            $user_id,
            0,
            [
                'achievement_id'      => $achievement_id,
                'user_achievement_id' => $user_achievement_id,
                'context'             => $context,
                'congratulations_message' => $congrats_msg
            ],
            'success'
        );

        do_action('gamify_achievement_unlocked', $user_id, $achievement_id, $user_achievement_id);

        return $user_achievement_id;
    }

    /**
     * Get how many times a user has earned a specific achievement.
     */
    public function get_user_achievement_count(int $user_id, int $achievement_id): int
    {
        $user_id = absint($user_id);
        $achievement_id = absint($achievement_id);

        $cache_key = "gamify_ach_count_{$user_id}_{$achievement_id}";
        $count = wp_cache_get($cache_key, 'gamify');

        if (false === $count) {
            global $wpdb;
            $table = $wpdb->prefix . 'gamify_user_achievements';

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
            $count = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$table} WHERE user_id = %d AND achievement_id = %d",
                $user_id,
                $achievement_id
            ));

            wp_cache_set($cache_key, $count, 'gamify');
        }

        return $count;
    }

    /**
     * Check if user has at least one of this achievement.
     */
    public function has_achievement(int $user_id, int $achievement_id): bool
    {
        return $this->get_user_achievement_count($user_id, $achievement_id) > 0;
    }

    /**
     * Revoke an achievement.
     */
    public function revoke(int $user_id, int $achievement_id)
    {
        global $wpdb;
        $user_id = absint($user_id);
        $achievement_id = absint($achievement_id);
        $table = $wpdb->prefix . 'gamify_user_achievements';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $deleted = $wpdb->delete(
            $table,
            [
                'user_id'        => $user_id,
                'achievement_id' => $achievement_id
            ],
            ['%d', '%d']
        );

        if ($deleted) {
            // Clear Caches
            wp_cache_delete("gamify_ach_count_{$user_id}_{$achievement_id}", 'gamify');
            wp_cache_delete("gamify_user_achs_{$user_id}", 'gamify');

            Logger::log(
                'achievement_revoked',
                "Achievement ID #{$achievement_id} revoked.",
                $user_id,
                0,
                ['achievement_id' => $achievement_id, 'reason' => 'manual_or_penalty'],
                'success'
            );

            do_action('gamify_achievement_revoked', $user_id, $achievement_id);
            return true;
        }

        return false;
    }

    /**
     * Get all achievements for a user.
     */
    public function get_user_achievements(int $user_id): array
    {
        $user_id = absint($user_id);
        $cache_key = "gamify_user_achs_{$user_id}";
        $achievements = wp_cache_get($cache_key, 'gamify');

        if (false === $achievements) {
            global $wpdb;
            $table_user_ach = $wpdb->prefix . 'gamify_user_achievements';
            $table_ach      = $wpdb->prefix . 'gamify_achievements';

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
            $achievements = $wpdb->get_results($wpdb->prepare(
                "SELECT ua.*, a.title, a.badge_image, a.congratulations_message 
                 FROM {$table_user_ach} ua
                 JOIN {$table_ach} a ON ua.achievement_id = a.id
                 WHERE ua.user_id = %d
                 ORDER BY ua.achieved_at DESC",
                $user_id
            ), ARRAY_A);

            wp_cache_set($cache_key, $achievements, 'gamify');
        }

        return $achievements;
    }
}
