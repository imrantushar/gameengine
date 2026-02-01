<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AcademyLMS
 * Handles all 6 core triggers for Academy LMS with dynamic schema support.
 */
class AcademyLMS extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'academylms';
    }

    public static function get_name(): string
    {
        return __('Academy LMS', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-welcome-learn-more';
    }

    /**
     * Register all 6 triggers for Academy LMS.
     */
    public static function get_triggers(): array
    {
        return array(
            //  Course Completed
            'academy_course_completed'     => array(
                'label'       => __('Course Completed', 'gameengine'),
                'hook'        => 'academy/admin/course_complete_after',
                'args_count'  => 2,
                'description' => __('Awarded when a student successfully finishes a course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($course_id, $user_id) {
                    return absint($user_id);
                },
                'schema'      => self::merge_schema(array(
                    array(
                        'key'     => 'course_id',
                        'label'   => __('Select Course', 'gameengine'),
                        'type'    => 'select',
                        'width'   => '100%',
                        'dynamic' => array('integration' => 'academylms', 'query' => 'courses'),
                    ),
                )),
            ),

            // Course Published
            'academy_course_published'     => array(
                'label'       => __('Course Published (Instructor)', 'gameengine'),
                'hook'        => 'rest_after_insert_academy_courses',
                'args_count'  => 1,
                'description' => __('Awarded to instructors when they publish a new course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($course) {
                    return isset($course->post_author) ? absint($course->post_author) : get_current_user_id();
                },
                'schema'      => self::merge_schema(array()),
            ),

            //  Lesson Completed
            'academy_lesson_completed'      => array(
                'label'       => __('Lesson Completed', 'gameengine'),
                'hook'        => 'academy/frontend/after_mark_topic_complete',
                'args_count'  => 4,
                'description' => __('Awarded when a student completes a specific lesson.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($topic_type, $course_id, $topic_id, $user_id) {
                    return ('lesson' === $topic_type) ? absint($user_id) : 0;
                },
                'schema'      => self::merge_schema(array(
                    array(
                        'key'     => 'topic_id',
                        'label'   => __('Select Lesson', 'gameengine'),
                        'type'    => 'select',
                        'width'   => '100%',
                        'dynamic' => array('integration' => 'academylms', 'query' => 'lessons'),
                    ),
                )),
            ),

            //  Quiz Passed
            'academy_quiz_passed'          => array(
                'label'       => __('Quiz Passed', 'gameengine'),
                'hook'        => 'academy_quiz_attempt_status_passed',
                'args_count'  => 1,
                'description' => __('Awarded when a student passes a quiz.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($attempt_data) {
                    return isset($attempt_data->user_id) ? absint($attempt_data->user_id) : 0;
                },
                'schema'      => self::merge_schema(array(
                    array(
                        'key'     => 'quiz_id',
                        'label'   => __('Select Quiz', 'gameengine'),
                        'type'    => 'select',
                        'width'   => '100%',
                        'dynamic' => array('integration' => 'academylms', 'query' => 'quizzes'),
                    ),
                )),
            ),

            //  Assignment Evaluated
            'academy_assignment_evaluated' => array(
                'label'       => __('Assignment Evaluated', 'gameengine'),
                'hook'        => 'academy_pro/frontend/evaluate_submitted_assignment',
                'args_count'  => 1,
                'description' => __('Awarded when an instructor evaluates a student assignment.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($response) {
                    return isset($response->user_id) ? absint($response->user_id) : 0;
                },
                'schema'      => self::merge_schema(array()),
            ),

            //  New Enrollment
            'academy_new_enrollment'       => array(
                'label'       => __('New Enrollment', 'gameengine'),
                'hook'        => 'academy_new_enroll',
                'args_count'  => 3,
                'description' => __('Awarded when a student joins a new course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $course_id, $enrollment_id) {
                    return absint($user_id);
                },
                'schema'      => self::merge_schema(array(
                    array(
                        'key'     => 'course_id',
                        'label'   => __('Select Course', 'gameengine'),
                        'type'    => 'select',
                        'width'   => '100%',
                        'dynamic' => array('integration' => 'academylms', 'query' => 'courses'),
                    ),
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
                $posts = get_posts(array('post_type' => 'academy_courses', 'posts_per_page' => 50));
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
            'lessons' => function () {
                $posts = get_posts(array('post_type' => 'academy_lessons', 'posts_per_page' => 50));
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
            'quizzes' => function () {
                $posts = get_posts(array('post_type' => 'academy_quizzes', 'posts_per_page' => 50));
                return array_map(fn($p) => array('label' => $p->post_title, 'value' => $p->ID), $posts);
            },
        );
    }
}
