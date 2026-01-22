<?php

/**
 * Plugin Name:       Gamify - Gamification for WordPress
 * Plugin URI:        https://kodezen.com/products/gamify
 * Description:       Award points, achievements, and ranks to boost user engagement and build a loyal community.
 * Version:           1.0.0
 * Author:            kodezen
 * Author URI:        https://kodezen.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gamify
 * Domain Path:       /languages
 */

// Exit if accessed directly to prevent direct script access.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * The main Gamify plugin class.
 *
 * @final
 */
final class Gamify
{
    /**
     * The single instance of the class.
     *
     * @var Gamify|null
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
     * @return Gamify
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
        define('GAMIFY_VERSION', '1.0.0');
        define('GAMIFY_FILE', __FILE__);
        define('GAMIFY_PLUGIN_SLUG', 'gamify');
        define('GAMIFY_PATH', wp_normalize_path(plugin_dir_path(GAMIFY_FILE)));
        define('GAMIFY_URL', plugin_dir_url(GAMIFY_FILE));
        define('GAMIFY_INCLUDES', GAMIFY_PATH . 'includes/');
        define('GAMIFY_ROOT_DIR_PATH', plugin_dir_path(__FILE__));
    }

    /**
     * Load the plugin's dependencies.
     */
    private function load_dependencies()
    {
        require_once GAMIFY_INCLUDES . 'autoload.php';
        require_once GAMIFY_INCLUDES . 'functions.php';
    }

    /**
     * Register the core WordPress hooks.
     */
    private function register_hooks()
    {
        // Activation Hook.
        register_activation_hook(GAMIFY_FILE, array(__CLASS__, 'activate'));

        // Deactivation Hook.
        register_deactivation_hook(GAMIFY_FILE, [__CLASS__, 'deactivate']);

        // Initialize Plugin Modules.
        add_action('init', array($this, 'init_modules'), 10);
    }

    /**
     * Initialize Plugin Hooks and Classes.
     */
    public function init_modules()
    {

        if (class_exists('\Gamify\Classes\TaxonomyManager')) {
            \Gamify\Classes\TaxonomyManager::init();
        }
        // Assets & API.
        if (class_exists('\Gamify\Assets')) {
            \Gamify\Assets::init();
        }
        if (class_exists('\Gamify\API\Manager')) {
            \Gamify\API\Manager::init();
        }

        // System Services.
        if (class_exists('\Gamify\Classes\Scheduler')) {
            \Gamify\Classes\Scheduler::init();
        }
        if (class_exists('\Gamify\Classes\Logger')) {
            \Gamify\Classes\Logger::init();
        }
        if (class_exists('\Gamify\Classes\AchievementsManager')) {
            \Gamify\Classes\AchievementsManager::init();
        }
        if (class_exists('\Gamify\Classes\LevelsManager')) {
            \Gamify\Classes\LevelsManager::init();
        }
        if (class_exists('\Gamify\Classes\EmailManager')) {
            \Gamify\Classes\EmailManager::init();
        }
        // if (class_exists('\Gamify\Classes\Shortcodes')) {
        //     \Gamify\Classes\Shortcodes::init();
        // }
        if (class_exists('\Gamify\Shortcode')) {
            \Gamify\Shortcode::init();
        }

        // Triggers.
        if (class_exists('\Gamify\Classes\Triggers')) {
            \Gamify\Classes\Triggers::init();
        }

        // Admin Interface.
        if (is_admin()) {
            if (class_exists('\Gamify\Admin')) {
                \Gamify\Admin::init();
            }

            /**
             * Check if we are on a Gamify admin page.
             * Nonce verification is not required for purely routing/page-load logic.
             */
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $current_page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

            if ($current_page && 0 === strpos($current_page, 'gamify') && current_user_can('manage_options')) {
                if (class_exists('\Gamify\Classes\JsonGenerator')) {
                    \Gamify\Classes\JsonGenerator::generate();
                }
            }
        }

        if (defined('WP_CLI') && WP_CLI) {
            \WP_CLI::add_command('gamify', '\Gamify\Classes\CLI');
        }

        if (file_exists(GAMIFY_PATH . 'includes/pro/init.php')) {
            require_once GAMIFY_PATH . 'includes/pro/init.php';
        }

        if (file_exists(GAMIFY_PATH . 'includes/addons/restrict-unlock/init.php')) {
            require_once GAMIFY_PATH . 'includes/addons/restrict-unlock/init.php';
        }

        if (file_exists(GAMIFY_PATH . 'includes/addons/progress-map/init.php')) {
            require_once GAMIFY_PATH . 'includes/addons/progress-map/init.php';
        }

        if (file_exists(GAMIFY_PATH . 'includes/addons/restrict-content/init.php')) {
            require_once GAMIFY_PATH . 'includes/addons/restrict-content/init.php';
        }
    }

    /**
     * Plugin Activation Hook.
     */
    public static function activate()
    {
        // Run Installer.
        if (class_exists('\Gamify\Core\Installer')) {
            (new \Gamify\Core\Installer())->run();
        }
    }

    /**
     * Plugin Dactivation Hook.
     */
    public static function deactivate()
    {
        if (class_exists('\Gamify\Core\Installer')) {
            (new \Gamify\Core\Installer())->uninstall();
        }
    }
}

/**
 * Global accessor function.
 *
 * @return Gamify
 */
function gamify()
{
    return Gamify::instance();
}

// Kickstart the plugin.
Gamify::instance();
