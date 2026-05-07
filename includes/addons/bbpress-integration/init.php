<?php

namespace GameEngine\Addons\BBPressIntegration;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * bbPress Integration Addon.
 */
class Init
{
    const ADDON_SLUG = 'bbpress_integration';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        // Only load when bbPress is active.
        if (! class_exists('bbPress') && ! function_exists('bbpress') && ! defined('BBP_VERSION')) {
            return;
        }

        add_filter('gameengine_integrations', [__CLASS__, 'register_integration']);

        // Set lifetime first-post meta flag after the award is recorded.
        add_action('gameengine_points_added', [__CLASS__, 'maybe_set_first_post_flag'], 5, 5);
    }

    public static function register_integration(array $integrations): array
    {
        if (! class_exists('\GameEngine\Integrations\BBPress')) {
            require_once dirname(__DIR__, 2) . '/integrations/bbpress.php';
        }
        $integrations['bbpress'] = \GameEngine\Integrations\BBPress::class;
        return $integrations;
    }

    public static function maybe_set_first_post_flag(int $user_id, int $points, string $context)
    {
        if ('bbp_first_post_in_forum' !== $context) {
            return;
        }
        update_user_meta($user_id, 'gameengine_bbp_first_post_awarded', 1);
    }
}

Init::init();
