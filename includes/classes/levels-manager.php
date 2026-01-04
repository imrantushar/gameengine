<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\Logger;
use Gamify\Classes\PointsManager;

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
        add_action('gamify_points_added', [$self, 'check_levels_on_point_change'], 10, 5);
        add_action('gamify_points_deducted', [$self, 'check_levels_on_point_change'], 10, 5);
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

        $safe_user_id  = absint($user_id);
        $safe_level_id = absint($level_id);

        if ($safe_user_id <= 0 || $safe_level_id <= 0) {
            return false;
        }

        // 1. Check if user already has this level
        if ($this->has_level($safe_user_id, $safe_level_id)) {
            return false;
        }

        // 2. Fetch Level Details
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $level = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message FROM {$wpdb->prefix}gamify_levels WHERE id = %d",
            $safe_level_id
        ));

        if (!$level) {
            return false;
        }

        // 3. Insert into User Levels Table
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->insert(
            $wpdb->prefix . 'gamify_user_levels',
            [
                'user_id'     => $safe_user_id,
                'level_id'    => $safe_level_id,
                'achieved_at' => current_time('mysql'),
            ],
            ['%d', '%d', '%s']
        );

        if (!$result) {
            return false;
        }

        $user_level_id = $wpdb->insert_id;

        // Clear Caches
        wp_cache_delete("gamify_all_levels_{$safe_user_id}", 'gamify');
        wp_cache_delete("gamify_current_level_{$safe_user_id}", 'gamify');

        // 4. Log to System
        Logger::log(
            'level_up',
            "Level Up: {$level->title}",
            $safe_user_id,
            0,
            [
                'level_id'                => $safe_level_id,
                'user_level_id'           => $user_level_id,
                'context'                 => sanitize_key($context),
                'congratulations_message' => $level->congratulations_message
            ],
            'success'
        );

        // 5. Fire Hook
        do_action('gamify_level_awarded', $safe_user_id, $safe_level_id, $user_level_id);

        return $user_level_id;
    }

    /**
     * Check if user should level up based on points.
     */
    public function check_levels_on_point_change($user_id, $points, $context, $log_id, $point_type_id)
    {
        $points_manager = new PointsManager();
        $safe_user_id   = absint($user_id);
        $safe_pt_id     = absint($point_type_id);
        $total_points   = $points_manager->get_total($safe_user_id, $safe_pt_id);

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $levels = $wpdb->get_results($wpdb->prepare(
            "SELECT id, min_points, priority FROM {$wpdb->prefix}gamify_levels 
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
        $safe_user_id  = absint($user_id);
        $safe_level_id = absint($level_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d AND level_id = %d",
            $safe_user_id,
            $safe_level_id
        ));
        return ! empty($exists);
    }

    /**
     * Get Current Top Level of User.
     */
    public function get_current_level($user_id)
    {
        $safe_user_id = absint($user_id);
        $cache_key    = "gamify_current_level_{$safe_user_id}";
        $level        = wp_cache_get($cache_key, 'gamify');

        if (false === $level) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $level = $wpdb->get_row($wpdb->prepare(
                "SELECT l.* 
                 FROM {$wpdb->prefix}gamify_levels l
                 JOIN {$wpdb->prefix}gamify_user_levels ul ON l.id = ul.level_id
                 WHERE ul.user_id = %d
                 ORDER BY l.priority DESC, l.min_points DESC, ul.achieved_at DESC
                 LIMIT 1",
                $safe_user_id
            ));

            wp_cache_set($cache_key, $level, 'gamify');
        }

        return $level;
    }

    /**
     * Get ALL Earned Levels of User.
     */
    public function get_all_user_levels($user_id)
    {
        $safe_user_id = absint($user_id);
        $cache_key    = "gamify_all_levels_{$safe_user_id}";
        $levels       = wp_cache_get($cache_key, 'gamify');

        if (false === $levels) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $levels = $wpdb->get_results($wpdb->prepare(
                "SELECT l.* 
                 FROM {$wpdb->prefix}gamify_levels l
                 JOIN {$wpdb->prefix}gamify_user_levels ul ON l.id = ul.level_id
                 WHERE ul.user_id = %d
                 ORDER BY ul.achieved_at ASC",
                $safe_user_id
            ));

            wp_cache_set($cache_key, $levels, 'gamify');
        }

        return is_array($levels) ? $levels : [];
    }
}
