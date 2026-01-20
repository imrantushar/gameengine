<?php

namespace Gamify\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Init
 * Entry point for the Restrict Content Addon.
 * Handles self-activation check, loading dependencies, and hook registration.
 */
class Init
{

    /**
     * Initialize the addon logic.
     */
    public static function init()
    {
        $active_addons = get_option('gamify_active_addons', array());

        /**
         * Self-check: Only load if the addon is enabled in settings.
         */
        // if (in_array('restrict_content', $active_addons, true)) {
        //     self::load_dependencies();
        //     self::register_hooks();
        // }

        $force_enable = true;

        if ($force_enable) {
            self::load_dependencies();
            self::register_hooks();
        }
    }

    /**
     * Load all logic, UI, and helper classes for this addon.
     */
    private static function load_dependencies()
    {
        // Logic Engine
        if (file_exists(__DIR__ . '/class-restriction-helper.php')) {
            require_once __DIR__ . '/class-restriction-helper.php';
        }

        // Admin UI (Meta Box)
        if (file_exists(__DIR__ . '/class-meta-box.php')) {
            require_once __DIR__ . '/class-meta-box.php';
        }

        // Content Interceptor (Filter)
        if (file_exists(__DIR__ . '/class-content-filter.php')) {
            require_once __DIR__ . '/class-content-filter.php';
        }

        // Frontend Shortcodes
        if (file_exists(__DIR__ . '/class-shortcodes.php')) {
            require_once __DIR__ . '/class-shortcodes.php';
        }
    }

    /**
     * Register hooks for Meta Boxes and Content Filtering.
     */
    private static function register_hooks()
    {
        // Initialize Meta Box in Post Editor
        if (class_exists(__NAMESPACE__ . '\Meta_Box')) {
            Meta_Box::init();
        }

        // Initialize Content Filter for Frontend
        if (class_exists(__NAMESPACE__ . '\Content_Filter')) {
            Content_Filter::init();
        }
    }
}

// Kickstart the Restrict Content Addon.
Init::init();
