<?php

namespace GameEngine\Admin;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Setup
 * Handles the Onboarding Wizard using a custom React entry point.
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

        // Check if we are currently on the setup page.
        if ($self->is_current_page()) {
            add_action('admin_init', array($self, 'handle_setup_screen_render'), 0);
        }

        // Register a hidden submenu to handle the route.
        add_action('admin_menu', array($self, 'register_setup_menu'));
    }

    /**
     * Register a hidden menu page for the setup wizard.
     */
    public function register_setup_menu()
    {
        add_submenu_page(
            'options-writing.php', // Hidden parent
            __('GameEngine Setup', 'gameengine'),
            __('GameEngine Setup', 'gameengine'),
            'manage_options',
            self::PAGE_ID,
            '__return_null' // We render via admin_init instead
        );
    }

    /**
     * Intercept the admin request and render our blank setup canvas.
     */
    public function handle_setup_screen_render()
    {
        // Enqueue necessary assets for React.
        $this->enqueue_setup_assets();

        // Render the view file.
        $this->render_view();

        /**
         * Important: Stop further WP admin execution 
         * to provide a distraction-free setup screen.
         */
        die;
    }

    /**
     * Check if the current URL matches our setup page ID.
     */
    public function is_current_page()
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        return (isset($_GET['page']) && self::PAGE_ID === $_GET['page']);
    }

    /**
     * Enqueue specific build files for the Setup Wizard.
     */
    private function enqueue_setup_assets()
    {
        $asset_file = GAMEENGINE_PATH . 'assets/build/setup.asset.php';

        if (! file_exists($asset_file)) {
            return;
        }

        $asset_data = require $asset_file;

        // Enqueue Setup CSS
        wp_enqueue_style(
            'gameengine-setup-style',
            GAMEENGINE_URL . 'assets/build/setup.css',
            array('wp-components'),
            $asset_data['version']
        );

        // Enqueue Setup JS
        wp_enqueue_script(
            'gameengine-setup-script',
            GAMEENGINE_URL . 'assets/build/setup.js',
            $asset_data['dependencies'],
            $asset_data['version'],
            true
        );

        // Localize Data for React
        $setup_data = array(
            'rest_url'   => rest_url('gameengine/v1'),
            'nonce'      => wp_create_nonce('wp_rest'),
            'admin_url'  => admin_url(),
            'is_pro'     => \GameEngine\Helper::is_pro(),
        );

        wp_localize_script('gameengine-setup-script', 'GameEngineSetup', $setup_data);
    }

    /**
     * Load the HTML view container.
     */
    private function render_view()
    {
        $view_file = GAMEENGINE_PATH . 'includes/Admin/Views/setup.php';
        if (file_exists($view_file)) {
            require $view_file;
        }
    }
}
