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
     * Registers the translation companion for the admin screens and returns
     * its handle, or '' when the file has not been generated.
     *
     * The string extractor that WordPress.org and WP-CLI share cannot parse
     * assets/build/backend.js — it gives up on the file — so no translation is
     * ever keyed to the admin bundle. assets/build/i18n-strings.js lists the
     * same strings in a form it can read (build-tools/make-i18n-strings.mjs).
     * Translations load per text domain, not per file, so loading them for this
     * one file translates every script that uses the domain. Add the handle as
     * a dependency of any script that shows those strings.
     *
     * @return string
     */
    public static function register_i18n_strings()
    {
        $handle = 'gameengine-i18n';

        if (wp_script_is($handle, 'registered')) {
            return $handle;
        }

        if (! is_file(GAMEENGINE_PATH . 'assets/build/i18n-strings.js')) {
            return '';
        }

        wp_register_script($handle, GAMEENGINE_URL . 'assets/build/i18n-strings.js', array('wp-i18n'), GAMEENGINE_VERSION, true);
        wp_set_script_translations($handle, 'gameengine', GAMEENGINE_PATH . 'languages/');

        return $handle;
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
            'is_woocommerce_active' => \GameEngine\Helper::is_plugin_active('WooCommerce'),
            'is_academylms_active' => \GameEngine\Helper::is_academylms_active(),
            'is_tutorlms_active' => \GameEngine\Helper::is_tutorlms_active(),
            'is_storeengine_active' => defined('STOREENGINE_VERSION'),
            'is_pro' => defined('GAMEENGINE_PRO_VERSION'),
            'is_buddypress_active' => function_exists('bp_is_active') || class_exists('BuddyPress'),
            'is_learndash_active' => defined('LEARNDASH_VERSION') || class_exists('SFWD_LMS'),
            'is_gemboards_active' => defined('GEMBOARDS_VERSION') || class_exists('GemBoards'),
            'is_bbpress_active' => function_exists('bbpress') || class_exists('bbPress'),
            'social_sharing' => (bool) ( get_option('gameengine_general_settings', array())['social_sharing'] ?? true ),
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

        $script_asset_path = GAMEENGINE_PATH . 'assets/build/backend.asset.php';

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

        // Enqueue JS. The translation companion comes along as a dependency so
        // the admin screens translate — see register_i18n_strings().
        $dependencies = $script_asset['dependencies'];
        $i18n_handle  = self::register_i18n_strings();

        if ($i18n_handle) {
            $dependencies[] = $i18n_handle;
        }

        wp_enqueue_script(
            'gameengine-admin-script',
            GAMEENGINE_URL . 'assets/build/backend.js',
            $dependencies,
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


        $script_asset_path = GAMEENGINE_PATH . 'assets/build/frontend.asset.php';

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
                GAMEENGINE_URL . 'assets/build/frontend.js',
                $script_asset['dependencies'],
                $script_asset['version'],
                true
            );

            // global data (GameEngineGlobal)
            wp_localize_script('gameengine-frontend-script', 'GameEngineGlobal', $this->get_scripts_data());
        }
    }
}
