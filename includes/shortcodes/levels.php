<?php

namespace GameEngine\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

class Levels
{
    public function __construct()
    {
        add_shortcode('gameengine_level', array($this, 'render_view'));
    }

    public function render_view($atts)
    {
        $atts = shortcode_atts(array(
            'user_id'       => get_current_user_id(),
            'point_type_id' => 1,
        ), $atts, 'gameengine_level');

        if (empty($atts['user_id'])) {
            return '';
        }

        wp_enqueue_style('gameengine-shortcode-levels');

        ob_start();
        \GameEngine\Helper::get_template('shortcode/levels.php', array(
            'user_id'       => $atts['user_id'],
            'point_type_id' => $atts['point_type_id'],
        ));
        return apply_filters('gameengine/templates/shortcode/levels', ob_get_clean());
    }
}
