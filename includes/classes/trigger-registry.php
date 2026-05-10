<?php

namespace GameEngine\Classes;

use GameEngine\Integrations\WordPress;
use GameEngine\Integrations\WooCommerce;
use GameEngine\Integrations\GameEngine;
use GameEngine\Integrations\Interactions;
use GameEngine\Integrations\AcademyLMS;
use GameEngine\Integrations\TutorLMS;
use GameEngine\Integrations\BuddyPress;
use GameEngine\Integrations\LearnDash;
use GameEngine\Integrations\GemBoards;
use GameEngine\Integrations\bbPress;

if (!defined('ABSPATH')) exit;

final class TriggerRegistry
{
    private static $integrations = [];
    private static $initialized = false;

    public static function init()
    {
        if (self::$initialized) return;

        // integration register
        self::$integrations['wordpress']       = WordPress::class;
        self::$integrations['gameengine']      = GameEngine::class;
        $active_addons = get_option('gameengine_active_addons', []);

        if (in_array('referrals', $active_addons, true)) {
            self::$integrations['referral'] = \GameEngine\Integrations\Referral::class;
        }

        if (in_array('woocommerce', $active_addons)) {
            if (class_exists('\GameEngine\Integrations\WooCommerce') && class_exists('WooCommerce')) {
                self::$integrations['woocommerce'] = WooCommerce::class;
            }
        }

        if (in_array('storeengine', $active_addons, true)) {
            if (class_exists('\GameEngine\Integrations\StoreEngine') && defined('STOREENGINE_VERSION')) {
                self::$integrations['storeengine'] = \GameEngine\Integrations\StoreEngine::class;
            }
        }

        if (in_array('academylms', $active_addons)) {
            if (class_exists('\GameEngine\Integrations\AcademyLMS') && (defined('ACADEMY_VERSION') || class_exists('\Academy\Academy') || function_exists('academy_start'))) {
                self::$integrations['academylms'] = AcademyLMS::class;
            }
        }

        if (in_array('tutorlms', $active_addons)) {
            if (class_exists('\GameEngine\Integrations\TutorLMS') && (defined('TUTOR_VERSION') || function_exists('tutor_lms') || class_exists('TUTOR\Tutor'))) {
                self::$integrations['tutorlms'] = TutorLMS::class;
            }
        }
        if (function_exists('bp_is_active') || class_exists('BuddyPress')) {
            self::$integrations['buddypress'] = BuddyPress::class;
        }

        if (defined('LEARNDASH_VERSION') || class_exists('SFWD_LMS')) {
            self::$integrations['learndash'] = LearnDash::class;
        }

        if (defined('GEMBOARDS_VERSION') || class_exists('GemBoards')) {
            self::$integrations['gemboards'] = GemBoards::class;
        }

        if (function_exists('bbpress') || class_exists('bbPress')) {
            self::$integrations['bbpress'] = bbPress::class;
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

    /**
     * Get all triggers as a flat list for the Available Hooks UI.
     * Returns: [ [ hook_key, label, integration, hook, description ], ... ]
     */
    public static function get_all(): array
    {
        self::init();
        $list = [];
        foreach (self::$integrations as $class) {
            if (class_exists($class) && method_exists($class, 'get_hooks_list')) {
                $list = array_merge($list, $class::get_hooks_list());
            }
        }
        return $list;
    }

    public static function reset()
    {
        self::$initialized = false;
        self::$integrations = [];
    }
}
