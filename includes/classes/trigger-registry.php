<?php

namespace GameEngine\Classes;

use GameEngine\Integrations\WordPress;
use GameEngine\Integrations\WooCommerce;
use GameEngine\Integrations\GameEngine;
use GameEngine\Integrations\Interactions;
use GameEngine\Integrations\AcademyLMS;

if (!defined('ABSPATH')) exit;

final class TriggerRegistry
{
    private static $integrations = [];
    private static $initialized = false;

    public static function init()
    {
        if (self::$initialized) return;

        // integration register
        self::$integrations['wordpress']   = WordPress::class;
        self::$integrations['gameengine']      = GameEngine::class;
        self::$integrations['interaction'] = Interactions::class;

        $active_addons = get_option('gameengine_active_addons', []);

        if (in_array('woocommerce', $active_addons)) {
            if (class_exists('\GameEngine\Integrations\WooCommerce')) {
                self::$integrations['woocommerce'] = WooCommerce::class;
            }
        }
        if (in_array('academylms', $active_addons)) {
            if (class_exists('\GameEngine\Integrations\AcademyLMS')) {
                self::$integrations['academylms'] = AcademyLMS::class;
            }
        }
        self::$integrations = apply_filters('gameengine_integrations', self::$integrations);
        self::$initialized = true;
    }

    public static function get(string $key)
    {
        self::init();
        $all = self::get_all_triggers();
        return isset($all[$key]) ? $all[$key] : null;
    }

    public static function get_all_integrations(): array
    {
        self::init();
        $data = [];
        foreach (self::$integrations as $slug => $class) {
            if (class_exists($class)) {
                $data[$slug] = [
                    'slug'     => $slug,
                    'name'     => $class::get_name(),
                    'icon'     => $class::get_icon(),
                    'triggers' => $class::get_triggers()
                ];
            }
        }
        return $data;
    }

    public static function get_all_triggers(): array
    {
        self::init();
        $all_triggers = [];
        foreach (self::$integrations as $class) {
            if (class_exists($class)) {
                $all_triggers = array_merge($all_triggers, $class::get_triggers());
            }
        }
        return $all_triggers;
    }

    public static function reset()
    {
        self::$initialized = false;
        self::$integrations = [];
    }
}
