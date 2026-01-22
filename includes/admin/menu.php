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
        add_action('admin_head', array($self, 'add_admin_menu_css'));
    }

    /**
     * Register Admin Menus.
     */
    public function admin_menu()
    {
        $main_slug = 'gamify';

        // Register Main Parent Menu (Dashboard).
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

        // Loop through Helper menu list to register standard sub-menus.
        foreach (Helper::get_admin_menu_list() as $menu_slug => $item) {
            // Skip parent slug registration if it matches main_slug to avoid duplicates.
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
             *  Inject "All" and "Types" Sub-menus for Achievements.
             */
            if ('gamify-achievements' === $menu_slug) {
                // Add "All Achievements" link.
                $all_ach_label = __('All Achievements', 'gamify');
                $all_ach_hook  = add_submenu_page(
                    $main_slug,
                    $all_ach_label,
                    '— ' . $all_ach_label,
                    'manage_options',
                    $menu_slug,
                    array($this, 'render_app')
                );
                $this->add_cleanup_hook($all_ach_hook);

                // Add "Achievement Types" link.
                $this->add_type_submenu(__('Achievement Types', 'gamify'), 'achievement-types');
            }

            /**
             * Inject "All" and "Types" Sub-menus for Levels.
             */
            if ('gamify-levels' === $menu_slug) {
                // Add "All Levels" link.
                $all_lvl_label = __('All Levels', 'gamify');
                $all_lvl_hook  = add_submenu_page(
                    $main_slug,
                    $all_lvl_label,
                    '— ' . $all_lvl_label,
                    'manage_options',
                    $menu_slug,
                    array($this, 'render_app')
                );
                $this->add_cleanup_hook($all_lvl_hook);

                // Add "Level Types" link.
                $this->add_type_submenu(__('Level Types', 'gamify'), 'level-types');
            }
        }
    }

    /**
     * Admin css.
     */
    function add_admin_menu_css()
    {
        echo '<style>
			#adminmenu li.toplevel_page_gamify a.toplevel_page_gamify > .wp-menu-image { 
				display: flex;
				justify-content: center;
				align-items: center;
			}
			#adminmenu li.toplevel_page_gamify a.toplevel_page_gamify > .wp-menu-image img {
				max-width: 20px;
				height: auto;
				padding: 0 !important;
			}
			#adminmenu li.toplevel_page_gamify ul li a, #adminmenu li.toplevel_page_gamify .wp-submenu > li > a {
				padding: 7px 12px;
			}

			#adminmenu li.toplevel_page_gamify ul.wp-submenu li {
				clear: both;
			}
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li a[href*="admin.php?page=gamify-addons"],
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li a[href^="admin.php?page=gamify-addons"] {
				color: #FDB022;
			}
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li.wp-first-item a[href^="admin.php?page=gamify"]:after,
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li.wp-first-item a[href*="admin.php?page=gamify"]:after,
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li a[href*="admin.php?page=gamify-tools"]:after,
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li a[href^="admin.php?page=gamify-tools"]:after {
				border-bottom: 1px solid hsla(0,0%,100%,.2);
				display: block;
				float: left;
				margin: 15px -15px 7px;
				content: "";
				width: calc(100% + 26px);
			}
		</style>';
    }

    /**
     * Helper to add a "Types" submenu under the main Gamify parent.
     *
     * @param string $label The translated menu label.
     * @param string $path  The React router path.
     */
    private function add_type_submenu($label, $path)
    {
        $main_slug = 'gamify';

        /**
         * The slug format 'parent&path=slug' allows React Router to pick it up via query string.
         * Note: $label is already translated at the call-site to pass WPCS.
         */
        $parent_key = ('achievement-types' === $path) ? 'achievements' : 'levels';
        $menu_slug  = $main_slug . '-' . $parent_key . '&path=' . $path;

        $hook = add_submenu_page(
            $main_slug,
            $label,
            '— ' . $label, // Visual indentation with dash
            'manage_options',
            $menu_slug,
            array($this, 'render_app')
        );

        $this->add_cleanup_hook($hook);
    }

    /**
     * Registers a hook to remove WP notices and footers.
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
     * Removes default WordPress Admin Notices and Footer for a clean UI.
     */
    public function remove_all_notices_and_footer()
    {
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
        add_filter('admin_footer_text', '__return_empty_string', 999);
        add_filter('update_footer', '__return_empty_string', 999);
    }
}
