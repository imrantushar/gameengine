<?php

namespace GameEngine\Addons\RestrictUnlock;

if (!defined('ABSPATH')) exit;

/**
 * Initializes the Restrict Unlock Addon if active.
 */
class Init
{
    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (in_array('restrict_unlock', $active_addons)) {
            require_once __DIR__ . '/class-restriction-engine.php';
            Restriction_Engine::init();
        }
    }
}

Init::init();
