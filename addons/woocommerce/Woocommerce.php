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
        // 1. Check if WooCommerce plugin is active
        if (! class_exists('WooCommerce')) {
            return;
        }

        // 2. Initialize Integration
        Integration::init();
    }
}
