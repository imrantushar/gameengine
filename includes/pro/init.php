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
        require_once plugin_dir_path(__FILE__) . 'class-time-based-rewards.php';
        Time_Based_Rewards::init();
    }
}

Pro_Init::init();
