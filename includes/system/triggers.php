<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Main Triggers service class.
 * Initializes the trigger system by registering triggers and attaching handlers.
 */
class Triggers
{
    public function __construct()
    {
        // 1. Initialize the registry (load default & external triggers)
        TriggerRegistry::init();

        // 2. Attach the hook listeners
        $handler = new TriggerHandler();
        $handler->attach_hooks();
    }
}
