<?php

namespace Gamify\Addons\RestrictContent;

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
        if (current_user_can('manage_options')) {
            return true;
        }

        $user_id = get_current_user_id();

        // Block guests if any restriction is active.
        if (! $user_id) {
            return false;
        }

        switch ($type) {
            case 'points':
                if (class_exists('\Gamify\Classes\PointsManager')) {
                    $points_manager = new \Gamify\Classes\PointsManager();
                    $user_points    = (int) $points_manager->get_grand_total($user_id);
                    return $user_points >= (int) $value;
                }
                break;

            case 'achievement':
                if (class_exists('\Gamify\Classes\AchievementsManager')) {
                    $ach_manager = new \Gamify\Classes\AchievementsManager();
                    return $ach_manager->has_achievement($user_id, absint($value));
                }
                break;

            case 'level':
                return self::check_level_access($user_id, absint($value));
        }

        return true;
    }

    /**
     * Verify access based on level priority with caching.
     */
    private static function check_level_access($user_id, $required_level_id)
    {
        global $wpdb;

        $cache_key = "gf_access_lvl_{$user_id}_{$required_level_id}";
        $access    = wp_cache_get($cache_key, 'gamify');

        if (false === $access) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $current_priority = $wpdb->get_var($wpdb->prepare("SELECT l.priority FROM {$wpdb->prefix}gamify_user_levels ul JOIN {$wpdb->prefix}gamify_levels l ON ul.level_id = l.id WHERE ul.user_id = %d ORDER BY l.priority DESC LIMIT 1", $user_id));
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $required_priority = $wpdb->get_var($wpdb->prepare("SELECT priority FROM {$wpdb->prefix}gamify_levels WHERE id = %d", $required_level_id));

            $access = (int) $current_priority >= (int) $required_priority;
            wp_cache_set($cache_key, $access, 'gamify', 60);
        }

        return (bool) $access;
    }

    /**
     * Renders the locked UI.
     */
    public static function get_locked_ui($message)
    {
        $msg = ! empty($message) ? $message : __('This content is restricted. Complete requirements to unlock.', 'gamify');
        ob_start();
?>
        <div class="gamify-restriction-box" style="padding: 40px; background: #fff; border: 2px solid #eee; text-align: center; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div class="gf-lock-icon" style="font-size: 50px; margin-bottom: 15px;">🔒</div>
            <p class="gf-lock-msg" style="font-weight: 700; font-size: 18px; color: #1e293b; margin: 0;"><?php echo esc_html($msg); ?></p>
        </div>
<?php
        return ob_get_clean();
    }
}
