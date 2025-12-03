<?php

/**
 * Plugin Name:       Gamify
 * Plugin URI:        https://example.com/gamify
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
        define('GAMIFY_PATH', wp_normalize_path(plugin_dir_path(GAMIFY_FILE)));
        define('GAMIFY_URL', plugin_dir_url(GAMIFY_FILE));
        define('GAMIFY_INCLUDES', GAMIFY_PATH . 'includes/');
    }

    /**
     * Load the plugin's dependencies.
     */
    private function load_dependencies()
    {
        // Load the Autoloader
        require_once GAMIFY_INCLUDES . 'Autoload.php';

        // Initialize the Autoloader (gamify Style)
        // Note: Make sure your Autoload class has get_instance() method as discussed before.
        if (class_exists('\Gamify\Autoload')) {
            \Gamify\Autoload::get_instance();
        }

        // Load Helper functions if any
        if (file_exists(GAMIFY_INCLUDES . 'functions.php')) {
            require_once GAMIFY_INCLUDES . 'functions.php';
        }
    }

    /**
     * Register the core WordPress hooks.
     * Note: We do NOT initialize classes here directly to prevent translation errors.
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
     * This runs inside the 'init' hook, safe for translations.
     */
    public function init_modules()
    {
        // Global Assets (Frontend & Backend Scripts)
        \Gamify\Assets::init();

        // API Manager (Registers REST API Routes)
        \Gamify\API\Manager::init();

        // System Services (Loggers, Schedulers, Triggers)
        \Gamify\Classes\Scheduler::init();
        \Gamify\Classes\Logger::init();

        // Triggers contain translatable strings, so it MUST load here
        \Gamify\Classes\Triggers::init();

        \Gamify\Classes\LevelsManager::init();

        // Admin Only Modules
        if (is_admin()) {
            \Gamify\Admin::init();
        }
    }

    /**
     * Plugin Activation Hook.
     */
    public static function activate()
    {
        // Ensure Autoloader is loaded during activation context

        require_once plugin_dir_path(__FILE__) . 'includes/Autoload.php';

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
 * Since we removed the Loader class, we return the main instance.
 *
 * @return Gamify
 */
function gamify()
{
    return Gamify::instance();
}

// Kickstart the plugin.
Gamify::instance();
