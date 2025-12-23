<?php

namespace Gamify\Addons\Woocommerce;

if (! defined('ABSPATH')) {
    exit;
}

final class Woocommerce
{
    private static $instance = null;

    public static function init()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        // Check if WooCommerce is active
        if (! class_exists('WooCommerce')) {
            return;
        }

        $this->init_hooks();
    }

    private function init_hooks()
    {
        // Load Integration Logic
        Integration::init();

        // Load Settings (Optional, if separate settings page needed)
        // Settings::init();
    }
}
