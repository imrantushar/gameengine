<?php

namespace GameEngine\Admin;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Setup
 * Handles the Onboarding Wizard and fixes WordPress 6.4+ emoji deprecation.
 */
class Setup
{

    const PAGE_ID = 'gameengine-setup';

    /**
     * Initialize the Setup class.
     */
    public static function init()
    {
        $self = new self();

        if ($self->is_current_page()) {
            add_action('admin_init', array($self, 'handle_setup_screen_render'), 0);
        }

        add_action('admin_menu', array($self, 'register_setup_menu'));
    }

    /**
     * Register hidden setup menu.
     */
    public function register_setup_menu()
    {
        add_submenu_page(
            'options-writing.php',
            __('GameEngine Setup', 'gameengine'),
            __('GameEngine Setup', 'gameengine'),
            'manage_options',
            self::PAGE_ID,
            '__return_null'
        );
    }

    /**
     * Intercept admin render and clean up deprecated notices.
     */
    public function handle_setup_screen_render()
    {
        $this->nuke_emojis();

        // Enqueue the versioned assets (setup.1.0.0.js)
        $this->enqueue_setup_assets();

        // Render the blank view
        $this->render_view();

        die;
    }

    /**
     * Fully removes emoji scripts and styles to prevent WP 6.4+ deprecation notices.
     */
    private function nuke_emojis()
    {
        // Remove from Header and Admin
        remove_action('admin_print_styles', 'print_emoji_styles');
        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('admin_print_scripts', 'print_emoji_detection_script');
        remove_action('wp_print_styles', 'print_emoji_styles');
        remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
        remove_filter('the_content_feed', 'wp_staticize_emoji');
        remove_filter('comment_text_rss', 'wp_staticize_emoji');

        // Disable the specific filter that causes the warning
        add_filter('tiny_mce_plugins', function ($plugins) {
            if (is_array($plugins)) {
                return array_diff($plugins, array('wpemoji'));
            }
            return array();
        });

        add_filter('wp_resource_hints', function ($urls, $relation_type) {
            if ('dns-prefetch' === $relation_type) {
                $emoji_svg_url = apply_filters('emoji_svg_url', 'https://s.w.org/images/core/emoji/14.0.0/svg/');
                $urls = array_diff($urls, array($emoji_svg_url));
            }
            return $urls;
        }, 10, 2);
    }

    /**
     * Check if current page is our setup screen.
     */
    public function is_current_page()
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        return (isset($_GET['page']) && self::PAGE_ID === $_GET['page']);
    }

    /**
     * Enqueue versioned build files.
     */
    private function enqueue_setup_assets()
    {
        $version    = defined('GAMEENGINE_VERSION') ? GAMEENGINE_VERSION : '1.0.0';
        $asset_file = GAMEENGINE_PATH . 'assets/build/setup.' . $version . '.asset.php';

        // Fallback for asset file
        if (! file_exists($asset_file)) {
            $asset_file = GAMEENGINE_PATH . 'assets/build/setup.asset.php';
            $js_file    = 'setup.js';
        } else {
            $js_file = 'setup.' . $version . '.js';
        }

        if (! file_exists($asset_file)) {
            return;
        }

        $asset_data = require $asset_file;

        // Enqueue CSS
        wp_enqueue_style(
            'gameengine-setup-style',
            GAMEENGINE_URL . 'assets/build/setup.css',
            array('wp-components'),
            $asset_data['version']
        );

        // Enqueue JS
        wp_enqueue_script(
            'gameengine-setup-script',
            GAMEENGINE_URL . 'assets/build/' . $js_file,
            $asset_data['dependencies'],
            $asset_data['version'],
            true
        );

        // Localize Data
        $setup_data = array(
            'rest_url'  => rest_url('gameengine/v1'),
            'nonce'     => wp_create_nonce('wp_rest'),
            'admin_url' => admin_url(),
            'is_pro'    => \GameEngine\Helper::is_pro(),
            'gameengine_nonce'       => wp_create_nonce('gameengine_nonce'),
            'namespace'          => 'gameengine/v1/',
            // 'addons'             => $addons_status,
            'plugin_root_url'    => GAMEENGINE_URL,
            'plugin_root_path'   => GAMEENGINE_PATH,
            'ajaxurl'            => esc_url(admin_url('admin-ajax.php')),
            'site_url'           => site_url(),
            'admin_url'          => admin_url(),
            'is_woocommerce_active' => \GameEngine\Helper::is_plugin_active('WooCommerce'),
            'is_academylms_active'  => \GameEngine\Helper::is_plugin_active('Academy'),
            'banners'               => array(
                'points'       => get_option('gameengine_hide_banner_points', 'no'),
                'achievements' => get_option('gameengine_hide_banner_achievements', 'no'),
                'levels'       => get_option('gameengine_hide_banner_levels', 'no'),
            ),
        );

        wp_localize_script('gameengine-setup-script', 'GameEngineGlobal', $setup_data);
    }

    /**
     * Render the HTML container for React.
     */
    private function render_view()
    {
        $view_file = GAMEENGINE_PATH . 'includes/Admin/Views/setup.php';
        if (file_exists($view_file)) {
            require $view_file;
        }
    }
}
