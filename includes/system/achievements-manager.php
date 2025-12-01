<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Manages all achievement-related database operations.
 */
final class AchievementsManager
{
    /**
     * Unlock an achievement for a user.
     *
     * @param int    $user_id        The ID of the user.
     * @param int    $achievement_id The ID of the achievement to unlock.
     * @param string $context        The context/reason (e.g., 'trigger', 'manual', 'points_unlock').
     * @param array  $args           Additional arguments (optional).
     * @return int|false             Log ID/User Achievement ID on success, false on failure.
     */
    public function award(int $user_id, int $achievement_id, string $context = 'system', array $args = [])
    {
        global $wpdb;

        if ($user_id <= 0 || $achievement_id <= 0) {
            return false;
        }

        // 1. Check if user already has this achievement
        if ($this->has_achievement($user_id, $achievement_id)) {
            // Check max earnings logic if needed (e.g. if multi-earn is allowed)
            // For now, assuming standard achievements are earned once.
            return false;
        }

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

        // 3. Log the event in gamify_logs (Audit Trail)
        // This keeps the logging consistent with PointsManager
        $this->log_achievement_event($user_id, $achievement_id, 'award', $context);

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
            $this->log_achievement_event($user_id, $achievement_id, 'revoke', 'manual_or_penalty');
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

        return $wpdb->get_results($wpdb->prepare(
            "SELECT ua.*, a.title, a.badge_image 
             FROM {$table_user_ach} ua
             JOIN {$table_ach} a ON ua.achievement_id = a.id
             WHERE ua.user_id = %d
             ORDER BY ua.achieved_at DESC",
            $user_id
        ), ARRAY_A);
    }

    /**
     * Internal helper to log achievement events to the main audit log.
     */
    private function log_achievement_event($user_id, $achievement_id, $type, $context)
    {
        global $wpdb;
        $table_logs = $wpdb->prefix . 'gamify_logs';

        $message = ($type === 'award')
            ? "Achievement ID #{$achievement_id} unlocked."
            : "Achievement ID #{$achievement_id} revoked.";

        $wpdb->insert($table_logs, [
            'user_id'     => $user_id,
            'trigger_key' => "achievement_{$type}",
            'status'      => 'success',
            'points_awarded' => 0, // Achievements don't directly award points here usually
            'message'     => $message,
            'meta'        => json_encode(['achievement_id' => $achievement_id, 'context' => $context]),
            'created_at'  => current_time('mysql')
        ]);
    }
}
