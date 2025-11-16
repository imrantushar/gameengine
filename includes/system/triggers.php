<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Main Triggers service class.
 * Initializes the trigger system.
 */
class Triggers
{
    public function __construct()
    {
        // Register all available triggers
        TriggerRegistry::register();

        // Attach the hooks to WordPress
        $handler = new TriggerHandler();
        $handler->attach_hooks();
    }
}
