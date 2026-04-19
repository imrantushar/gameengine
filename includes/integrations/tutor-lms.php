<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class TutorLMS
 * Handles all core triggers for Tutor LMS with dynamic schema support.
 */
class TutorLMS extends BaseIntegration
{

    /**
     * Get integration slug.
     */
    public static function get_slug(): string
    {
        return 'tutorlms';
    }

    /**
     * Get integration name.
     */
    public static function get_name(): string
    {
        return __('Tutor LMS', 'gameengine');
    }

    /**
     * Get integration icon.
     */
    public static function get_icon(): string
    {
        return 'dashicons-education';
    }

    /**
     * Register all triggers for Tutor LMS.
     */
    public static function get_triggers(): array
    {
        return array(
            // Course Completed
            'tutor_course_completed' => array(
                'label' => __('Course Completed', 'gameengine'),
                'hook' => 'tutor_course_complete_after',
                'args_count' => 2,
                'description' => __('Awarded when a student successfully finishes a course.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($course_id, $user_id = 0) {
                    return $user_id ? absint($user_id) : get_current_user_id();
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'course_id',
                        'label' => __('Select Course', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'tutorlms', 'query' => 'courses'),
                    ),
                    array('key' => 'include_categories', 'label' => __('Include Specific Categories (Pro)', 'gameengine'), 'type' => 'select', 'width' => '50%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => array('integration' => 'tutorlms', 'query' => 'course_categories')),
                    array('key' => 'exclude_categories', 'label' => __('Exclude Specific Categories (Pro)', 'gameengine'), 'type' => 'select', 'width' => '50%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => array('integration' => 'tutorlms', 'query' => 'course_categories')),
                )),
            ),

            // Course Published (Instructor Reward)
            'tutor_course_published' => array(
                'label' => __('Course Published (Instructor)', 'gameengine'),
                'hook' => 'publish_courses',
                'args_count' => 2,
                'description' => __('Awarded to instructors when they publish a new course.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($post_id, $post) {
                    return isset($post->post_author) ? absint($post->post_author) : 0;
                },
                'schema' => self::merge_schema(array()),
            ),

            // Lesson Completed
            'tutor_lesson_completed' => array(
                'label' => __('Lesson Completed', 'gameengine'),
                'hook' => 'tutor_lesson_completed_after',
                'args_count' => 2,
                'description' => __('Awarded when a student completes a specific lesson.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($lesson_id, $user_id = 0) {
                    return $user_id ? absint($user_id) : get_current_user_id();
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'lesson_id',
                        'label' => __('Select Lesson', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'tutorlms', 'query' => 'lessons'),
                    ),
                )),
            ),

            // Quiz Attempt Ended
            'tutor_quiz_ended' => array(
                'label' => __('Quiz Attempt Ended', 'gameengine'),
                'hook' => 'tutor_quiz/attempt_ended',
                'args_count' => 1,
                'description' => __('Awarded when a student finishes a quiz attempt.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($attempt_id) {
                    global $wpdb;
                    $uid = $wpdb->get_var($wpdb->prepare("SELECT user_id FROM {$wpdb->prefix}tutor_quiz_attempts WHERE attempt_id = %d", $attempt_id));
                    return $uid ? absint($uid) : get_current_user_id();
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'quiz_id',
                        'label' => __('Select Quiz', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'tutorlms', 'query' => 'quizzes'),
                    ),
                )),
            ),

            // Quiz Passed
            'tutor_quiz_passed' => array(
                'label' => __('Quiz Passed', 'gameengine'),
                'hook' => 'tutor_quiz/attempt_finished',
                'args_count' => 1,
                'description' => __('Awarded when a student passes a quiz with a passing grade.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($attempt_id) {
                    global $wpdb;
                    $attempt = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}tutor_quiz_attempts WHERE attempt_id = %d", $attempt_id));
                    if ($attempt && (float) $attempt->earned_marks >= (float) $attempt->pass_mark) {
                        return absint($attempt->user_id);
                    }
                    return 0;
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'quiz_id',
                        'label' => __('Select Quiz', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'tutorlms', 'query' => 'quizzes'),
                    ),
                )),
            ),

            // Assignment Submitted
            'tutor_assignment_submitted' => array(
                'label' => __('Assignment Submitted', 'gameengine'),
                'hook' => 'tutor_assignment_submitted',
                'args_count' => 2,
                'description' => __('Awarded when a student submits an assignment.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($assignment_id, $user_id = 0) {
                    return $user_id ? absint($user_id) : get_current_user_id();
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'assignment_id',
                        'label' => __('Select Assignment', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'tutorlms', 'query' => 'assignments'),
                    ),
                )),
            ),

            // New Enrollment
            'tutor_new_enrollment' => array(
                'label' => __('New Enrollment', 'gameengine'),
                'hook' => 'tutor_after_enrolled',
                'args_count' => 3,
                'description' => __('Awarded when a student joins a new course.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($course_id, $enrollment_id, $user_id = 0) {
                    return $user_id ? absint($user_id) : get_current_user_id();
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'course_id',
                        'label' => __('Select Course', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'tutorlms', 'query' => 'courses'),
                    ),
                    array('key' => 'include_categories', 'label' => __('Include Specific Categories (Pro)', 'gameengine'), 'type' => 'select', 'width' => '50%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => array('integration' => 'tutorlms', 'query' => 'course_categories')),
                    array('key' => 'exclude_categories', 'label' => __('Exclude Specific Categories (Pro)', 'gameengine'), 'type' => 'select', 'width' => '50%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => array('integration' => 'tutorlms', 'query' => 'course_categories')),
                )),
            ),
        );
    }

    /**
     * Data queries for Admin dropdowns.
     */
    public static function get_dynamic_queries(): array
    {
        return array(
            'courses' => function () {
                $posts = get_posts(array('post_type' => 'courses', 'posts_per_page' => 100, 'post_status' => 'any'));
                if (empty($posts))
                    return array();
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
            'lessons' => function () {
                $posts = get_posts(array('post_type' => 'lesson', 'posts_per_page' => 100, 'post_status' => 'any'));
                if (empty($posts))
                    return array();
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
            'quizzes' => function () {
                $posts = get_posts(array('post_type' => 'tutor_quiz', 'posts_per_page' => 100, 'post_status' => 'any'));
                if (empty($posts))
                    return array();
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
            'assignments' => function () {
                $posts = get_posts(array('post_type' => 'tutor_assignments', 'posts_per_page' => 100, 'post_status' => 'any'));
                if (empty($posts))
                    return array();
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
            'course_categories' => function () {
                $terms = get_terms(array('taxonomy' => 'course-category', 'hide_empty' => false));
                if (is_wp_error($terms))
                    return array();
                return array_map(fn($t) => array('label' => $t->name, 'value' => $t->term_id), $terms);
            },
        );
    }
}
