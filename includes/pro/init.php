<?php

namespace Gamify\Pro;

if (! defined('ABSPATH')) exit;

/**
 * Initializes Pro Features
 */
class Pro_Init
{
    public static function init()
    {
        // Load Time Based Logic
        require_once plugin_dir_path(__FILE__) . 'class-time-based-rewards.php';
        Time_Based_Rewards::init();

        //  Load the Pro Logic Handler
        require_once plugin_dir_path(__FILE__) . 'class-pro-logic-handler.php';
        Pro_Logic_Handler::init();
    }
}

Pro_Init::init();
