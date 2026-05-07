<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

use GameEngine\Classes\Logger;
use GameEngine\Classes\PointsManager;

/**
 * Manages Level logic, awarding, and point-based checking.
 */
class LevelsManager
{
    /**
     * Initialize Level System.
     */
    public static function init()
    {
        $self = new self();
        add_action('gameengine_points_added', [$self, 'check_levels_on_point_change'], 10, 5);
        add_action('gameengine_points_deducted', [$self, 'check_levels_on_point_change'], 10, 5);
    }

    /**
     * Award a level to a user.
     *
     * @param int    $user_id
     * @param int    $level_id
     * @param string $context
     * @return int|false Level Log ID or false
     */
    public function award(int $user_id, int $level_id, string $context = 'system')
    {
        global $wpdb;

        $safe_user_id = absint($user_id);
        $safe_level_id = absint($level_id);

        if ($safe_user_id <= 0 || $safe_level_id <= 0) {
            return false;
        }

        // Check if user already has this level
        if ($this->has_level($safe_user_id, $safe_level_id)) {
            return false;
        }

        // Fetch Level Details
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $level = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message FROM {$wpdb->prefix}gameengine_levels WHERE id = %d",
            $safe_level_id
        ));

        if (!$level) {
            return false;
        }

        // Insert into User Levels Table
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->insert(
            $wpdb->prefix . 'gameengine_user_levels',
            [
                'user_id' => $safe_user_id,
                'level_id' => $safe_level_id,
                'achieved_at' => current_time('mysql'),
            ],
            ['%d', '%d', '%s']
        );

        if (!$result) {
            return false;
        }

        $user_level_id = $wpdb->insert_id;

        // Clear Caches
        wp_cache_delete("gameengine_all_levels_{$safe_user_id}", 'gameengine');
        wp_cache_delete("gameengine_current_level_{$safe_user_id}", 'gameengine');

        // Log to System
        Logger::log(
            'level_up',
            "Level Up: {$level->title}",
            $safe_user_id,
            0,
            [
                'level_id' => $safe_level_id,
                'user_level_id' => $user_level_id,
                'context' => sanitize_key($context),
                'congratulations_message' => $level->congratulations_message
            ],
            'success'
        );

        // Fire Hook
        do_action('gameengine_level_awarded', $safe_user_id, $safe_level_id, $user_level_id);

        return $user_level_id;
    }

    /**
     * Check if user should level up based on points.
     */
    public function check_levels_on_point_change($user_id, $points, $context, $log_id, $point_type_id)
    {
        $points_manager = new PointsManager();
        $safe_user_id = absint($user_id);
        $safe_pt_id = absint($point_type_id);
        $total_points = $points_manager->get_total($safe_user_id, $safe_pt_id);

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $levels = $wpdb->get_results($wpdb->prepare(
            "SELECT id, min_points, priority FROM {$wpdb->prefix}gameengine_levels 
             WHERE point_type_id = %d AND unlock_with_points_enabled = 1 
             ORDER BY priority ASC, min_points ASC",
            $safe_pt_id
        ));

        if (empty($levels)) {
            return;
        }

        foreach ($levels as $level) {
            if ($total_points >= (int) $level->min_points) {
                if ($this->has_level($safe_user_id, (int) $level->id)) {
                    continue;
                }
                $this->award($safe_user_id, (int) $level->id, 'point_milestone');
            }
        }
    }

    /**
     * Check if user has a specific level.
     */
    public function has_level($user_id, $level_id)
    {
        global $wpdb;
        $safe_user_id = absint($user_id);
        $safe_level_id = absint($level_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gameengine_user_levels WHERE user_id = %d AND level_id = %d",
            $safe_user_id,
            $safe_level_id
        ));
        return !empty($exists);
    }

    /**
     * Revoke a level from a user.
     */
    public function revoke(int $user_id, int $level_id): bool
    {
        global $wpdb;
        $safe_user_id  = absint($user_id);
        $safe_level_id = absint($level_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $deleted = $wpdb->delete(
            $wpdb->prefix . 'gameengine_user_levels',
            ['user_id' => $safe_user_id, 'level_id' => $safe_level_id],
            ['%d', '%d']
        );

        if ($deleted) {
            wp_cache_delete("gameengine_all_levels_{$safe_user_id}", 'gameengine');
            wp_cache_delete("gameengine_current_level_{$safe_user_id}", 'gameengine');
            do_action('gameengine_level_revoked', $safe_user_id, $safe_level_id);
            return true;
        }

        return false;
    }

    /**
     * Get Current Top Level of User.
     */
    public function get_current_level($user_id)
    {
        $safe_user_id = absint($user_id);
        $cache_key = "gameengine_current_level_{$safe_user_id}";
        $level = wp_cache_get($cache_key, 'gameengine');

        if (false === $level) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $level = $wpdb->get_row($wpdb->prepare(
                "SELECT l.* 
                 FROM {$wpdb->prefix}gameengine_levels l
                 JOIN {$wpdb->prefix}gameengine_user_levels ul ON l.id = ul.level_id
                 WHERE ul.user_id = %d
                 ORDER BY l.priority DESC, l.min_points DESC, ul.achieved_at DESC
                 LIMIT 1",
                $safe_user_id
            ));

            wp_cache_set($cache_key, $level, 'gameengine');
        }

        return $level;
    }

    /**
     * Get ALL Earned Levels of User.
     */
    public function get_all_user_levels($user_id)
    {
        $safe_user_id = absint($user_id);
        $cache_key = "gameengine_all_levels_{$safe_user_id}";
        $levels = wp_cache_get($cache_key, 'gameengine');

        if (false === $levels) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $levels = $wpdb->get_results($wpdb->prepare(
                "SELECT l.* 
                 FROM {$wpdb->prefix}gameengine_levels l
                 JOIN {$wpdb->prefix}gameengine_user_levels ul ON l.id = ul.level_id
                 WHERE ul.user_id = %d
                 ORDER BY ul.achieved_at ASC",
                $safe_user_id
            ));

            wp_cache_set($cache_key, $levels, 'gameengine');
        }

        return is_array($levels) ? $levels : [];
    }

    /**
     * Get the next available level for a user.
     */
    public function get_next_level($user_id, $point_type_id)
    {
        global $wpdb;
        $points_manager = new PointsManager();
        $safe_user_id = absint($user_id);
        $safe_pt_id = absint($point_type_id);

        $total_points = $points_manager->get_total($safe_user_id, $safe_pt_id);

        // Find levels the user hasn't achieved yet for this point type
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $next_level = $wpdb->get_row($wpdb->prepare(
            "SELECT l.* 
             FROM {$wpdb->prefix}gameengine_levels l
             LEFT JOIN {$wpdb->prefix}gameengine_user_levels ul ON l.id = ul.level_id AND ul.user_id = %d
             WHERE l.point_type_id = %d AND l.unlock_with_points_enabled = 1 AND ul.id IS NULL
             ORDER BY l.priority ASC, l.min_points ASC
             LIMIT 1",
            $safe_user_id,
            $safe_pt_id
        ));

        if (!$next_level) {
            return null;
        }

        $points_needed = max(0, (int) $next_level->min_points - $total_points);

        // Find current level (or start from 0) to calculate progress %
        $current_level = $this->get_current_level($safe_user_id);
        $start_points = $current_level ? (int) $current_level->min_points : 0;

        $range = (int) $next_level->min_points - $start_points;
        $progress_points = $total_points - $start_points;
        $progress_pc = ($range > 0) ? min(100, max(0, round(($progress_points / $range) * 100))) : 0;

        return [
            'level' => $next_level,
            'points_needed' => $points_needed,
            'progress_pc' => $progress_pc,
            'total_points' => $total_points
        ];
    }

    /**
     * Get all levels with unlocked status.
     */
    public function get_all_levels_with_status($user_id, $point_type_id = null)
    {
        global $wpdb;
        $safe_user_id = absint($user_id);

        if ($point_type_id) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $levels = $wpdb->get_results($wpdb->prepare(
                "SELECT l.*, ul.achieved_at as achieved_at, (CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END) as unlocked
                 FROM {$wpdb->prefix}gameengine_levels l
                 LEFT JOIN {$wpdb->prefix}gameengine_user_levels ul ON l.id = ul.level_id AND ul.user_id = %d
                 WHERE l.point_type_id = %d
                 ORDER BY l.priority ASC, l.min_points ASC",
                $safe_user_id,
                absint($point_type_id)
            ));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $levels = $wpdb->get_results($wpdb->prepare(
                "SELECT l.*, ul.achieved_at as achieved_at, (CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END) as unlocked
                 FROM {$wpdb->prefix}gameengine_levels l
                 LEFT JOIN {$wpdb->prefix}gameengine_user_levels ul ON l.id = ul.level_id AND ul.user_id = %d
                 ORDER BY l.priority ASC, l.min_points ASC",
                $safe_user_id
            ));
        }

        return $levels;
    }
}
