<?php

namespace Gamify\Shortcodes;

class ProgressMap
{
    public function __construct()
    {
        add_shortcode('gamify_progress_map', array($this, 'render_view'));
    }

    public function render_view()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) {
            return \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html(get_current_user_id());
        }
        return sprintf('<p>%s</p>', esc_html__('Progress Map addon is not active.', 'gamify'));
    }
}
