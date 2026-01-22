<?php

namespace Gamify\Shortcodes;

class Levels
{
    public function __construct()
    {
        add_shortcode('gamify_level', array($this, 'render_view'));
    }

    public function render_view()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        ob_start();
        \Gamify\Helper::get_template('shortcode/levels.php');
        return apply_filters('gamify/templates/shortcode/levels', ob_get_clean());
    }
}
