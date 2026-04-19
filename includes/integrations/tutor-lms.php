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
        return 'dashicons-welcome-learn-more';
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
                // Passed args: $course_id, $user_id
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

            // Lesson Completed
            'tutor_lesson_completed' => array(
                'label' => __('Lesson Completed', 'gameengine'),
                'hook' => 'tutor_lesson_completed_after',
                'args_count' => 2,
                'description' => __('Awarded when a student completes a specific lesson.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                // Passed arg: $lesson_id, $user_id (sometimes just $lesson_id)
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

            // Quiz Passed/Attempt Ended
            'tutor_quiz_ended' => array(
                'label' => __('Quiz Attempt Ended', 'gameengine'),
                'hook' => 'tutor_quiz/attempt_ended',
                'args_count' => 1,
                'description' => __('Awarded when a student finishes a quiz.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                // Passed arg: $attempt_id
                'get_user_id' => function ($attempt_id) {
                    return get_current_user_id();
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

            // New Enrollment
            'tutor_new_enrollment' => array(
                'label' => __('New Enrollment', 'gameengine'),
                'hook' => 'tutor_after_enrolled',
                'args_count' => 2,
                'description' => __('Awarded when a student joins a new course.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                // Passed args: $course_id, $user_id
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
        );
    }

    /**
     * Data queries for Admin dropdowns.
     */
    public static function get_dynamic_queries(): array
    {
        return array(
            'courses' => function () {
                $posts = get_posts(array(
                    'post_type' => 'courses',
                    'posts_per_page' => 100,
                    'post_status' => 'any'
                ));
                if (empty($posts))
                    return array();

                $data = array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
                return array_values($data);
            },
            'lessons' => function () {
                $posts = get_posts(array(
                    'post_type' => 'lesson',
                    'posts_per_page' => 100,
                    'post_status' => 'any'
                ));
                if (empty($posts))
                    return array();

                $data = array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
                return array_values($data);
            },
            'quizzes' => function () {
                $posts = get_posts(array(
                    'post_type' => 'tutor_quiz',
                    'posts_per_page' => 100,
                    'post_status' => 'any'
                ));
                if (empty($posts))
                    return array();

                $data = array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
                return array_values($data);
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
