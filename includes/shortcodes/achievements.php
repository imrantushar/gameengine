<?php

namespace Gamify\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

class Achievements
{
    public function __construct()
    {
        add_shortcode('gamify_achievements', array($this, 'render_view'));
    }

    public function render_view($atts)
    {
        if (! is_user_logged_in()) {
            return '';
        }

        ob_start();
        \Gamify\Helper::get_template('shortcode/achievements.php');
        return apply_filters('gamify/templates/shortcode/achievements', ob_get_clean());
    }
}
