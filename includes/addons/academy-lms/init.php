<?php

namespace GameEngine\Addons\AcademyLMS;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Init
 * Entry point for the Academy LMS course-unlock integration.
 *
 * Owns everything the Academy <-> GameEngine "GameEngine Unlock" course type
 * needs on the GameEngine side: the course meta registration (contributed to
 * Academy through its `academy/course/register_meta_fields` filter, so
 * Academy's own PHP never names a GameEngine key), the `gameengine_membership`
 * enrollment gate, and the achievements/levels lists the course-builder
 * dropdowns read.
 *
 * This whole file is only ever required from `gameengine.php` ->
 * `load_optional_modules()`, so when the GameEngine plugin is inactive none of
 * it — no meta, no filters, no AJAX — is registered and an Academy install
 * without GameEngine carries zero weight from it. When Academy itself is not
 * present the integration also no-ops (there is no course type to gate).
 */
class Init
{
    public static function init()
    {
        $academy_present = defined('ACADEMY_VERSION')
            || class_exists('\Academy\Academy')
            || function_exists('academy_start');

        if (! $academy_present) {
            return;
        }

        self::maybe_self_heal_restrict_content();
        self::load_dependencies();
        self::register_hooks();
    }

    /**
     * The rule evaluator (`Course_Unlock::user_meets_rule()`) prefers
     * GameEngine's "Restrict Content" evaluator so behaviour matches a site
     * that has that addon on. Self-heal it once so a course gate does not
     * silently fall back to the leaner direct-query path.
     */
    private static function maybe_self_heal_restrict_content()
    {
        $active_addons = (array) get_option('gameengine_active_addons', array());
        if (! in_array('restrict_content', $active_addons, true)) {
            $active_addons[] = 'restrict_content';
            update_option('gameengine_active_addons', array_values($active_addons));
        }
    }

    private static function load_dependencies()
    {
        foreach (array('class-course-meta.php', 'class-course-unlock.php', 'class-ajax.php') as $file) {
            $path = __DIR__ . '/' . $file;
            if (file_exists($path)) {
                require_once $path;
            }
        }
    }

    private static function register_hooks()
    {
        if (class_exists(__NAMESPACE__ . '\Course_Meta')) {
            Course_Meta::init();
        }
        if (class_exists(__NAMESPACE__ . '\Course_Unlock')) {
            Course_Unlock::init();
        }
        if (class_exists(__NAMESPACE__ . '\Ajax')) {
            Ajax::init();
        }
    }
}

Init::init();
