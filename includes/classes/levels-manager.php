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
     * Hooks into point changes to automatically check for level ups.
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

        if ($user_id <= 0 || $level_id <= 0) return false;

        // 1. Check if user already has this level
        if ($this->has_level($user_id, $level_id)) {
            return false;
        }

        // 2. Fetch Level Details (For Message & Title)
        $table_levels = $wpdb->prefix . 'gamify_levels';
        $level = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message FROM {$table_levels} WHERE id = %d",
            $level_id
        ));

        if (!$level) return false;

        // 3. Insert into User Levels Table
        $table_user_levels = $wpdb->prefix . 'gamify_user_levels';
        $result = $wpdb->insert($table_user_levels, [
            'user_id'     => $user_id,
            'level_id'    => $level_id,
            'achieved_at' => current_time('mysql'),
        ], ['%d', '%d', '%s']);

        if (!$result) return false;

        $user_level_id = $wpdb->insert_id;

        // 4. Log to System (With Congratulation Message)
        Logger::log(
            'level_up',
            "Level Up: {$level->title}",
            $user_id,
            0,
            [
                'level_id'                => $level_id,
                'user_level_id'           => $user_level_id,
                'context'                 => $context,
                'congratulations_message' => $level->congratulations_message
            ],
            'success'
        );

        // 5. Fire Hook (For Emails/Notifications)
        do_action('gamify_level_awarded', $user_id, $level_id, $user_level_id);

        return $user_level_id;
    }

    /**
     * Check if user should level up based on points.
     * Hooked to 'gamify_points_added' and 'deducted'.
     */
    public function check_levels_on_point_change($user_id, $points, $context, $log_id, $point_type_id)
    {
        $points_manager = new PointsManager();
        $total_points = $points_manager->get_total($user_id, $point_type_id);

        global $wpdb;
        $table_levels = $wpdb->prefix . 'gamify_levels';

        $levels = $wpdb->get_results($wpdb->prepare(
            "SELECT id, min_points, priority FROM {$table_levels} 
             WHERE point_type_id = %d AND unlock_with_points_enabled = 1 
             ORDER BY priority ASC, min_points ASC",
            $point_type_id
        ));

        if (empty($levels)) return;

        foreach ($levels as $level) {
            if ($total_points >= $level->min_points) {
                if ($this->has_level($user_id, $level->id)) {
                    continue; // Skip if already awarded
                }

                // Award Level
                $this->award($user_id, $level->id, 'point_milestone');
            }
        }
    }

    /**
     * Check if user has a specific level.
     */
    public function has_level($user_id, $level_id)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_user_levels';
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table} WHERE user_id = %d AND level_id = %d",
            $user_id,
            $level_id
        ));
        return !empty($exists);
    }

    /**
     * Get Current Top Level of User.
     */
    public function get_current_level($user_id)
    {
        global $wpdb;
        $table_ul = $wpdb->prefix . 'gamify_user_levels';
        $table_l  = $wpdb->prefix . 'gamify_levels';

        return $wpdb->get_row($wpdb->prepare(
            "SELECT l.* FROM {$table_l} l
             JOIN {$table_ul} ul ON l.id = ul.level_id
             WHERE ul.user_id = %d
             ORDER BY l.priority DESC, l.min_points DESC
             LIMIT 1",
            $user_id
        ));
    }
}
