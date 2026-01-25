<?php

namespace GameEngine;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Admin
 * Handles initialization of all admin-side modules.
 */
class Admin
{
    /**
     * Initialize Admin modules.
     */
    public static function init()
    {
        $self = new self();

        // Initialize the Menu
        Admin\Menu::init();

        if (class_exists('\GameEngine\Admin\UserProfile')) {
            \GameEngine\Admin\UserProfile::init();
        }
    }
}
