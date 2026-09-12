<?php

namespace GameEngine\Addons\RewardsStore;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Shortcode
 * Renders the [gameengine_rewards] frontend catalog so logged-in users
 * can browse and redeem rewards from their points balance.
 */
class Shortcode
{

    public function __construct()
    {
        add_shortcode('gameengine_rewards', array($this, 'render_view'));
    }

    /**
     * Render the rewards catalog shortcode.
     *
     * @return string
     */
    public function render_view()
    {
        ob_start();
        \GameEngine\Helper::get_template('shortcode/rewards.php');
        return apply_filters('gameengine/templates/shortcode/rewards', ob_get_clean());
    }
}
