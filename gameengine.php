<?php

/**
 * Plugin Name:       GameEngine - Gamification for Website
 * Plugin URI:        https://kodezen.com/products/gameengine
 * Description:       Award points, achievements, and ranks to boost user engagement and build a loyal community.
 * Version:           1.0.0
 * Author:            kodezen
 * Author URI:        https://kodezen.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gameengine
 * Domain Path:       /languages/
 */

// Exit if accessed directly to prevent direct script access.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * The main GameEngine plugin class.
 *
 * @final
 */
final class GameEngine
{
    /**
     * The single instance of the class.
     *
     * @var GameEngine|null
     */
    private static $instance = null;

    /**
     * Private constructor to prevent direct instantiation.
     */
    private function __construct()
    {
        $this->define_constants();
        $this->load_dependencies();
        $this->register_hooks();
    }

    /**
     * Get the single instance of the class.
     *
     * @return GameEngine
     */
    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Define all essential plugin constants.
     */
    private function define_constants()
    {
        define('GAMEENGINE_VERSION', '1.0.0');
        define('GAMEENGINE_FILE', __FILE__);
        define('GAMEENGINE_PLUGIN_SLUG', 'gameengine');
        define('GAMEENGINE_PATH', wp_normalize_path(plugin_dir_path(GAMEENGINE_FILE)));
        define('GAMEENGINE_URL', plugin_dir_url(GAMEENGINE_FILE));
        define('GAMEENGINE_INCLUDES', GAMEENGINE_PATH . 'includes/');
        define('GAMEENGINE_ROOT_DIR_PATH', plugin_dir_path(__FILE__));
    }

    /**
     * Load the plugin's dependencies.
     */
    private function load_dependencies()
    {
        require_once GAMEENGINE_INCLUDES . 'autoload.php';
        require_once GAMEENGINE_INCLUDES . 'functions.php';
    }

    /**
     * Register the core WordPress hooks.
     */
    private function register_hooks()
    {
        // Activation Hook.
        register_activation_hook(GAMEENGINE_FILE, array(__CLASS__, 'activate'));

        // Deactivation Hook.
        register_deactivation_hook(GAMEENGINE_FILE, [__CLASS__, 'deactivate']);

        // Initialize Plugin Modules.
        add_action('init', array($this, 'init_modules'), 10);
    }

    /**
     * Initialize Plugin Hooks and Classes.
     */
    public function init_modules()
    {
        // Setup Wizard (Must be initialized early in admin)
        if (is_admin() && class_exists('\GameEngine\Admin\Setup')) {
            \GameEngine\Admin\Setup::init();
        }

        if (class_exists('\GameEngine\Classes\TaxonomyManager')) {
            \GameEngine\Classes\TaxonomyManager::init();
        }

        // Assets & API.
        if (class_exists('\GameEngine\Assets')) {
            \GameEngine\Assets::init();
        }
        if (class_exists('\GameEngine\API\Manager')) {
            \GameEngine\API\Manager::init();
        }

        // System Services
        $services = [
            '\GameEngine\Classes\Scheduler',
            '\GameEngine\Classes\Logger',
            '\GameEngine\Classes\AchievementsManager',
            '\GameEngine\Classes\LevelsManager',
            '\GameEngine\Classes\EmailManager',
            '\GameEngine\Shortcode',
            '\GameEngine\Classes\Triggers'
        ];

        foreach ($services as $service) {
            if (class_exists($service)) {
                $service::init();
            }
        }

        // Admin Interface.
        if (is_admin()) {
            if (class_exists('\GameEngine\Admin')) {
                \GameEngine\Admin::init();
            }

            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $current_page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

            if ($current_page && 0 === strpos($current_page, 'gameengine') && current_user_can('manage_options')) {
                if (class_exists('\GameEngine\Classes\JsonGenerator')) {
                    \GameEngine\Classes\JsonGenerator::generate();
                }
            }
        }

        if (defined('WP_CLI') && WP_CLI) {
            \WP_CLI::add_command('gameengine', '\GameEngine\Classes\CLI');
        }

        // Loading Pro and Addons
        $this->load_optional_modules();
    }

    /**
     * Load optional modules and addons safely.
     */
    private function load_optional_modules()
    {
        $paths = [
            'addons/restrict-unlock/init.php',
            'addons/progress-map/init.php',
            'addons/restrict-content/init.php'
        ];

        foreach ($paths as $path) {
            $full_path = GAMEENGINE_INCLUDES . $path;
            if (file_exists($full_path)) {
                require_once $full_path;
            }
        }
    }

    /**
     * Plugin Activation Hook.
     */
    public static function activate()
    {
        if (class_exists('\GameEngine\Core\Installer')) {
            (new \GameEngine\Core\Installer())->run();
        }

        set_transient('gameengine_activation_redirect', true, 30);
    }

    /**
     * Plugin Deactivation Hook.
     */
    public static function deactivate()
    {
        if (class_exists('\GameEngine\Core\Installer')) {
            (new \GameEngine\Core\Installer())->uninstall();
        }
    }
}

/**
 * Global accessor function.
 */
function gameengine()
{
    return GameEngine::instance();
}

// Kickstart.
GameEngine::instance();



/**
 * Developer Utility: Reset Setup & Banners.
 * Use this link to reset: yoursite.com/?reset_gameengine_setup=1
 */
add_action('init', function () {

    if (isset($_GET['reset_gameengine_setup']) && current_user_can('manage_options')) {


        delete_option('gameengine_hide_banner_points');
        delete_option('gameengine_hide_banner_achievements');
        delete_option('gameengine_hide_banner_levels');


        delete_option('gameengine_setup_completed');


        delete_option('gameengine_active_addons');

        wp_die(esc_html__('GameEngine settings and banners have been reset! Please refresh your dashboard.', 'gameengine'));
    }
});
