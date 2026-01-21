<?php

namespace Gamify\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Shortcodes
 * Handles partial content restriction via [gamify_restrict].
 */
class Shortcodes
{

    public function __construct()
    {
        add_shortcode('gamify_restrict', array($this, 'render_restricted_content'));
    }

    /**
     * [gamify_restrict type="points" value="100" message="Custom Lock Message"]...[/gamify_restrict]
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

        $can_access = Restriction_Helper::can_access(sanitize_text_field($args['type']), sanitize_text_field($args['value']));

        if ($can_access) {
            return do_shortcode($content);
        }

        return Restriction_Helper::get_locked_ui(sanitize_textarea_field($args['message']));
    }
}

new Shortcodes();
