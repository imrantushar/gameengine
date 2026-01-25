<?php

namespace GameEngine\Shortcodes;

class Levels
{
    public function __construct()
    {
        add_shortcode('gameengine_level', array($this, 'render_view'));
    }

    public function render_view()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        ob_start();
        \GameEngine\Helper::get_template('shortcode/levels.php');
        return apply_filters('gameengine/templates/shortcode/levels', ob_get_clean());
    }
}
