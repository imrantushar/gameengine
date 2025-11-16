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
 *
 * This final class acts as the main bootstrap for the plugin. It defines constants,
 * loads dependencies, registers hooks, and initializes the core service loader.
 * It follows the Singleton pattern to ensure it is loaded only once.
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
     * This is where the plugin's initialization sequence begins.
     */
    private function __construct()
    {
        $this->define_constants();
        $this->load_dependencies();
        $this->init_loader();
        $this->register_hooks();
    }

    /**
     * Get the single instance of the class.
     *
     * @return Gamify The single instance of the Gamify class.
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
     * Load the plugin's dependencies, including the autoloader and helper functions.
     */
    private function load_dependencies()
    {
        require_once GAMIFY_INCLUDES . 'autoload.php';
        require_once GAMIFY_INCLUDES . 'functions.php';
    }

    /**
     * Register the core WordPress hooks for the plugin.
     */
    private function register_hooks()
    {
        // Register the activation hook to run the installer.
        register_activation_hook(GAMIFY_FILE, [__CLASS__, 'activate']);

        // Register the hook for loading the plugin's text domain.
        add_action('init', [$this, 'load_textdomain']);
    }

    /**
     * Initialize the plugin's core service loader.
     * The Loader is responsible for initializing all other modules (services) of the plugin.
     */
    private function init_loader()
    {
        \Gamify\Core\Loader::instance();
    }

    /**
     * The callback function for the plugin activation hook.
     * This method is static because it's called when the plugin is activated,
     * before the main plugin object might be instantiated.
     */
    public static function activate()
    {
        // Manually require the autoloader as it might not be loaded yet during activation.
        require_once plugin_dir_path(__FILE__) . 'includes/autoload.php';
        (new \Gamify\Core\Installer())->run();
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
 * The main function for returning the Loader instance.
 *
 * This function acts as a global accessor to the plugin's service container (the Loader),
 * allowing other parts of the codebase to interact with the plugin's modules easily.
 * For example: `gamify()->get_service('api_manager')`.
 *
 * @return \Gamify\Core\Loader The Loader instance.
 */
function gamify()
{
    return \Gamify\Core\Loader::instance();
}

// Kickstart the plugin by calling the instance method.
Gamify::instance();
