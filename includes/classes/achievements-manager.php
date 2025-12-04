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
     * Hooks into point changes to check for "Unlock with Points" achievements.
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

        // 1. Fetch ID AND Max Earnings from DB
        $achievements = $wpdb->get_results($wpdb->prepare(
            "SELECT id, title, max_earnings_per_user 
             FROM {$table} 
             WHERE unlock_with_points_enabled = 1 
             AND required_point_type_id = %d 
             AND required_points_amount <= %d",
            $point_type_id,
            $total_points
        ));

        if (empty($achievements)) return;

        foreach ($achievements as $achievement) {
            $max_earnings = intval($achievement->max_earnings_per_user);

            // 🔥 CRITICAL FIX START: Check count against limit instead of just existence
            $current_count = $this->get_user_achievement_count($user_id, $achievement->id);

            // Case A: Limited (e.g., 2 times)
            if ($max_earnings > 0) {
                if ($current_count >= $max_earnings) {
                    continue; // Limit reached, skip.
                }
            }
            // Case B: Unlimited (0) - For Point Milestones (Unlock with Points)
            // Warning: If unlimited, user gets this achievement on EVERY point transaction after crossing threshold.
            // Usually, milestones are One-Time by default if 0. 
            // But to respect your "Unlimited" request, we allow it (use with caution).
            else {
                // If you want Milestones to be strictly 1-time if max is 0:
                if ($current_count > 0) {
                    continue;
                }
            }
            // 🔥 CRITICAL FIX END

            // Award the achievement
            $this->award($user_id, $achievement->id, 'point_milestone');
        }
    }

    /**
     * Unlock an achievement for a user.
     */
    public function award(int $user_id, int $achievement_id, string $context = 'system', array $args = [])
    {
        global $wpdb;

        if ($user_id <= 0 || $achievement_id <= 0) {
            return false;
        }

        // --- STEP 1: Fetch Achievement Details ---
        $table_achievements = $wpdb->prefix . 'gamify_achievements';
        $achievement = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message, max_earnings_per_user FROM {$table_achievements} WHERE id = %d",
            $achievement_id
        ));

        if (!$achievement) return false;

        // --- STEP 2: Check Maximum Earnings Limit ---
        $max_earnings = intval($achievement->max_earnings_per_user);

        // If max earnings is set (>0), verify count
        if ($max_earnings > 0) {
            $current_count = $this->get_user_achievement_count($user_id, $achievement_id);
            if ($current_count >= $max_earnings) {
                return false; // Limit reached
            }
        }

        // --- STEP 3: Insert into User Achievements Table ---
        $table_user_achievements = $wpdb->prefix . 'gamify_user_achievements';

        $result = $wpdb->insert($table_user_achievements, [
            'user_id'        => $user_id,
            'achievement_id' => $achievement_id,
            'achieved_at'    => current_time('mysql'),
        ], ['%d', '%d', '%s']);

        if (! $result) {
            return false;
        }

        $user_achievement_id = $wpdb->insert_id;

        // --- STEP 4: Log ---
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
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_user_achievements';

        $count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$table} WHERE user_id = %d AND achievement_id = %d",
            $user_id,
            $achievement_id
        ));

        return (int) $count;
    }

    /**
     * Check if user has at least one of this achievement.
     */
    public function has_achievement(int $user_id, int $achievement_id): bool
    {
        return $this->get_user_achievement_count($user_id, $achievement_id) > 0;
    }

    public function revoke(int $user_id, int $achievement_id)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_user_achievements';

        $deleted = $wpdb->delete($table, [
            'user_id'        => $user_id,
            'achievement_id' => $achievement_id
        ], ['%d', '%d']);

        if ($deleted) {
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

    public function get_user_achievements(int $user_id): array
    {
        global $wpdb;
        $table_user_ach = $wpdb->prefix . 'gamify_user_achievements';
        $table_ach      = $wpdb->prefix . 'gamify_achievements';

        return $wpdb->get_results($wpdb->prepare(
            "SELECT ua.*, a.title, a.badge_image, a.congratulations_message 
             FROM {$table_user_ach} ua
             JOIN {$table_ach} a ON ua.achievement_id = a.id
             WHERE ua.user_id = %d
             ORDER BY ua.achieved_at DESC",
            $user_id
        ), ARRAY_A);
    }
}
