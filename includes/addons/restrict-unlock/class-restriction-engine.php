<?php

namespace Gamify\Addons\RestrictUnlock;

if (!defined('ABSPATH')) exit;

class Restriction_Engine
{

    public static function init()
    {
        // Intercept reward delivery in the core engine
        add_filter('gamify_can_user_unlock_reward', [__CLASS__, 'check_dependencies'], 10, 3);
    }

    /**
     * Checks if the user is allowed to earn the reward based on dependencies.
     */
    public static function check_dependencies($can_unlock, $user_id, $rule)
    {
        global $wpdb;

        // 1. Determine which table to check
        $table = ($rule->reward_type === 'achievement') ? "{$wpdb->prefix}gamify_achievements" : "{$wpdb->prefix}gamify_levels";

        if ($rule->reward_type !== 'achievement' && $rule->reward_type !== 'level') {
            return $can_unlock;
        }

        // 2. Fetch the restriction settings for this item
        $item = $wpdb->get_row($wpdb->prepare(
            "SELECT required_achievement_id, required_level_id FROM $table WHERE id = %d",
            $rule->reward_id
        ));

        if (!$item) return $can_unlock;

        // 3. Check Achievement dependency
        if (!empty($item->required_achievement_id)) {
            $has_req_ach = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d AND achievement_id = %d",
                $user_id,
                $item->required_achievement_id
            ));
            if (!$has_req_ach) return false; // Blocked
        }

        // 4. Check Level dependency
        if (!empty($item->required_level_id)) {
            $has_req_lvl = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d AND level_id = %d",
                $user_id,
                $item->required_level_id
            ));
            if (!$has_req_lvl) return false; // Blocked
        }

        return $can_unlock;
    }
}
