<?php

namespace GameEngine\Addons\BuddyPressIntegration;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * BuddyPress / BuddyBoss Integration Addon.
 */
class Init
{
    const ADDON_SLUG = 'buddypress_integration';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        // Only load when BuddyPress is active.
        if (! function_exists('buddypress') && ! defined('BP_VERSION') && ! defined('BUDDYBOSS_PLATFORM_VERSION')) {
            return;
        }

        add_filter('gameengine_integrations', [__CLASS__, 'register_integration']);

        // Once-per-user meta enforcement for profile photo.
        add_action('gameengine_points_added', [__CLASS__, 'maybe_set_photo_flag'], 5, 5);
    }

    public static function register_integration(array $integrations): array
    {
        if (! class_exists('\GameEngine\Integrations\BuddyPress')) {
            require_once dirname(__DIR__, 2) . '/integrations/buddypress.php';
        }
        $integrations['buddypress'] = \GameEngine\Integrations\BuddyPress::class;
        return $integrations;
    }

    // The Triggers class handles once-per-user via the limit field ('1_time').
    // For profile photo, we enforce it here as a lifetime meta flag.
    public static function maybe_set_photo_flag(int $user_id, int $points, string $context)
    {
        if ('bp_profile_photo_upload' !== $context) {
            return;
        }
        update_user_meta($user_id, 'gameengine_bp_photo_awarded', 1);
    }
}

Init::init();
