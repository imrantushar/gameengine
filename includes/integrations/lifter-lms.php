<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class LifterLMS extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'lifterlms';
    }

    public static function get_name(): string
    {
        return __('LifterLMS', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-welcome-learn-more';
    }

    public static function get_triggers(): array
    {
        return array(
            'lifterlms_course_completed' => array(
                'label'       => __('Course Completed', 'gameengine'),
                'hook'        => 'lifterlms_course_completed',
                'args_count'  => 2,
                'description' => __('User completes a LifterLMS course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $course_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
            'lifterlms_lesson_completed' => array(
                'label'       => __('Lesson Completed', 'gameengine'),
                'hook'        => 'lifterlms_lesson_completed',
                'args_count'  => 2,
                'description' => __('User completes a LifterLMS lesson.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $lesson_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
            'lifterlms_quiz_completed' => array(
                'label'       => __('Quiz Completed', 'gameengine'),
                'hook'        => 'lifterlms_quiz_completed',
                'args_count'  => 2,
                'description' => __('User completes a LifterLMS quiz.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $quiz_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
            'lifterlms_new_enrollment' => array(
                'label'       => __('New Course Enrollment', 'gameengine'),
                'hook'        => 'llms_user_enrolled_in_course',
                'args_count'  => 2,
                'description' => __('User enrolls in a LifterLMS course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $course_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
        );
    }
}
