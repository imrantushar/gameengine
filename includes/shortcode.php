<?php

namespace GameEngine;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Shortcode
 * Main entry point to initialize all shortcode handlers.
 */
class Shortcode
{

    public static function init()
    {
        $self = new self();
        $self->dispatch_shortcodes();
    }

    /**
     * Instantiate individual shortcode classes.
     */
    public function dispatch_shortcodes()
    {
        new Shortcodes\Profile();
        new Shortcodes\Points();
        new Shortcodes\Achievements();
        new Shortcodes\Levels();
        new Shortcodes\ProgressMap();
    }
}
