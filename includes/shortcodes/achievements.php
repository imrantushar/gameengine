<?php

namespace GameEngine\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

class Achievements
{
    public function __construct()
    {
        add_shortcode('gameengine_achievements', array($this, 'render_view'));
    }

    public function render_view($atts)
    {
        if (! is_user_logged_in()) {
            return '';
        }

        ob_start();
        \GameEngine\Helper::get_template('shortcode/achievements.php');
        return apply_filters('gameengine/templates/shortcode/achievements', ob_get_clean());
    }
}
