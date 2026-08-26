<?php

namespace GameEngine;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles the enqueuing of all frontend and backend assets (CSS, JS, Fonts).
 */
class Assets
{

    /**
     * Initialize the Assets class.
     */
    public static function init()
    {
        $self = new self();
        add_action('admin_enqueue_scripts', [$self, 'enqueue_admin_assets']);
        add_action('wp_enqueue_scripts', [$self, 'enqueue_frontend_assets']);
    }

    /**
     * Prepares the array of data to be passed to JavaScript.
     *
     * @return array
     */
    private function get_scripts_data()
    {


        $active_addons = get_option('gameengine_active_addons', []);

        // Define all possible addons and map their status
        $all_addons = apply_filters(
            'gameengine_addon_slugs',
            [
                'storeengine',
                'woocommerce',
                'academylms',
                'tutorlms',
                'restrict_unlock',
                'progress_map',
                'restrict_content',
            ]
        );
        $addons_status = [];

        foreach ($all_addons as $slug) {
            $addons_status[$slug] = in_array($slug, $active_addons, true);
        }

        return array(
            'nonce'              => wp_create_nonce('wp_rest'),
            'gameengine_nonce'       => wp_create_nonce('gameengine_nonce'),
            'rest_url'           => rest_url(),
            'namespace'          => 'gameengine/v1/',
            'addons'             => $addons_status,
            'plugin_root_url'    => GAMEENGINE_URL,
            'plugin_root_path'   => GAMEENGINE_PATH,
            'ajaxurl'            => esc_url(admin_url('admin-ajax.php')),
            'site_url'           => site_url(),
            'admin_url'          => admin_url(),
            'route_path'         => wp_parse_url(admin_url(), PHP_URL_PATH),
            'menu'               => wp_json_encode(Helper::get_admin_menu_list()),
            'is_plain_permalink' => (bool) empty(get_option('permalink_structure')),
            'is_woocommerce_active' => \GameEngine\Helper::is_plugin_active('WooCommerce'),
            'is_academylms_active' => \GameEngine\Helper::is_academylms_active(),
            'is_tutorlms_active' => \GameEngine\Helper::is_tutorlms_active(),
            'is_storeengine_active' => defined('STOREENGINE_VERSION'),
            'banners'               => array(
                'points'       => get_option('gameengine_hide_banner_points', 'no'),
                'achievements' => get_option('gameengine_hide_banner_achievements', 'no'),
                'levels'       => get_option('gameengine_hide_banner_levels', 'no'),
            ),
        );
    }

    /**
     * Filters and retrieves backend-specific script data.
     *
     * @return array
     */
    private function get_backend_scripts_data()
    {
        return apply_filters('gameengine/assets/backend_scripts_data', $this->get_scripts_data());
    }

    /**
     * Enqueues scripts and styles for the admin dashboard.
     *
     * @param string $hook The current admin page hook.
     */
    public function enqueue_admin_assets($hook)
    {
        // Only load assets on our plugin's admin pages.
        if (strpos($hook, 'gameengine') === false) {
            return;
        }

        $versioned_filename = 'backend.' . GAMEENGINE_VERSION;
        $script_asset_path  = GAMEENGINE_PATH . 'assets/build/' . $versioned_filename . '.asset.php';

        if (! file_exists($script_asset_path)) {
            return;
        }

        $script_asset = require $script_asset_path;

        if (! did_action('wp_enqueue_media')) {
            wp_enqueue_media();
        }

        // Enqueue CSS
        $style_path = GAMEENGINE_PATH . 'assets/build/backend.css';
        if (file_exists($style_path)) {
            wp_enqueue_style(
                'gameengine-admin-style',
                GAMEENGINE_URL . 'assets/build/backend.css',
                ['wp-components'],
                $script_asset['version']
            );
        }

        // Enqueue JS
        wp_enqueue_script(
            'gameengine-admin-script',
            GAMEENGINE_URL . 'assets/build/' . $versioned_filename . '.js',
            $script_asset['dependencies'],
            $script_asset['version'],
            true
        );

        wp_localize_script('gameengine-admin-script', 'GameEngineGlobal', $this->get_backend_scripts_data());
        wp_set_script_translations('gameengine-admin-script', 'gameengine', GAMEENGINE_PATH . 'languages/');
    }

    /**
     * Enqueue Frontend Assets from the Build directory.
     */
    public function enqueue_frontend_assets()
    {
        // Registered here and enqueued by the shortcode that needs it, so the
        // stylesheet only loads on pages that actually render the markup.
        wp_register_style(
            'gameengine-shortcode-levels',
            GAMEENGINE_URL . 'assets/css/shortcode-levels.css',
            array(),
            GAMEENGINE_VERSION
        );


        $versioned_filename = 'frontend.' . GAMEENGINE_VERSION;
        $script_asset_path  = GAMEENGINE_PATH . 'assets/build/' . $versioned_filename . '.asset.php';

        if (file_exists($script_asset_path)) {
            $script_asset = require $script_asset_path;

            wp_enqueue_style(
                'gameengine-frontend-style',
                GAMEENGINE_URL . 'assets/build/frontend.css',
                array(),
                $script_asset['version']
            );

            // build js
            wp_enqueue_script(
                'gameengine-frontend-script',
                GAMEENGINE_URL . 'assets/build/' . $versioned_filename . '.js',
                $script_asset['dependencies'],
                $script_asset['version'],
                true
            );

            // global data (GameEngineGlobal)
            wp_localize_script('gameengine-frontend-script', 'GameEngineGlobal', $this->get_scripts_data());
        }
    }
}
