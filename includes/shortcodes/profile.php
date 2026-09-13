<?php

namespace GameEngine\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

class Profile
{
    public function __construct()
    {
        add_shortcode('gameengine_profile', array($this, 'render_view'));
    }

    public function render_view($atts)
    {
        \GameEngine\Assets::enqueue_frontend();

        if (! is_user_logged_in()) {
            return sprintf(
                '<div class="gameengine-ui"><p class="gameengine-notice">%1$s<span>%2$s</span></p></div>',
                \GameEngine\Icons::get('info'),
                esc_html__('Please log in to view your progress.', 'gameengine')
            );
        }

        // The tabs and the achievement share buttons need the frontend script.
        \GameEngine\Assets::enqueue_frontend(true);

        ob_start();
        \GameEngine\Helper::get_template('shortcode/profile.php');
        return apply_filters('gameengine/templates/shortcode/profile', ob_get_clean());
    }
}
