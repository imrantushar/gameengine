<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use GameEngine\Classes\Logger;
use GameEngine\Classes\PointsManager;

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
        add_action('gameengine_points_added', [$self, 'check_achievements_on_point_change'], 10, 5);
    }

    /**
     * Check if user earned achievements based on point balance.
     */
    public function check_achievements_on_point_change($user_id, $points_added, $context, $log_id, $point_type_id)
    {
        $points_manager = new PointsManager();
        $total_points   = $points_manager->get_total($user_id, $point_type_id);

        global $wpdb;

        // Sanitize inputs for strict checking
        $safe_point_type_id = absint($point_type_id);
        $safe_total_points  = absint($total_points);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $achievements = $wpdb->get_results($wpdb->prepare(
            "SELECT id, title, max_earnings_per_user 
             FROM {$wpdb->prefix}gameengine_achievements 
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
            $max_earnings  = intval($achievement->max_earnings_per_user);
            $current_count = $this->get_user_achievement_count($user_id, (int) $achievement->id);

            if ($max_earnings > 0) {
                if ($current_count >= $max_earnings) {
                    continue;
                }
            } else {
                if ($current_count > 0) {
                    continue;
                }
            }

            $this->award($user_id, (int) $achievement->id, 'point_milestone');
        }
    }

    /**
     * Unlock an achievement for a user.
     */
    public function award(int $user_id, int $achievement_id, string $context = 'system', array $args = [])
    {
        global $wpdb;

        $safe_user_id = absint($user_id);
        $safe_ach_id  = absint($achievement_id);

        if ($safe_user_id <= 0 || $safe_ach_id <= 0) {
            return false;
        }

        $allowed = (bool) apply_filters('pre_gameengine_achievement_unlock', true, $safe_user_id, $safe_ach_id);
        if (! $allowed) {
            return false;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $achievement = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message, max_earnings_per_user FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d",
            $safe_ach_id
        ));

        if (!$achievement) {
            return false;
        }

        $max_earnings = intval($achievement->max_earnings_per_user);

        if ($max_earnings > 0) {
            $current_count = $this->get_user_achievement_count($safe_user_id, $safe_ach_id);
            if ($current_count >= $max_earnings) {
                return false;
            }
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->insert(
            $wpdb->prefix . 'gameengine_user_achievements',
            [
                'user_id'        => $safe_user_id,
                'achievement_id' => $safe_ach_id,
                'achieved_at'    => current_time('mysql'),
            ],
            ['%d', '%d', '%s']
        );

        if (! $result) {
            return false;
        }

        $user_achievement_id = $wpdb->insert_id;

        // Clear Caches
        wp_cache_delete("gameengine_ach_count_{$safe_user_id}_{$safe_ach_id}", 'gameengine');
        wp_cache_delete("gameengine_user_achs_{$safe_user_id}", 'gameengine');

        // Log
        $title        = $achievement->title;
        $congrats_msg = $achievement->congratulations_message;

        Logger::log(
            'achievement_unlocked',
            "Unlocked: {$title}",
            $safe_user_id,
            0,
            [
                'achievement_id'          => $safe_ach_id,
                'user_achievement_id'     => $user_achievement_id,
                'context'                 => sanitize_key($context),
                'congratulations_message' => $congrats_msg
            ],
            'success'
        );

        do_action('gameengine_achievement_unlocked', $safe_user_id, $safe_ach_id, $user_achievement_id);

        return $user_achievement_id;
    }

    /**
     * Get how many times a user has earned a specific achievement.
     */
    public function get_user_achievement_count(int $user_id, int $achievement_id): int
    {
        $safe_user_id = absint($user_id);
        $safe_ach_id  = absint($achievement_id);

        $cache_key = "gameengine_ach_count_{$safe_user_id}_{$safe_ach_id}";
        $count     = wp_cache_get($cache_key, 'gameengine');

        if (false === $count) {
            global $wpdb;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $count = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_user_achievements WHERE user_id = %d AND achievement_id = %d",
                $safe_user_id,
                $safe_ach_id
            ));

            wp_cache_set($cache_key, $count, 'gameengine');
        }

        return (int) $count;
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
        $safe_user_id = absint($user_id);
        $safe_ach_id  = absint($achievement_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $deleted = $wpdb->delete(
            $wpdb->prefix . 'gameengine_user_achievements',
            [
                'user_id'        => $safe_user_id,
                'achievement_id' => $safe_ach_id
            ],
            ['%d', '%d']
        );

        if ($deleted) {
            // Clear Caches
            wp_cache_delete("gameengine_ach_count_{$safe_user_id}_{$safe_ach_id}", 'gameengine');
            wp_cache_delete("gameengine_user_achs_{$safe_user_id}", 'gameengine');

            Logger::log(
                'achievement_revoked',
                "Achievement ID #{$safe_ach_id} revoked.",
                $safe_user_id,
                0,
                ['achievement_id' => $safe_ach_id, 'reason' => 'manual_or_penalty'],
                'success'
            );

            do_action('gameengine_achievement_revoked', $safe_user_id, $safe_ach_id);
            return true;
        }

        return false;
    }

    /**
     * Get all achievements for a user.
     */
    public function get_user_achievements(int $user_id): array
    {
        $safe_user_id = absint($user_id);
        $cache_key    = "gameengine_user_achs_{$safe_user_id}";
        $achievements = wp_cache_get($cache_key, 'gameengine');

        if (false === $achievements) {
            global $wpdb;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $achievements = $wpdb->get_results($wpdb->prepare(
                "SELECT ua.*, a.title, a.badge_image, a.congratulations_message 
                 FROM {$wpdb->prefix}gameengine_user_achievements ua
                 JOIN {$wpdb->prefix}gameengine_achievements a ON ua.achievement_id = a.id
                 WHERE ua.user_id = %d
                 ORDER BY ua.achieved_at DESC",
                $safe_user_id
            ), ARRAY_A);

            wp_cache_set($cache_key, $achievements, 'gameengine');
        }

        return is_array($achievements) ? $achievements : [];
    }
}
