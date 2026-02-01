<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AcademyLMS
 * Handles core triggers for Academy LMS.
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
     * Main Triggers for Academy LMS
     */
    public static function get_triggers(): array
    {
        return array(
            //  Course Completed (Student)
            'academy_course_completed'    => array(
                'label'       => __('Course Completed', 'gameengine'),
                'hook'        => 'academy/admin/course_complete_after',
                'args_count'  => 2,
                'description' => __('Awarded when a student successfully finishes a course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($course_id, $user_id) {
                    return absint($user_id);
                },
                'schema'      => self::merge_schema(array()),
            ),

            //  Course Published (Instructor)
            'academy_course_published'    => array(
                'label'       => __('Course Published', 'gameengine'),
                'hook'        => 'rest_after_insert_academy_courses',
                'args_count'  => 1,
                'description' => __('Awarded to instructors when they publish a new course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($course) {
                    return isset($course->post_author) ? absint($course->post_author) : get_current_user_id();
                },
                'schema'      => self::merge_schema(array()),
            ),

            //  Lesson Completed (Student)
            'academy_lesson_completed'     => array(
                'label'       => __('Lesson Completed', 'gameengine'),
                'hook'        => 'academy/frontend/after_mark_topic_complete',
                'args_count'  => 4,
                'description' => __('Awarded when a student completes a specific lesson.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($topic_type, $course_id, $topic_id, $user_id) {
                    return ('lesson' === $topic_type) ? absint($user_id) : 0;
                },
                'schema'      => self::merge_schema(array()),
            ),

            //  Quiz Passed (Student)
            'academy_quiz_passed'         => array(
                'label'       => __('Quiz Passed', 'gameengine'),
                'hook'        => 'academy_quiz_attempt_status_passed',
                'args_count'  => 1,
                'description' => __('Awarded when a student passes a quiz.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($attempt_data) {
                    // Assuming $attempt_data is an object containing user_id
                    return isset($attempt_data->user_id) ? absint($attempt_data->user_id) : 0;
                },
                'schema'      => self::merge_schema(array()),
            ),

            //  Assignment Evaluated (Student)
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

            //  New Enrollment (Student)
            'academy_new_enrollment'      => array(
                'label'       => __('New Enrollment', 'gameengine'),
                'hook'        => 'academy_new_enroll',
                'args_count'  => 3,
                'description' => __('Awarded when a student joins a new course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $course_id, $enrollment_id) {
                    return absint($user_id);
                },
                'schema'      => self::merge_schema(array()),
            ),
        );
    }
}
