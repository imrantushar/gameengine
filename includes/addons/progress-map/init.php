<?php

namespace GameEngine\Addons\ProgressMap;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Init
 * Entry point for the Progress Map Addon.
 * Handles file loading and REST API registration.
 */
class Init
{

    /**
     * Initialize the addon logic.
     */
    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', array());

        // Load addon only if it is active in the GameEngine settings.
        if (in_array('progress_map', $active_addons, true)) {
            self::load_dependencies();
            self::register_hooks();
        }
    }

    /**
     * Load required addon classes.
     */
    private static function load_dependencies()
    {
        // Load the Logic Engine for progress calculation and HTML rendering.
        if (file_exists(__DIR__ . '/class-progress-map-logic.php')) {
            require_once __DIR__ . '/class-progress-map-logic.php';
        }

        // Load the REST API Controller for frontend data fetching.
        if (file_exists(__DIR__ . '/class-progress-api.php')) {
            require_once __DIR__ . '/class-progress-api.php';
        }
    }

    /**
     * Register WordPress and REST API hooks.
     */
    private static function register_hooks()
    {
        // Register the Progress Map REST API routes.
        add_action('rest_api_init', function () {
            if (class_exists(__NAMESPACE__ . '\Progress_API')) {
                $api = new Progress_API();
                $api->register_routes();
            }
        });
    }
}

// Start the addon initialization.
Init::init();
