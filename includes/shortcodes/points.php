<?php

namespace Gamify\Shortcodes;

class Points
{
    public function __construct()
    {
        add_shortcode('gamify_points', array($this, 'render_view'));
    }

    public function render_view()
    {
        if (! is_user_logged_in()) {
            return '0';
        }
        ob_start();
        \Gamify\Helper::get_template('shortcode/points.php');
        return apply_filters('gamify/templates/shortcode/points', ob_get_clean());
    }
}
