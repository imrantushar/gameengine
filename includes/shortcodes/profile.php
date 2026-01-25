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
        if (! is_user_logged_in()) {
            return sprintf('<p class="gf-login-msg">%s</p>', esc_html__('Please log in to view your progress.', 'gameengine'));
        }

        ob_start();
        \GameEngine\Helper::get_template('shortcode/profile.php');
        return apply_filters('gameengine/templates/shortcode/profile', ob_get_clean());
    }
}
