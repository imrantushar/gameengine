<?php

namespace GameEngine\Admin;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Setup
 * Handles the Onboarding Wizard with support for versioned assets and clean React environment.
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

        add_action('admin_init', array($self, 'redirect_after_activation'));
        add_action('admin_menu', array($self, 'register_setup_menu'));
    }

    /**
     * Redirect to setup wizard if activation transient exists.
     */
	public function redirect_after_activation() {
		if ( is_network_admin() || class_exists( \WP_CLI::class, false ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! get_transient( 'gameengine_activation_redirect' ) ) {
			return;
		}

		delete_transient( 'gameengine_activation_redirect' );

		/**
		 * Page routing via $_GET doesn't require a nonce.
		 */
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$current_page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';

		if ( self::PAGE_ID === $current_page ) {
			return;
		}

		wp_safe_redirect( admin_url( 'admin.php?page=' . self::PAGE_ID ) );
		exit;
	}

    /**
     * Register hidden setup menu and hook into its load action.
     */
    public function register_setup_menu()
    {
        $hook = add_submenu_page(
            'options-writing.php',
            __('GameEngine Setup', 'gameengine'),
            __('GameEngine Setup', 'gameengine'),
            'manage_options',
            self::PAGE_ID,
            '__return_null'
        );

        add_action('load-' . $hook, array($this, 'handle_setup_screen_render'));
    }

    /**
     * Renders a totally clean HTML page for React, bypassing wp_head and wp_footer 
     * conflicts from plugins like StoreEngine.
     */
    public function handle_setup_screen_render()
    {

        $this->nuke_emojis();
        // Prepare assets and original data.
        $this->enqueue_setup_assets();

        // Clean any previous output buffer.
        if (ob_get_length()) {
            ob_clean();
        }

        /**
         * Start building the page manually to avoid StoreEngine Fatal Errors.
         */
?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>

        <head>
            <meta charset="<?php bloginfo('charset'); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title><?php esc_html_e('GameEngine Setup Wizard', 'gameengine'); ?></title>
            <?php
            // Print enqueued styles and scripts for GameEngine only.
            wp_print_styles();
            wp_print_head_scripts();
            ?>
        </head>

        <body class="gameengine-setup-page">
            <div id="gameengine-setup-app">
                <div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
                    <h2><?php esc_html_e('Loading Setup Wizard...', 'gameengine'); ?></h2>
                </div>
            </div>
            <?php
            /**
             * Skips wp_footer action to prevent plugin conflicts.
             */
            wp_print_footer_scripts();
            ?>
        </body>

        </html>
<?php
        exit;
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
        /**
         *  Instead of calling apply_filters('emoji_svg_url'), 
         * we search and remove the emoji CDN URL directly to avoid prefix warnings.
         */
        add_filter('wp_resource_hints', function ($urls, $relation_type) {
            if ('dns-prefetch' === $relation_type && is_array($urls)) {
                foreach ($urls as $key => $url) {
                    if (strpos($url, 's.w.org/images/core/emoji') !== false) {
                        unset($urls[$key]);
                    }
                }
            }
            return $urls;
        }, 10, 2);
    }

    /**
     * Enqueue Build Assets with Versioned JS and all original localized data.
     */
    private function enqueue_setup_assets()
    {
        // Handle JS Versioning (setup.1.0.0.js)
        $version = defined('GAMEENGINE_VERSION') ? GAMEENGINE_VERSION : '1.0.0';
        $js_file = 'setup.' . $version . '.js';

        $asset_file = GAMEENGINE_PATH . 'assets/build/setup.asset.php';

        if (! file_exists($asset_file)) {
            // Fallback for asset file
            $asset_file = GAMEENGINE_PATH . 'assets/build/setup.' . $version . '.asset.php';
        }

        if (! file_exists($asset_file)) {
            return;
        }

        $asset_data = require $asset_file;

        // Load Roboto font — declared in _global.scss but never fetched without this
        wp_enqueue_style(
            'gameengine-google-fonts',
            'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap',
            array(),
            null
        );

        // Enqueue Wizard CSS
        wp_enqueue_style(
            'gameengine-setup-style',
            GAMEENGINE_URL . 'assets/build/setup.css',
            array('wp-components'),
            $asset_data['version']
        );

        // Enqueue Wizard JS with full versioned filename
        wp_enqueue_script(
            'gameengine-setup-script',
            GAMEENGINE_URL . 'assets/build/' . $js_file,
            $asset_data['dependencies'],
            $asset_data['version'],
            true
        );

        // --- RESTORED ALL YOUR ORIGINAL DATA ---
        $setup_data = array(
            'rest_url'              => rest_url('gameengine/v1'),
            'nonce'                 => wp_create_nonce('wp_rest'),
            'admin_url'             => admin_url(),
            'is_pro'                => \GameEngine\Helper::is_pro(),
            'gameengine_nonce'      => wp_create_nonce('gameengine_nonce'),
            'namespace'             => 'gameengine/v1/',
            'plugin_root_url'       => GAMEENGINE_URL,
            'plugin_root_path'      => GAMEENGINE_PATH,
            'ajaxurl'               => esc_url(admin_url('admin-ajax.php')),
            'site_url'              => site_url(),
            'admin_url'             => admin_url(),
            'is_woocommerce_active' => \GameEngine\Helper::is_plugin_active('WooCommerce'),
            'is_academylms_active'  => \GameEngine\Helper::is_academylms_active(),
            'is_tutorlms_active'    => \GameEngine\Helper::is_tutorlms_active(),
            'is_storeengine_active' => defined('STOREENGINE_VERSION'),
            'banners'               => array(
                'points'       => get_option('gameengine_hide_banner_points', 'no'),
                'achievements' => get_option('gameengine_hide_banner_achievements', 'no'),
                'levels'       => get_option('gameengine_hide_banner_levels', 'no'),
            ),
        );

        wp_localize_script('gameengine-setup-script', 'GameEngineGlobal', $setup_data);
    }
}
