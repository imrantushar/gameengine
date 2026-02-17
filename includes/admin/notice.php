<?php

namespace GameEngine\Admin;

if (! defined('ABSPATH')) exit;

/**
 * Class Notices
 * Handles critical admin notices, ensuring they show even on clean dashboards.
 */
class Notices
{
    public static function init()
    {
        $self = new self();

        // Use a very high priority to ensure it runs after any cleanup scripts.
        add_action('admin_notices', array($self, 'check_permalink_settings'), 999);

        add_action('admin_init', array($self, 'dismiss_permalink_notice'));
    }

    /**
     * Shows a notice if the permalink structure is set to 'Plain'.
     */
    public function check_permalink_settings()
    {
        if (! current_user_can('manage_options')) {
            return;
        }

        $permalink_structure = get_option('permalink_structure');
        $is_dismissed        = get_option('gameengine_dismiss_permalink_notice');

        // Show notice if permalink is 'Plain' and not dismissed.
        if (empty($permalink_structure) && ! $is_dismissed) {
            $this->display_notice();
        }
    }

    /**
     * Renders the HTML for the permalink notice.
     */
    private function display_notice()
    {
        $class   = 'notice notice-warning is-dismissible';
        $message = __('<strong>GameEngine:</strong> Pretty Permalinks are required for the REST API to function correctly. Please update your permalink settings.', 'gameengine');
        $url     = admin_url('options-permalink.php');
        $button  = __('Update Permalinks', 'gameengine');
        $dismiss_url = wp_nonce_url(add_query_arg('gameengine_dismiss_notice', 'permalink'), 'gameengine_dismiss_nonce');

        /**
         * Inline styles added to ensure visibility even if 
         * some dashboard CSS tries to hide standard notices.
         */
        printf(
            '<div class="%1$s" style="border-left-color: #ffb900; position: relative; z-index: 9999;">
                <p>%2$s <a href="%3$s" class="button button-primary" style="margin-left: 10px;">%4$s</a></p>
                <a href="%5$s" class="notice-dismiss" style="text-decoration:none;"></a>
            </div>',
            esc_attr($class),
            $message, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            esc_url($url),
            esc_html($button),
            esc_url($dismiss_url)
        );
    }

    /**
     * Handles notice dismissal logic.
     */
    public function dismiss_permalink_notice()
    {
        if (isset($_GET['gameengine_dismiss_notice']) && 'permalink' === $_GET['gameengine_dismiss_notice']) {
            check_admin_referer('gameengine_dismiss_nonce', 'gameengine_dismiss_nonce');
            update_option('gameengine_dismiss_permalink_notice', true);
            wp_safe_redirect(remove_query_arg(array('gameengine_dismiss_notice', 'gameengine_dismiss_nonce')));
            exit;
        }
    }
}

Notices::init();
