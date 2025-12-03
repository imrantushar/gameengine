<?php

namespace Gamify\Classes;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\Logger;

/**
 * Manages all achievement-related database operations.
 */
class AchievementsManager
{
    /**
     * Unlock an achievement for a user.
     *
     * @param int    $user_id        The ID of the user.
     * @param int    $achievement_id The ID of the achievement to unlock.
     * @param string $context        The context/reason (e.g., 'trigger', 'manual', 'points_unlock').
     * @param array  $args           Additional arguments (optional).
     * @return int|false             User Achievement ID on success, false on failure.
     */
    public function award(int $user_id, int $achievement_id, string $context = 'system', array $args = [])
    {
        global $wpdb;

        if ($user_id <= 0 || $achievement_id <= 0) {
            return false;
        }

        // 1. Check if user already has this achievement
        if ($this->has_achievement($user_id, $achievement_id)) {
            return false;
        }

        $table_achievements = $wpdb->prefix . 'gamify_achievements';
        $achievement = $wpdb->get_row($wpdb->prepare(
            "SELECT title, congratulations_message FROM {$table_achievements} WHERE id = %d",
            $achievement_id
        ));

        $congrats_msg = $achievement ? $achievement->congratulations_message : '';
        $title = $achievement ? $achievement->title : "Achievement #{$achievement_id}";

        // 2. Insert into User Achievements Table
        $table = $wpdb->prefix . 'gamify_user_achievements';

        $result = $wpdb->insert($table, [
            'user_id'        => $user_id,
            'achievement_id' => $achievement_id,
            'achieved_at'    => current_time('mysql'),
        ], ['%d', '%d', '%s']);

        if (! $result) {
            return false;
        }

        $user_achievement_id = $wpdb->insert_id;

        // 3. Log the event using our centralized Logger class
        Logger::log(
            'achievement_unlocked',
            "Achievement ID #{$achievement_id} unlocked.",
            $user_id,
            0, // Achievements usually don't have direct points here, separate transaction handles points
            [
                'achievement_id'      => $achievement_id,
                'user_achievement_id' => $user_achievement_id,
                'context'             => $context,
                'args'                => $args,
                'congratulations_message' => $congrats_msg
            ],
            'success'
        );

        // 4. Fire Action Hook (for notifications, emails, etc.)
        do_action('gamify_achievement_unlocked', $user_id, $achievement_id, $user_achievement_id);

        return $user_achievement_id;
    }

    /**
     * Revoke an achievement from a user.
     *
     * @param int $user_id
     * @param int $achievement_id
     * @return bool
     */
    public function revoke(int $user_id, int $achievement_id)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_user_achievements';

        $deleted = $wpdb->delete($table, [
            'user_id'        => $user_id,
            'achievement_id' => $achievement_id
        ], ['%d', '%d']);

        if ($deleted) {
            // Log the revocation using Logger
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
     * Check if a user has a specific achievement.
     *
     * @param int $user_id
     * @param int $achievement_id
     * @return bool
     */
    public function has_achievement(int $user_id, int $achievement_id): bool
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_user_achievements';

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table} WHERE user_id = %d AND achievement_id = %d",
            $user_id,
            $achievement_id
        ));

        return !empty($exists);
    }

    /**
     * Get all achievements earned by a user.
     *
     * @param int $user_id
     * @return array
     */
    public function get_user_achievements(int $user_id): array
    {
        global $wpdb;
        $table_user_ach = $wpdb->prefix . 'gamify_user_achievements';
        $table_ach      = $wpdb->prefix . 'gamify_achievements';

        // Join to get achievement details (Title, Badge, etc.)
        return $wpdb->get_results($wpdb->prepare(
            "SELECT ua.*, a.title, a.badge_image 
             FROM {$table_user_ach} ua
             JOIN {$table_ach} a ON ua.achievement_id = a.id
             WHERE ua.user_id = %d
             ORDER BY ua.achieved_at DESC",
            $user_id
        ), ARRAY_A);
    }
}
