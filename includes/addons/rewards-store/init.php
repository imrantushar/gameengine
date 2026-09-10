<?php

namespace GameEngine\Addons\RewardsStore;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Init
 * Entry point for the Rewards Store Addon.
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
        if (in_array('rewards_store', $active_addons, true)) {
            self::load_dependencies();
            self::register_hooks();
        }
    }

    /**
     * Load required addon classes.
     */
    private static function load_dependencies()
    {
        if (file_exists(__DIR__ . '/class-rewards-manager.php')) {
            require_once __DIR__ . '/class-rewards-manager.php';
        }

        if (file_exists(__DIR__ . '/class-rewards-api.php')) {
            require_once __DIR__ . '/class-rewards-api.php';
        }

        if (file_exists(__DIR__ . '/class-shortcode.php')) {
            require_once __DIR__ . '/class-shortcode.php';
        }
    }

    /**
     * Register WordPress and REST API hooks.
     */
    private static function register_hooks()
    {
        add_action('rest_api_init', function () {
            if (class_exists(__NAMESPACE__ . '\Rewards_API')) {
                $api = new Rewards_API();
                $api->register_routes();
            }
        });

        if (class_exists(__NAMESPACE__ . '\Shortcode')) {
            new Shortcode();
        }
    }
}

// Start the addon initialization.
Init::init();
