<?php

namespace Gamify;

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
     * Get Google Fonts URL (Roboto).
     *
     * @return string
     */
    public function get_google_fonts_url()
    {
        $font_url = '';
        /**
         * We are using Roboto with 400, 500, and 700 weights.
         * Display=swap is used for better performance.
         */
        $font_url = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

        return $font_url;
    }

    /**
     * Prepares the array of data to be passed to JavaScript.
     *
     * @return array
     */
    private function get_scripts_data()
    {


        $active_addons = get_option('gamify_active_addons', []);

        // Define all possible addons and map their status
        $all_addons = ['storeengine', 'woocommerce', 'academylms', 'restrict_unlock', 'progress_map', 'restrict_content'];
        $addons_status = [];

        foreach ($all_addons as $slug) {
            $addons_status[$slug] = in_array($slug, $active_addons);
        }

        return array(
            'nonce'              => wp_create_nonce('wp_rest'),
            'gamify_nonce'       => wp_create_nonce('gamify_nonce'),
            'rest_url'           => rest_url(),
            'namespace'          => 'gamify/v1/',
            'addons'             => $addons_status,
            'plugin_root_url'    => GAMIFY_URL,
            'plugin_root_path'   => GAMIFY_PATH,
            'ajaxurl'            => esc_url(admin_url('admin-ajax.php')),
            'site_url'           => site_url(),
            'admin_url'          => admin_url(),
            'route_path'         => wp_parse_url(admin_url(), PHP_URL_PATH),
            'menu'               => wp_json_encode(Helper::get_admin_menu_list()),
            'is_plain_permalink' => (bool) empty(get_option('permalink_structure')),
            //'is_pro' => file_exists(GAMIFY_PATH . 'includes/pro/init.php'),
            'is_pro' => false
        );
    }

    /**
     * Filters and retrieves backend-specific script data.
     *
     * @return array
     */
    private function get_backend_scripts_data()
    {
        return apply_filters('gamify/assets/backend_scripts_data', $this->get_scripts_data());
    }

    /**
     * Enqueues scripts and styles for the admin dashboard.
     *
     * @param string $hook The current admin page hook.
     */
    public function enqueue_admin_assets($hook)
    {
        // Only load assets on our plugin's admin pages.
        if (strpos($hook, 'gamify') === false) {
            return;
        }

        // 1. Enqueue Google Fonts (Roboto)
        wp_enqueue_style('gamify-fonts', $this->get_google_fonts_url(), array(), null);

        $versioned_filename = 'backend.' . GAMIFY_VERSION;
        $script_asset_path  = GAMIFY_PATH . 'assets/build/' . $versioned_filename . '.asset.php';

        if (! file_exists($script_asset_path)) {
            return;
        }

        $script_asset = require $script_asset_path;

        if (! did_action('wp_enqueue_media')) {
            wp_enqueue_media();
        }

        // Enqueue CSS
        $style_path = GAMIFY_PATH . 'assets/build/backend.css';
        if (file_exists($style_path)) {
            wp_enqueue_style(
                'gamify-admin-style',
                GAMIFY_URL . 'assets/build/backend.css',
                ['wp-components'],
                $script_asset['version']
            );
        }

        // Enqueue JS
        wp_enqueue_script(
            'gamify-admin-script',
            GAMIFY_URL . 'assets/build/' . $versioned_filename . '.js',
            $script_asset['dependencies'],
            $script_asset['version'],
            true
        );

        wp_localize_script('gamify-admin-script', 'GamifyGlobal', $this->get_backend_scripts_data());
        wp_set_script_translations('gamify-admin-script', 'gamify', GAMIFY_PATH . 'languages/');
    }

    /**
     * Enqueue Frontend Assets from the Build directory.
     */
    public function enqueue_frontend_assets()
    {

        wp_enqueue_style('gamify-fonts', $this->get_google_fonts_url(), array(), null);

        $versioned_filename = 'frontend.' . GAMIFY_VERSION;
        $script_asset_path  = GAMIFY_PATH . 'assets/build/' . $versioned_filename . '.asset.php';

        if (file_exists($script_asset_path)) {
            $script_asset = require $script_asset_path;

            wp_enqueue_style(
                'gamify-frontend-style',
                GAMIFY_URL . 'assets/build/frontend.css',
                array(),
                $script_asset['version']
            );

            // build js
            wp_enqueue_script(
                'gamify-frontend-script',
                GAMIFY_URL . 'assets/build/' . $versioned_filename . '.js',
                $script_asset['dependencies'],
                $script_asset['version'],
                true
            );

            // global data (GamifyGlobal)
            wp_localize_script('gamify-frontend-script', 'GamifyGlobal', $this->get_scripts_data());
        }
    }
}
