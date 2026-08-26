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
        add_action('admin_enqueue_scripts', array($self, 'enqueue_admin_menu_css'));
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
        // Positioned below the core content items rather than among them. The
        // string keeps the float intact so it does not displace another
        // plugin that claimed the same integer slot.
        $position = apply_filters('gameengine/admin/toplevel_menu_position', '58.6');

        $main_hook = add_menu_page(
            $page_title,
            'GameEngine',
            'manage_options',
            $main_slug,
            array($this, 'render_app'),
            $icon_url,
            $position
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
     * Enqueue the stylesheet for the admin menu.
     *
     * Loaded on every admin screen because it styles the menu itself, which is
     * present regardless of the page being viewed.
     */
    public function enqueue_admin_menu_css()
    {
        wp_enqueue_style(
            'gameengine-admin-menu',
            GAMEENGINE_URL . 'assets/css/admin-menu.css',
            array(),
            GAMEENGINE_VERSION
        );
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
