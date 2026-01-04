<?php

namespace Gamify\Admin;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Helper;

class Menu
{
    /**
     * Initialize the Menu class.
     * Called by Gamify\Admin::init()
     */
    public static function init()
    {
        $self = new self();
        add_action('admin_menu', [$self, 'admin_menu']);
    }

    /**
     * Register Admin Menus.
     */
    public function admin_menu()
    {
        $page_title = __('Gamify Dashboard', 'gamify');
        $main_slug  = 'gamify';

        // 1. Add Parent Menu
        $main_hook = add_menu_page(
            $page_title,
            'Gamify',
            'manage_options',
            $main_slug,
            [$this, 'render_app'],
            'dashicons-star-filled',
            20
        );

        // Add cleanup hook for the main page
        $this->add_cleanup_hook($main_hook);

        // 2. Add Submenus from Helper
        foreach (Helper::get_admin_menu_list() as $menu_slug => $item) {
            $sub_hook = add_submenu_page(
                $item['parent_slug'],
                $item['title'],
                $item['title'],
                $item['capability'],
                $menu_slug,
                [$this, 'render_app']
            );

            // Add cleanup hook for subpages
            $this->add_cleanup_hook($sub_hook);
        }
    }

    /**
     * Helper to register the load-{page} hook immediately.
     */
    private function add_cleanup_hook($hook)
    {
        if ($hook) {
            add_action('load-' . $hook, [$this, 'remove_all_notices_and_footer']);
        }
    }

    /**
     * Render the React App container.
     */
    public function render_app()
    {
        echo '<div id="gamify-admin-app" class="gamify-admin-app"></div>';
    }

    /**
     * Remove Admin Notices and Footer for SPA experience.
     */
    public function remove_all_notices_and_footer()
    {
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
        add_filter('admin_footer_text', '__return_empty_string', 999);
        add_filter('update_footer', '__return_empty_string', 999);
    }
}
