<?php

namespace GameEngine\Addons\AcademyLMS;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Registers every course meta key the Academy↔GameEngine integration uses.
 *
 * Post meta is contributed through Academy's `academy/course/register_meta_fields`
 * filter (Academy runs the actual `register_meta()` loop) so Academy's own
 * `database.php` never hardcodes a GameEngine key. Term meta has no Academy
 * filter, so the one `academy_courses_category` key is registered directly
 * on `init`.
 */
class Course_Meta
{
    const RULES_META_KEY       = 'academy_courses_gameengine_rules';
    const REQUIRE_ALL_META_KEY = 'academy_courses_gameengine_require_all';

    public static function init()
    {
        add_filter('academy/course/register_meta_fields', array(__CLASS__, 'add_course_meta_fields'));
        add_action('init', array(__CLASS__, 'register_category_rules_meta'), 20);
    }

    /**
     * @param array $fields Map of meta key => register_meta() args.
     * @return array
     */
    public static function add_course_meta_fields($fields)
    {
        $fields = is_array($fields) ? $fields : array();

        // --- GameEngine "Unlock" course type -----------------------------
        $fields[self::RULES_META_KEY] = array(
            'type'         => 'array',
            'sanitize_callback' => function ($value) {
                if (! is_array($value)) {
                    return array();
                }
                $sanitized = array();
                foreach ($value as $rule) {
                    if (! is_array($rule)) {
                        continue;
                    }
                    $type  = isset($rule['type']) ? sanitize_text_field($rule['type']) : '';
                    $value = isset($rule['value']) ? intval($rule['value']) : 0;
                    if ('' !== $type && 0 < $value) {
                        $sanitized[] = compact('type', 'value');
                    }
                }
                return $sanitized;
            },
            'show_in_rest' => array(
                'schema' => array(
                    'items' => array(
                        'type'       => 'object',
                        'properties' => array(
                            'type'  => array('type' => 'string'),
                            'value' => array('type' => 'integer'),
                        ),
                    ),
                ),
            ),
        );

        $fields[self::REQUIRE_ALL_META_KEY] = array(
            'type'         => 'boolean',
            'show_in_rest' => true,
        );

        // --- Free "Content Restriction" (description lock) --------------
        // Previously registered in restrict-content/class-meta-box.php; moved
        // here so all course-meta registration flows through the one Academy
        // hook. Reads/writes are get_post_meta()/update_post_meta() and REST,
        // none of which depend on where the key was declared.
        foreach (array('_gameengine_restrict_type', '_gameengine_restrict_message') as $key) {
            $fields[$key] = array(
                'type'          => 'string',
                'show_in_rest'  => true,
                'auth_callback' => array(__CLASS__, 'can_edit_course'),
            );
        }
        $fields['_gameengine_restrict_value'] = array(
            'type'          => 'string',
            'show_in_rest'  => true,
            'auth_callback' => array(__CLASS__, 'can_edit_course'),
        );
        $fields['_gameengine_lock_media'] = array(
            'type'          => 'boolean',
            'show_in_rest'  => true,
            'auth_callback' => array(__CLASS__, 'can_edit_course'),
        );

        return $fields;
    }

    public static function can_edit_course()
    {
        return current_user_can('edit_academy_courses');
    }

    /**
     * Category-level unlock rules (fallback when a course sets none) — read
     * from term meta on `academy_courses_category`. No first-party UI yet;
     * REST-writable so a future admin UI or any REST client can set it.
     */
    public static function register_category_rules_meta()
    {
        if (! taxonomy_exists('academy_courses_category')) {
            return;
        }

        register_meta('term', self::RULES_META_KEY, array(
            'object_subtype' => 'academy_courses_category',
            'type'           => 'array',
            'single'         => true,
            'show_in_rest'   => array(
                'schema' => array(
                    'items' => array(
                        'type'       => 'object',
                        'properties' => array(
                            'type'  => array('type' => 'string'),
                            'value' => array('type' => 'integer'),
                        ),
                    ),
                ),
            ),
            'auth_callback'  => function () {
                return current_user_can('manage_categories');
            },
        ));
    }
}
