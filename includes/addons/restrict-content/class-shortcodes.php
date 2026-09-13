<?php

namespace GameEngine\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Shortcodes
 * Handles partial content restriction via [gameengine_restrict].
 */
class Shortcodes
{

    public function __construct()
    {
        add_shortcode('gameengine_restrict', array($this, 'render_restricted_content'));
    }

    /**
     * [gameengine_restrict type="points" value="100" message="Custom Lock Message"]...[/gameengine_restrict]
     */
    public function render_restricted_content($atts, $content = null)
    {
        $args = shortcode_atts(
            array(
                'type'    => 'points',
                'value'   => 0,
                'message' => '',
            ),
            $atts
        );

        $type  = sanitize_text_field($args['type']);
        $value = sanitize_text_field($args['value']);

        if (Restriction_Helper::can_access($type, $value)) {
            return do_shortcode($content);
        }

        // Without a custom message, the box names what unlocks it.
        return Restriction_Helper::get_locked_ui(sanitize_textarea_field($args['message']), $type, $value);
    }
}

new Shortcodes();
