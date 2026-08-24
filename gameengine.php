<?php

/**
 * Plugin Name:       GameEngine - Gamification for Website
 * Plugin URI:        https://kodezen.com/products/gameengine
 * Description:       Award points, achievements, and ranks to boost user engagement and build a loyal community.
 * Version:           1.2.0
 * Author:            kodezen
 * Author URI:        https://kodezen.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gameengine
 * Domain Path:       /languages/
 * Requires at least: 5.8
 * Requires PHP:      7.4
 */

// Exit if accessed directly to prevent direct script access.
if (!defined('ABSPATH')) {
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
        define('GAMEENGINE_VERSION', '1.2.0');
        define('GAMEENGINE_PLUGIN_SLUG', 'gameengine');
        define('GAMEENGINE_FILE', __FILE__);
        define('GAMEENGINE_BASENAME', plugin_basename(GAMEENGINE_FILE));
        define('GAMEENGINE_PATH', wp_normalize_path(plugin_dir_path(GAMEENGINE_FILE)));
        define('GAMEENGINE_URL', plugin_dir_url(GAMEENGINE_FILE));
        define('GAMEENGINE_INCLUDES', GAMEENGINE_PATH . 'includes/');
        define('GAMEENGINE_ROOT_DIR_PATH', plugin_dir_path(GAMEENGINE_FILE));
    }

    /**
     * Load the plugin's dependencies.
     */
    private function load_dependencies()
    {

        if (file_exists(GAMEENGINE_PATH . 'vendor/autoload.php')) {
            require_once GAMEENGINE_PATH . 'vendor/autoload.php';
        }

        if (file_exists(GAMEENGINE_PATH . 'vendor/prefixed/autoload.php')) {
            require_once GAMEENGINE_PATH . 'vendor/prefixed/autoload.php';
        }

        if (file_exists(GAMEENGINE_INCLUDES . 'autoload.php')) {
            require_once GAMEENGINE_INCLUDES . 'autoload.php';
        }
        if (file_exists(GAMEENGINE_INCLUDES . 'functions.php')) {
            require_once GAMEENGINE_INCLUDES . 'functions.php';
        }
    }

    /**
     * Register the core WordPress hooks.
     */
    private function register_hooks()
    {
        register_activation_hook(GAMEENGINE_FILE, array(__CLASS__, 'activate'));
        register_deactivation_hook(GAMEENGINE_FILE, array(__CLASS__, 'deactivate'));
        add_action('deactivated_plugin', array($this, 'handle_dependency_deactivation'), 10, 2);

        add_action('init', array('\GameEngine\Core\Installer', 'maybe_sync_schema'), 4);
        add_action('init', array($this, 'init_modules'), 10);
        add_filter('gameengine_settings_data', array($this, 'inject_default_settings'), 10);
    }

    /**
     * Inject default settings data.
     */
    public function inject_default_settings($settings)
    {
        $settings['config']['is_pro'] = false;
        return $settings;
    }

    /**
     * Initialize Plugin Hooks and Classes.
     */
    public function init_modules()
    {
        if (is_admin() && class_exists('\GameEngine\Admin\Setup')) {
            \GameEngine\Admin\Setup::init();
        }

        if (class_exists('\GameEngine\Classes\TaxonomyManager')) {
            \GameEngine\Classes\TaxonomyManager::init();
        }

        if (class_exists('\GameEngine\Assets')) {
            \GameEngine\Assets::init();
        }
        if (class_exists('\GameEngine\API\Manager')) {
            \GameEngine\API\Manager::init();
        }

        $services = array(
            '\GameEngine\Classes\Scheduler',
            '\GameEngine\Classes\Logger',
            '\GameEngine\Classes\AchievementsManager',
            '\GameEngine\Classes\LevelsManager',
            '\GameEngine\Classes\EmailManager',
            '\GameEngine\Shortcode',
            '\GameEngine\Classes\Triggers',
        );

        foreach ($services as $service) {
            if (class_exists($service)) {
                $service::init();
            }
        }

        if (is_admin()) {
            if (class_exists('\GameEngine\Admin')) {
                \GameEngine\Admin::init();
            }
        }

        if (defined('WP_CLI') && WP_CLI) {
            \WP_CLI::add_command('gameengine', '\GameEngine\Classes\CLI');
        }

        $this->load_optional_modules();

        do_action('gameengine_init');
    }

    private function load_optional_modules()
    {
        $paths = array(
            'addons/restrict-unlock/init.php',
            'addons/progress-map/init.php',
            'addons/restrict-content/init.php'
        );

        foreach ($paths as $path) {
            $full_path = GAMEENGINE_INCLUDES . $path;
            if (file_exists($full_path)) {
                require_once $full_path;
            }
        }
    }

    public static function activate()
    {
        if (class_exists('\GameEngine\Core\Installer')) {
            (new \GameEngine\Core\Installer())->run();
        }
        set_transient('gameengine_activation_redirect', true, 30);
    }

    public static function deactivate()
    {
        if (class_exists('\GameEngine\Core\Installer')) {
            (new \GameEngine\Core\Installer())->uninstall();
        }
    }

    /**
     * Keep addon settings consistent when dependency plugins are deactivated.
     *
     * @param string $plugin              Deactivated plugin basename.
     * @param bool   $network_deactivating Whether the plugin is network deactivated.
     */
    public function handle_dependency_deactivation($plugin, $network_deactivating)
    {
        $dependency_map = array(
            'academy/academy.php'          => 'academylms',
            'tutor/tutor.php'              => 'tutorlms',
            'woocommerce/woocommerce.php'  => 'woocommerce',
            'storeengine/storeengine.php'  => 'storeengine',
        );

        if (! isset($dependency_map[$plugin])) {
            return;
        }

        $addon_slug = $dependency_map[$plugin];
        $active_addons = get_option('gameengine_active_addons', array());

        if (! in_array($addon_slug, $active_addons, true)) {
            return;
        }

        $active_addons = array_values(array_diff($active_addons, array($addon_slug)));
        update_option('gameengine_active_addons', $active_addons);

        if (class_exists('\GameEngine\Classes\TriggerRegistry')) {
            \GameEngine\Classes\TriggerRegistry::reset();
        }

        if (class_exists('\GameEngine\Classes\JsonGenerator')) {
            \GameEngine\Classes\JsonGenerator::generate();
        }
    }
}

/**
 * Global accessor.
 */
function gameengine()
{
    return GameEngine::instance();
}

GameEngine::instance();
