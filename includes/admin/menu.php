<?php

namespace Gamify\Admin;

if (! defined('ABSPATH')) exit;

class Menu
{
    /**
     * @var array Stores all the page hooks created by this class.
     */
    private $page_hooks = [];

    public function __construct()
    {
        add_action('admin_menu', [$this, 'register_menus']);
        add_action('admin_init', [$this, 'register_load_hooks_for_all_pages']);
    }

    public function register_menus()
    {
        // Main Gamify Menu (Acts as the container)
        $this->page_hooks[] = add_menu_page(
            __('Gamify Dashboard', 'gamify'),
            'Gamify',
            'manage_options',
            'gamify', // Parent Slug
            [$this, 'render_app'],
            'dashicons-star-filled',
            20
        );

        // Submenu 1: Dashboard
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Dashboard', 'gamify'),
            __('Dashboard', 'gamify'),
            'manage_options',
            'gamify', // Same slug as parent
            [$this, 'render_app']
        );

        // Submenu 2: Points System (Renamed from Points to match UI?) or just "Points System"
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Points System', 'gamify'),
            __('Points System', 'gamify'),
            'manage_options',
            'gamify-points',
            [$this, 'render_app']
        );

        // Submenu 3: Achievements (NEW)
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Achievements', 'gamify'),
            __('Achievements', 'gamify'),
            'manage_options',
            'gamify-achievements',
            [$this, 'render_app']
        );

        // Submenu 4: Levels (NEW)
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Levels', 'gamify'),
            __('Levels', 'gamify'),
            'manage_options',
            'gamify-levels',
            [$this, 'render_app']
        );

        // Submenu 5: Logs
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Logs', 'gamify'),
            __('Logs', 'gamify'),
            'manage_options',
            'gamify-logs',
            [$this, 'render_app']
        );

        // Submenu 6: Leaderboards (NEW)
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Leaderboards', 'gamify'),
            __('Leaderboards', 'gamify'),
            'manage_options',
            'gamify-leaderboards',
            [$this, 'render_app']
        );

        // Submenu 7: Settings
        $this->page_hooks[] = add_submenu_page(
            'gamify',
            __('Settings', 'gamify'),
            __('Settings', 'gamify'),
            'manage_options',
            'gamify-settings',
            [$this, 'render_app']
        );
    }

    /**
     * Dynamically adds the 'load' hook for all registered menu and submenu pages.
     */
    public function register_load_hooks_for_all_pages()
    {
        foreach ($this->page_hooks as $hook) {
            if ($hook) {
                add_action('load-' . $hook, [$this, 'remove_all_notices_and_footer']);
            }
        }
    }

    public function render_app()
    {
        echo '<div id="gamify-admin-app"></div>';
    }

    /**
     * Removes all admin notices and the WordPress footer for a clean SPA experience.
     */
    public function remove_all_notices_and_footer()
    {
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');

        add_filter('admin_footer_text', '__return_empty_string', 999);
        add_filter('update_footer', '__return_empty_string', 999);
    }
}
