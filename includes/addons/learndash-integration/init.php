<?php

namespace GameEngine\Addons\LearnDashIntegration;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * LearnDash LMS Integration Addon.
 */
class Init
{
    const ADDON_SLUG = 'learndash_integration';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        // Only load when LearnDash (sfwd-lms) is active.
        if (! defined('LEARNDASH_VERSION') && ! function_exists('learndash_get_course_steps')) {
            return;
        }

        add_filter('gameengine_integrations', [__CLASS__, 'register_integration']);
    }

    public static function register_integration(array $integrations): array
    {
        if (! class_exists('\GameEngine\Integrations\LearnDash')) {
            require_once dirname(__DIR__, 2) . '/integrations/learndash.php';
        }
        $integrations['learndash'] = \GameEngine\Integrations\LearnDash::class;
        return $integrations;
    }
}

Init::init();
