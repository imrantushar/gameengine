<?php

/**
 * Plugin Name:       Gamify
 * Plugin URI:        https://kodezen.com/products/gamify
 * Description:       A powerful gamification plugin for WordPress to boost user engagement.
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
 * @final
 */
final class Gamify
{
    /**
     * The single instance of the class.
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
        // Activation Hook
        register_activation_hook(GAMIFY_FILE, [__CLASS__, 'activate']);

        // 1. Load Text Domain (Priority 0 - Run Early)
        add_action('init', [$this, 'load_textdomain'], 0);

        // 2. Initialize Plugin Modules (Priority 10 - Run after textdomain is loaded)
        add_action('init', [$this, 'init_modules'], 10);
    }

    /**
     * Initialize Plugin Hooks and Classes.
     */
    public function init_modules()
    {
        // 1. Assets & API
        if (class_exists('\Gamify\Assets')) {
            \Gamify\Assets::init();
        }
        if (class_exists('\Gamify\API\Manager')) {
            \Gamify\API\Manager::init();
        }

        // 2. System Services (Except Triggers)
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
        if (class_exists('\Gamify\Classes\Shortcodes')) {
            \Gamify\Classes\Shortcodes::init();
        }

        // Now TriggerRegistry will pick up hooks added by addons
        if (class_exists('\Gamify\Classes\Triggers')) {
            \Gamify\Classes\Triggers::init();
        }

        // 5. Admin Interface
        if (is_admin() && class_exists('\Gamify\Admin')) {
            \Gamify\Admin::init();
        }

        if (is_admin() && isset($_GET['page']) && strpos($_GET['page'], 'gamify') === 0) {
            \Gamify\Classes\JsonGenerator::generate();
        }

        if (defined('WP_CLI') && WP_CLI) {
            \WP_CLI::add_command('gamify', '\Gamify\Classes\CLI');
        }
    }

    /**
     * Plugin Activation Hook.
     */
    public static function activate()
    {
        // Run Installer
        if (class_exists('\Gamify\Core\Installer')) {
            (new \Gamify\Core\Installer())->run();
        }
    }

    /**
     * Load the plugin's translated strings.
     */
    public function load_textdomain()
    {
        load_plugin_textdomain(
            'gamify',
            false,
            dirname(plugin_basename(GAMIFY_FILE)) . '/languages'
        );
    }
}

/**
 * Global accessor function.
 * @return Gamify
 */
function gamify()
{
    return Gamify::instance();
}

// Kickstart the plugin.
Gamify::instance();
