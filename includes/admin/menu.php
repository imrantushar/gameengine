<?php

namespace Gamify\Admin;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Helper;

/**
 * Class Menu
 * Handles Admin Menu registration for the Gamify plugin with custom SVG icons.
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
     * Register Admin Menus dynamically based on Helper list.
     */
    public function admin_menu()
    {
        $main_slug = 'gamify';
        $page_title = $this->get_toplevel_menu_title();
        $icon_url   = $this->get_toplevel_menu_icon_url();

        // Register Main Parent Menu (Dashboard) with custom SVG icon.
        $main_hook = add_menu_page(
            $page_title,
            'Gamify',
            'manage_options',
            $main_slug,
            array($this, 'render_app'),
            $icon_url,
            20
        );
        $this->add_cleanup_hook($main_hook);

        // Loop through Helper menu list to register sub-menus automatically.
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

            if (! empty($item['sub_items'])) {
                foreach ($item['sub_items'] as $sub) {
                    $path_slug = empty($sub['slug']) ? $menu_slug : $menu_slug . '&path=' . $sub['slug'];

                    $hook = add_submenu_page(
                        $main_slug,
                        $sub['title'],
                        '— ' . $sub['title'],
                        'manage_options',
                        $path_slug,
                        array($this, 'render_app')
                    );
                    $this->add_cleanup_hook($hook);
                }
            }
        }
    }

    /**
     * Get the title for the top-level menu.
     * 
     * @return string
     */
    public function get_toplevel_menu_title()
    {
        return apply_filters('gamify/admin/toplevel_menu_title', __('Gamify Dashboard', 'gamify'));
    }

    /**
     * Get the Base64 encoded SVG icon for the top-level menu.
     * 
     * @return string
     */
    public function get_toplevel_menu_icon_url()
    {
        $file_path = GAMIFY_PATH . 'assets/images/logo_black_white.svg';
        $icon_url  = 'dashicons-star-filled'; // Fallback icon

        if (file_exists($file_path)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            $svg_content = file_get_contents($file_path);
            $icon_url    = 'data:image/svg+xml;base64,' . base64_encode($svg_content);
        }

        return apply_filters('gamify/admin/toplevel_menu_icon', $icon_url);
    }

    /**
     * Admin CSS for menu styling.
     */
    public function add_admin_menu_css()
    {
        echo '<style>
			#adminmenu li.toplevel_page_gamify a.toplevel_page_gamify > .wp-menu-image { 
				display: flex;
				justify-content: center;
				align-items: center;
			}
			#adminmenu li.toplevel_page_gamify a.toplevel_page_gamify > .wp-menu-image img {
				max-width: 20px; height: auto; padding: 0 !important;
			}
			#adminmenu li.toplevel_page_gamify ul li a, #adminmenu li.toplevel_page_gamify .wp-submenu > li > a {
				padding: 7px 12px;
			}
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li a[href*="admin.php?page=gamify-addons"] {
				color: #FDB022;
			}
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li.wp-first-item a[href^="admin.php?page=gamify"]:after,
			#adminmenu li.toplevel_page_gamify ul.wp-submenu li a[href*="admin.php?page=gamify-tools"]:after {
				border-bottom: 1px solid hsla(0,0%,100%,.2);
				display: block; float: left; margin: 15px -15px 7px;
				content: ""; width: calc(100% + 26px);
			}
		</style>';
    }

    private function add_cleanup_hook($hook)
    {
        if ($hook) {
            add_action('load-' . $hook, array($this, 'remove_all_notices_and_footer'));
        }
    }

    public function render_app()
    {
        echo '<div id="gamify-admin-app" class="gamify-admin-app"></div>';
    }

    public function remove_all_notices_and_footer()
    {
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
        add_filter('admin_footer_text', '__return_empty_string', 999);
        add_filter('update_footer', '__return_empty_string', 999);
    }
}
