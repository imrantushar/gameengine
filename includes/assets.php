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
     * Whether markup asked for the frontend assets before wp_enqueue_scripts.
     *
     * @var bool
     */
    private static $requested = false;

    /**
     * Whether that markup also needs the frontend script.
     *
     * @var bool
     */
    private static $requested_script = false;

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
     * Data for the frontend script.
     *
     * Only what member-facing code reads: the REST base, a nonce and the
     * strings the script shows. Menus, admin URLs and server paths from the
     * admin data do not belong on a public page.
     *
     * @return array
     */
    private static function frontend_script_data()
    {
        return array(
            'nonce'     => wp_create_nonce('wp_rest'),
            'rest_url'  => rest_url(),
            'namespace' => 'gameengine/v1/',
            'i18n'      => array(
                'redeeming'  => __('Redeeming…', 'gameengine'),
                'redeemed'   => __('Redeemed', 'gameengine'),
                'outOfStock' => __('Out of Stock', 'gameengine'),
                /* translators: %d: how many of the reward are left in stock. */
                'stockLeft'  => __('%d left', 'gameengine'),
                /* translators: %s: required point amount */
                'points'     => __('%s points', 'gameengine'),
                'error'      => __('Something went wrong. Please try again.', 'gameengine'),
                'linkCopied' => __('Link copied', 'gameengine'),
            ),
        );
    }

    /**
     * Register the frontend assets, and enqueue them early on a singular page
     * whose content already calls a GameEngine shortcode.
     *
     * Nothing loads here otherwise: every shortcode, and every other place that
     * prints member-facing markup, calls enqueue_frontend() as it renders, so a
     * page without GameEngine UI loads none of its CSS or JS. Requests made while
     * a block theme rendered the page, before this hook, are enqueued here. The
     * early check is for classic themes, which render content after wp_head and
     * would print a late stylesheet in the footer.
     */
    public function enqueue_frontend_assets()
    {
        self::register_frontend_assets();

        if (self::$requested || self::content_has_shortcode()) {
            self::enqueue_frontend(self::$requested_script);
        }
    }

    /**
     * Register the frontend stylesheets and script without enqueuing them.
     * Safe to call more than once.
     */
    public static function register_frontend_assets()
    {
        if (wp_style_is('gameengine-frontend-style', 'registered')) {
            return;
        }

        $script_asset_path = GAMEENGINE_PATH . 'assets/build/frontend.asset.php';

        if (! file_exists($script_asset_path)) {
            return;
        }

        $script_asset = require $script_asset_path;

        wp_register_style(
            'gameengine-frontend-style',
            GAMEENGINE_URL . 'assets/build/frontend.css',
            array(),
            $script_asset['version']
        );

        wp_register_script(
            'gameengine-frontend-script',
            GAMEENGINE_URL . 'assets/build/frontend.js',
            $script_asset['dependencies'],
            $script_asset['version'],
            true
        );
    }

    /**
     * Enqueue the member-facing stylesheet, and the frontend script with its
     * data when the markup needs it. Safe to call any number of times.
     *
     * @param bool $with_script Also enqueue the frontend script.
     */
    public static function enqueue_frontend($with_script = false)
    {
        // A block theme renders the page, and so its shortcodes, before
        // wp_enqueue_scripts. Enqueuing then would print this stylesheet ahead
        // of the theme's and let the theme's layout rules win, so the request
        // waits for the hook instead.
        if (! did_action('wp_enqueue_scripts')) {
            self::$requested        = true;
            self::$requested_script = self::$requested_script || $with_script;
            return;
        }

        self::register_frontend_assets();
        wp_enqueue_style('gameengine-frontend-style');

        if (! $with_script || wp_script_is('gameengine-frontend-script', 'enqueued')) {
            return;
        }

        wp_enqueue_script('gameengine-frontend-script');
        wp_localize_script('gameengine-frontend-script', 'GameEngineGlobal', self::frontend_script_data());
    }

    /**
     * Whether the current singular post's content calls a GameEngine shortcode.
     *
     * @return bool
     */
    private static function content_has_shortcode()
    {
        if (! is_singular()) {
            return false;
        }

        $post = get_post();

        if (! $post || false === strpos($post->post_content, '[gameengine_')) {
            return false;
        }

        foreach (array_keys($GLOBALS['shortcode_tags']) as $tag) {
            if (0 === strpos($tag, 'gameengine_') && has_shortcode($post->post_content, $tag)) {
                return true;
            }
        }

        return false;
    }
}
