<?php

namespace GameEngine\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Restriction_Helper
 * Handles logic for content access verification.
 */
class Restriction_Helper
{

    /**
     * Verify if the current user can access specific content.
     */
    public static function can_access($type, $value)
    {
        // Bypass check for Admins.
        if (apply_filters('gameengine_restrict_content_bypass_admin', current_user_can('manage_options'))) {
            return true;
        }

        $user_id = get_current_user_id();

        // Block guests if any restriction is active.
        if (! $user_id) {
            return false;
        }

        switch ($type) {
            case 'points':
                if (class_exists('\GameEngine\Classes\PointsManager')) {
                    $points_manager = new \GameEngine\Classes\PointsManager();
                    $user_points    = (int) $points_manager->get_grand_total($user_id);
                    return $user_points >= (int) $value;
                }
                break;

            case 'achievement':
                return self::check_achievement_access($user_id, absint($value));

            case 'level':
                return self::check_level_access($user_id, absint($value));
        }

        return true;
    }

    /**
     * Verify achievement access, with the same points-threshold fallback as
     * levels (see check_level_access() below) — a point-unlockable achievement
     * whose `required_points_amount` the user's balance already meets counts as
     * earned even if `gameengine_user_achievements` was never written (points
     * earned before the achievement existed, a missed `gameengine_points_added`
     * milestone hook, or a point-type mismatch in that milestone check).
     */
    private static function check_achievement_access($user_id, $achievement_id)
    {
        if (! class_exists('\GameEngine\Classes\AchievementsManager')) {
            return true;
        }

        $ach_manager = new \GameEngine\Classes\AchievementsManager();
        if ($ach_manager->has_achievement($user_id, $achievement_id)) {
            return true;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $required = $wpdb->get_row($wpdb->prepare("SELECT required_point_type_id, required_points_amount, unlock_with_points_enabled FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", $achievement_id));

        if (! $required) {
            return true;
        }

        if (1 !== (int) $required->unlock_with_points_enabled || ! class_exists('\GameEngine\Classes\PointsManager')) {
            return false;
        }

        $points_manager = new \GameEngine\Classes\PointsManager();
        $point_type_id  = (int) $required->required_point_type_id;
        $user_points    = $point_type_id > 0
            ? (int) $points_manager->get_total($user_id, $point_type_id)
            : (int) $points_manager->get_grand_total($user_id);

        return $user_points >= (int) $required->required_points_amount;
    }

    /**
     * Verify access based on level priority with caching.
     *
     * A user passes when EITHER:
     *   1. they have an explicitly awarded level whose priority is >= the
     *      required level's priority, OR
     *   2. the required level is point-unlockable and the user's point balance
     *      for its point type already meets its `min_points` threshold.
     *
     * Case 2 is the fallback that keeps this gate honest: points can be earned
     * before the level (or this addon) existed, the `gameengine_points_added`
     * milestone hook can be missed, or the milestone check can run against a
     * different point type — in all of those the `gameengine_user_levels` row
     * is never written even though the user has clearly "reached" the level.
     * Without this, a course locked behind "Min Level" stays locked for a user
     * GameEngine's own "points to next level" UI shows as already past it.
     */
    private static function check_level_access($user_id, $required_level_id)
    {
        global $wpdb;

        $cache_key = "gf_access_lvl_{$user_id}_{$required_level_id}";
        $access    = wp_cache_get($cache_key, 'gameengine');

        if (false !== $access) {
            return (bool) $access;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $required = $wpdb->get_row($wpdb->prepare("SELECT priority, min_points, point_type_id, unlock_with_points_enabled FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", $required_level_id));

        // Unknown / deleted level — nothing to gate against.
        if (! $required) {
            wp_cache_set($cache_key, 1, 'gameengine', 60);
            return true;
        }

        // 1. Explicitly awarded level outranks (or equals) the required one.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $current_priority = $wpdb->get_var($wpdb->prepare("SELECT l.priority FROM {$wpdb->prefix}gameengine_user_levels ul JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id WHERE ul.user_id = %d ORDER BY l.priority DESC LIMIT 1", $user_id));

        $access = null !== $current_priority && (int) $current_priority >= (int) $required->priority;

        // 2. Points fallback for point-unlockable levels.
        if (! $access && 1 === (int) $required->unlock_with_points_enabled && class_exists('\GameEngine\Classes\PointsManager')) {
            $points_manager = new \GameEngine\Classes\PointsManager();
            $point_type_id  = (int) $required->point_type_id;
            $user_points    = $point_type_id > 0
                ? (int) $points_manager->get_total($user_id, $point_type_id)
                : (int) $points_manager->get_grand_total($user_id);

            $access = $user_points >= (int) $required->min_points;
        }

        wp_cache_set($cache_key, $access ? 1 : 0, 'gameengine', 60);

        return (bool) $access;
    }

    /**
     * Renders the locked UI. When the admin left the "Lock Message" field
     * blank, builds a default that names the actual requirement ($type /
     * $value) instead of a generic "complete requirements" sentence.
     */
    public static function get_locked_ui($message, $type = '', $value = '')
    {
        $msg = ! empty($message) ? $message : self::get_default_lock_message($type, $value);
        ob_start();
?>
        <div class="gameengine-restriction-box">
            <div class="gf-lock-icon" aria-hidden="true">🔒</div>
            <p class="gf-lock-msg"><?php echo esc_html($msg); ?></p>
        </div>
<?php
        return ob_get_clean();
    }

    private static function get_default_lock_message($type, $value)
    {
        global $wpdb;

        switch ($type) {
            case 'points':
                /* translators: %s: required point amount */
                return sprintf(__('Reach %s points to unlock this content.', 'gameengine'), number_format_i18n((int) $value));

            case 'achievement':
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", (int) $value));
                if ($title) {
                    /* translators: %s: achievement title */
                    return sprintf(__('Earn the "%s" achievement to unlock this content.', 'gameengine'), $title);
                }
                break;

            case 'level':
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", (int) $value));
                if ($title) {
                    /* translators: %s: level title */
                    return sprintf(__('Reach level "%s" to unlock this content.', 'gameengine'), $title);
                }
                break;
        }

        return __('This content is restricted. Complete requirements to unlock.', 'gameengine');
    }
}
