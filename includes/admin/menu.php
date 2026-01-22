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
		add_action( 'admin_head', array( $self, 'add_admin_menu_css' ) );
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
             * Inject "Types" Sub-menus.
             * Labels are translated here as literals to pass Plugin Check.
             */
            if ('gamify-achievements' === $menu_slug) {
                $this->add_type_submenu(__('Types', 'gamify'), 'achievement-types');
            }

            if ('gamify-levels' === $menu_slug) {
                $this->add_type_submenu(__('Types', 'gamify'), 'level-types');
            }
        }
    }

    /**
     * Admin css.
     */
    function add_admin_menu_css() {
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

        // The slug format 'parent&path=slug' allows React Router to pick it up via query string.
        $menu_slug = $main_slug . '-' . (('achievement-types' === $path) ? 'achievements' : 'levels') . '&path=' . $path;

        /**
         * $label is already translated in the call site, 
         * so we use it directly to satisfy WPCS.
         */
        $hook = add_submenu_page(
            $main_slug,
            $label,
            $label, // Visual hierarchy with dash
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
