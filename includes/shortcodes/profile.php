<?php

namespace Gamify\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

class Profile
{
    public function __construct()
    {
        add_shortcode('gamify_profile', array($this, 'render_view'));
    }

    public function render_view($atts)
    {
        if (! is_user_logged_in()) {
            return sprintf('<p class="gf-login-msg">%s</p>', esc_html__('Please log in to view your progress.', 'gamify'));
        }

        ob_start();
        \Gamify\Helper::get_template('shortcode/profile.php');
        return apply_filters('gamify/templates/shortcode/profile', ob_get_clean());
    }
}
