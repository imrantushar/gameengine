<?php

namespace GameEngine\Addons\AcademyLMS;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * The `gameengine_membership` ("GameEngine Unlock") course type.
 *
 * Unlock rules are stored as a single post-meta array on the course
 * (`academy_courses_gameengine_rules`) plus a boolean AND/OR flag
 * (`academy_courses_gameengine_require_all`) — not in GameEngine's
 * `gameengine_requirements` table, which models "trigger fires -> award
 * reward" and has no course-targeting concept. Category-level rules on the
 * `academy_courses_category` term are the fallback when a course sets none.
 *
 * The rule evaluator prefers GameEngine's free "Restrict Content" evaluator
 * (identical behaviour to a site that runs that addon) and falls back to
 * GameEngine's core managers / direct queries when it is not loaded.
 */
class Course_Unlock
{
    const RULES_META_KEY       = Course_Meta::RULES_META_KEY;
    const REQUIRE_ALL_META_KEY = Course_Meta::REQUIRE_ALL_META_KEY;

    public static function init()
    {
        add_filter('academy/get_course_filter_types', array(__CLASS__, 'add_course_type_option'));
        add_filter('academy/course/get_course_type', array(__CLASS__, 'modify_course_type'), 10, 2);
        add_filter('academy/before_enroll_course_type', array(__CLASS__, 'change_course_type_before_enrollment'), 10, 2);
        add_filter('academy/templates/single_course/enroll_form', array(__CLASS__, 'modify_enrollment_form'), 10, 2);
        add_filter('academy/templates/loop/price', array(__CLASS__, 'modify_loop_price_args'), 10, 2);
        add_filter('academy/single/enroll_content_args', array(__CLASS__, 'modify_enroll_form_content_args'), 10, 2);
    }

    /* ------------------------------------------------------------------ *
     * Academy runtime filter bindings
     * ------------------------------------------------------------------ */

    public static function add_course_type_option($types)
    {
        $types['gameengine_membership'] = __('GameEngine Unlock', 'gameengine');
        return $types;
    }

    /**
     * Once the unlock condition is met, present the course as a normal free
     * enrollment everywhere Academy checks the course type — same pattern the
     * MemberPress / Paid Memberships Pro integrations use.
     */
    public static function modify_course_type($type, $course_id)
    {
        if ('gameengine_membership' === $type && self::has_course_access($course_id)) {
            return 'free';
        }
        return $type;
    }

    public static function change_course_type_before_enrollment($course_type, $course_id)
    {
        if ('gameengine_membership' === $course_type && self::has_course_access($course_id)) {
            return 'free';
        }
        return $course_type;
    }

    public static function modify_loop_price_args($course_type_label, $course_id)
    {
        if ('gameengine_membership' === get_post_meta($course_id, 'academy_course_type', true)) {
            $course_type_label = esc_html__('GameEngine Unlock', 'gameengine');
        }
        return $course_type_label;
    }

    public static function modify_enroll_form_content_args($args, $course_id)
    {
        if ('gameengine_membership' === get_post_meta($course_id, 'academy_course_type', true)) {
            $args['is_paid'] = true;
            $args['price']   = '<div class="academy-course-type">' . esc_html__('GameEngine Unlock', 'gameengine') . '</div>';
        }
        return $args;
    }

    public static function modify_enrollment_form($html, $course_id)
    {
        $course_type = \Academy\Helper::get_course_type($course_id);
        if ('gameengine_membership' !== $course_type) {
            return $html;
        }

        $user_id     = get_current_user_id();
        $is_enrolled = \Academy\Helper::is_enrolled($course_id, $user_id);

        if ($is_enrolled || self::has_course_access($course_id)) {
            return $html;
        }

        $template = GAMEENGINE_PATH . 'templates/academy/course-locked.php';
        if (! file_exists($template)) {
            return $html;
        }

        $is_enable_academy_login = \Academy\Helper::get_settings('is_enabled_academy_login', true);
        $rules                   = self::get_course_rules($course_id);

        ob_start();
        include $template;
        return ob_get_clean();
    }

    /* ------------------------------------------------------------------ *
     * Access evaluation
     * ------------------------------------------------------------------ */

    public static function has_course_access($course_id, $user_id = '')
    {
        $user_id = ! empty($user_id) ? $user_id : get_current_user_id();
        if (empty($user_id)) {
            return false;
        }

        if (current_user_can('administrator') || \Academy\Helper::is_instructor_of_this_course(get_current_user_id(), $course_id)) {
            return true;
        }

        $rules = self::get_course_rules($course_id);
        if (empty($rules)) {
            return false;
        }

        $require_all              = self::requires_all_rules($course_id);
        $original_user            = get_current_user_id();
        $evaluate_as_current_user = ((int) $original_user === (int) $user_id);

        $results = array();
        foreach ($rules as $rule) {
            if (empty($rule['type']) || '' === $rule['value']) {
                continue;
            }
            // The rule evaluator always checks the *current* user; only support
            // checking the logged-in user for now (matches every Academy
            // membership addon, which all pass no $user_id).
            if (! $evaluate_as_current_user) {
                continue;
            }
            $results[] = self::user_meets_rule($rule['type'], $rule['value'], (int) $user_id);
        }

        if (empty($results)) {
            return false;
        }

        return $require_all ? ! in_array(false, $results, true) : in_array(true, $results, true);
    }

    protected static function user_meets_rule($type, $value, $user_id)
    {
        if (class_exists('\GameEngine\Addons\RestrictContent\Restriction_Helper')) {
            return (bool) \GameEngine\Addons\RestrictContent\Restriction_Helper::can_access($type, $value);
        }

        if (current_user_can('manage_options')) {
            return true;
        }

        switch ($type) {
            case 'points':
                if (class_exists('\GameEngine\Classes\PointsManager')) {
                    $manager = new \GameEngine\Classes\PointsManager();
                    return (int) $manager->get_grand_total($user_id) >= (int) $value;
                }
                return false;

            case 'achievement':
                return self::user_has_achievement($user_id, absint($value));

            case 'level':
                return self::user_has_level($user_id, absint($value));
        }

        return false;
    }

    /**
     * True when the user has been explicitly awarded the achievement, or — for
     * a point-unlockable achievement — already has enough points to earn it.
     * Mirrors Restrict_Content\Restriction_Helper::check_achievement_access().
     */
    protected static function user_has_achievement($user_id, $achievement_id)
    {
        if (! class_exists('\GameEngine\Classes\AchievementsManager')) {
            return false;
        }

        $manager = new \GameEngine\Classes\AchievementsManager();
        if ($manager->has_achievement($user_id, $achievement_id)) {
            return true;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $required = $wpdb->get_row($wpdb->prepare("SELECT required_point_type_id, required_points_amount, unlock_with_points_enabled FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", $achievement_id));
        if (! $required) {
            return true;
        }

        if (1 !== (int) $required->unlock_with_points_enabled || ! class_exists('\GameEngine\Classes\PointsManager')) {
            return false;
        }

        $manager     = new \GameEngine\Classes\PointsManager();
        $point_type  = (int) $required->required_point_type_id;
        $user_points = $point_type > 0
            ? (int) $manager->get_total($user_id, $point_type)
            : (int) $manager->get_grand_total($user_id);

        return $user_points >= (int) $required->required_points_amount;
    }

    /**
     * True when the user has explicitly reached the required level, or — for a
     * point-unlockable level — already has enough points to be at it. Mirrors
     * Restrict_Content\Restriction_Helper::check_level_access().
     */
    protected static function user_has_level($user_id, $required_level_id)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $required = $wpdb->get_row($wpdb->prepare("SELECT priority, min_points, point_type_id, unlock_with_points_enabled FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", $required_level_id));
        if (! $required) {
            return true;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $current_priority = $wpdb->get_var($wpdb->prepare("SELECT l.priority FROM {$wpdb->prefix}gameengine_user_levels ul JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id WHERE ul.user_id = %d ORDER BY l.priority DESC LIMIT 1", $user_id));
        if (null !== $current_priority && (int) $current_priority >= (int) $required->priority) {
            return true;
        }

        if (1 === (int) $required->unlock_with_points_enabled && class_exists('\GameEngine\Classes\PointsManager')) {
            $manager     = new \GameEngine\Classes\PointsManager();
            $point_type  = (int) $required->point_type_id;
            $user_points = $point_type > 0
                ? (int) $manager->get_total($user_id, $point_type)
                : (int) $manager->get_grand_total($user_id);
            return $user_points >= (int) $required->min_points;
        }

        return false;
    }

    /* ------------------------------------------------------------------ *
     * Rule storage helpers
     * ------------------------------------------------------------------ */

    /**
     * Course-level rules override category-level rules for the same course
     * (most-specific-wins).
     */
    public static function get_course_rules($course_id)
    {
        $course_rules = get_post_meta($course_id, self::RULES_META_KEY, true);
        if (is_array($course_rules) && ! empty($course_rules)) {
            return self::sanitize_rules($course_rules);
        }

        return self::sanitize_rules(self::get_category_rules($course_id));
    }

    public static function get_category_rules($course_id)
    {
        $terms = get_the_terms($course_id, 'academy_courses_category');
        if (empty($terms) || is_wp_error($terms)) {
            return array();
        }

        foreach ($terms as $term) {
            $rules = get_term_meta($term->term_id, self::RULES_META_KEY, true);
            if (is_array($rules) && ! empty($rules)) {
                return $rules;
            }
        }

        return array();
    }

    public static function requires_all_rules($course_id)
    {
        return '1' === (string) get_post_meta($course_id, self::REQUIRE_ALL_META_KEY, true);
    }

    protected static function sanitize_rules($rules)
    {
        $sanitized = array();
        foreach ((array) $rules as $rule) {
            if (empty($rule['type']) || ! in_array($rule['type'], array('points', 'achievement', 'level'), true)) {
                continue;
            }
            $sanitized[] = array(
                'type'  => sanitize_key($rule['type']),
                'value' => is_numeric($rule['value'] ?? null) ? absint($rule['value']) : '',
            );
        }
        return $sanitized;
    }
}
