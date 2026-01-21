<?php

namespace Gamify\Admin;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Helper;

/**
 * Class Menu
 * Handles Admin Menu registration for the Gamify plugin.
 */
class Menu
{

    /**
     * Initialize the Menu class.
     */
    public static function init()
    {
        $self = new self();
        add_action('admin_menu', array($self, 'admin_menu'));
    }

    /**
     * Register Admin Menus.
     */
    public function admin_menu()
    {
        $main_slug = 'gamify';

        //  Register Main Parent Menu (Dashboard)
        $main_hook = add_menu_page(
            __('Gamify Dashboard', 'gamify'),
            'Gamify',
            'manage_options',
            $main_slug,
            array($this, 'render_app'),
            'dashicons-star-filled',
            20
        );
        $this->add_cleanup_hook($main_hook);

        //  Loop through Helper menu list to register standard sub-menus
        foreach (Helper::get_admin_menu_list() as $menu_slug => $item) {
            // Register standard sub-menus (Achievements, Levels, etc.)
            $sub_hook = add_submenu_page(
                $item['parent_slug'],
                $item['title'],
                $item['title'],
                $item['capability'],
                $menu_slug,
                array($this, 'render_app')
            );
            $this->add_cleanup_hook($sub_hook);

            /**
             *  Inject "Types" Sub-menus
             * These point to the React App using a 'path' parameter.
             */
            if ('gamify-achievements' === $menu_slug) {
                $this->add_type_submenu('Achievement Types', 'achievement-types');
            }

            if ('gamify-levels' === $menu_slug) {
                $this->add_type_submenu('Level Types', 'level-types');
            }
        }
    }

    /**
     * Helper to add a "Types" submenu under the main Gamify parent.
     * 
     * @param string $label The menu label.
     * @param string $path  The React router path.
     */
    private function add_type_submenu($label, $path)
    {
        $main_slug = 'gamify';

        // The slug format 'parent&path=slug' allows React Router to pick it up via query string.
        $menu_slug = $main_slug . '-' . (('achievement-types' === $path) ? 'achievements' : 'levels') . '&path=' . $path;

        $hook = add_submenu_page(
            $main_slug,
            __($label, 'gamify'),
            '— ' . __($label, 'gamify'), // Indented with dash for visual hierarchy
            'manage_options',
            $menu_slug,
            array($this, 'render_app')
        );

        $this->add_cleanup_hook($hook);
    }

    /**
     * Registers a hook to remove WP notices and footers for a clean React UI experience.
     *
     * @param string $hook The page hook suffix.
     */
    private function add_cleanup_hook($hook)
    {
        if ($hook) {
            add_action('load-' . $hook, array($this, 'remove_all_notices_and_footer'));
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
     * Removes default WordPress Admin Notices and Footer for a Single Page App experience.
     */
    public function remove_all_notices_and_footer()
    {
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
        add_filter('admin_footer_text', '__return_empty_string', 999);
        add_filter('update_footer', '__return_empty_string', 999);
    }
}
