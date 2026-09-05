<?php

namespace GameEngine\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

class Points
{
    public function __construct()
    {
        add_shortcode('gameengine_points', array($this, 'render_view'));
    }

    public function render_view()
    {
        if (! is_user_logged_in()) {
            return '0';
        }
        ob_start();
        \GameEngine\Helper::get_template('shortcode/points.php');
        return apply_filters('gameengine/templates/shortcode/points', ob_get_clean());
    }
}
