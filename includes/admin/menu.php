<?php

namespace GameEngine\Admin;

if (! defined('ABSPATH')) {
    exit;
}

use GameEngine\Helper;

/**
 * Class Menu
 * Handles Admin Menu registration for the GameEngine plugin with custom SVG icons.
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
        $main_slug = 'gameengine';
        $page_title = $this->get_toplevel_menu_title();
        $icon_url   = $this->get_toplevel_menu_icon_url();

        // Register Main Parent Menu (Dashboard) with custom SVG icon.
        $main_hook = add_menu_page(
            $page_title,
            'GameEngine',
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
        return apply_filters('gameengine/admin/toplevel_menu_title', __('GameEngine Dashboard', 'gameengine'));
    }

    /**
     * Get the Base64 encoded SVG icon for the top-level menu.
     * 
     * @return string
     */
    public function get_toplevel_menu_icon_url()
    {
        $file_path = GAMEENGINE_PATH . 'assets/images/black_white_logo.svg';
        $icon_url  = 'dashicons-star-filled'; // Fallback icon

        if (file_exists($file_path)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            $svg_content = file_get_contents($file_path);
            $icon_url    = 'data:image/svg+xml;base64,' . base64_encode($svg_content);
        }

        return apply_filters('gameengine/admin/toplevel_menu_icon', $icon_url);
    }

    /**
     * Admin CSS for menu styling.
     */
    public function add_admin_menu_css()
    {
        echo '<style>
			#adminmenu li.toplevel_page_gameengine a.toplevel_page_gameengine > .wp-menu-image { 
				display: flex;
				justify-content: center;
				align-items: center;
			}
			#adminmenu li.toplevel_page_gameengine a.toplevel_page_gameengine > .wp-menu-image img {
				max-width: 20px; height: auto; padding: 0 !important;
			}
			#adminmenu li.toplevel_page_gameengine ul li a, #adminmenu li.toplevel_page_gameengine .wp-submenu > li > a {
				padding: 7px 12px;
			}
			#adminmenu li.toplevel_page_gameengine ul.wp-submenu li a[href*="admin.php?page=gameengine-addons"] {
				color: #FDB022;
			}
			#adminmenu li.toplevel_page_gameengine ul.wp-submenu li.wp-first-item a[href^="admin.php?page=gameengine"]:after,
			#adminmenu li.toplevel_page_gameengine ul.wp-submenu li a[href*="admin.php?page=gameengine-tools"]:after {
				border-bottom: 1px solid hsla(0,0%,100%,.2);
				display: block; float: left; margin: -30px 0 0 -36px;
				content: ""; width: calc(100% + 26px);
			}

            .gameengine-notice-bar {
                background: #fff;
                border: 1px solid #ccd0d4;
                border-left: 4px solid #ffb900;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                box-shadow: 0 1px 1px rgba(0,0,0,.04);
            }
            .gameengine-notice-bar p {
                margin: 0;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #3c434a;
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
        if (empty(get_option('permalink_structure'))) {
?>
            <div class="gameengine-notice-bar">
                <p>
                    <strong><?php esc_html_e('GameEngine Warning:', 'gameengine'); ?></strong>
                    <?php esc_html_e('Pretty Permalinks are required for the REST API to function correctly.', 'gameengine'); ?>
                    <a href="<?php echo esc_url(admin_url('options-permalink.php')); ?>" class="button button-primary">
                        <?php esc_html_e('Update Permalinks', 'gameengine'); ?>
                    </a>
                </p>
            </div>
<?php
        }
        echo '<div id="gameengine-admin-app" class="gameengine-admin-app"></div>';
    }

    public function remove_all_notices_and_footer()
    {
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
        add_filter('admin_footer_text', '__return_empty_string', 999);
        add_filter('update_footer', '__return_empty_string', 999);
    }
}
