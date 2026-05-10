<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class LearnDash extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'learndash';
    }

    public static function get_name(): string
    {
        return __('LearnDash', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-welcome-learn-more';
    }

    public static function get_triggers(): array
    {
        return array(
            'learndash_course_completed' => array(
                'label'       => __('Course Completed', 'gameengine'),
                'hook'        => 'learndash_course_completed',
                'args_count'  => 1,
                'description' => __('User completes a LearnDash course.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($data) {
                    return isset($data['user']->ID) ? (int) $data['user']->ID : 0;
                },
                'schema' => self::merge_schema(array()),
            ),
            'learndash_lesson_completed' => array(
                'label'       => __('Lesson Completed', 'gameengine'),
                'hook'        => 'learndash_lesson_completed',
                'args_count'  => 1,
                'description' => __('User completes a lesson.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($data) {
                    return isset($data['user']->ID) ? (int) $data['user']->ID : 0;
                },
                'schema' => self::merge_schema(array()),
            ),
            'learndash_topic_completed' => array(
                'label'       => __('Topic Completed', 'gameengine'),
                'hook'        => 'learndash_topic_completed',
                'args_count'  => 1,
                'description' => __('User completes a topic.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($data) {
                    return isset($data['user']->ID) ? (int) $data['user']->ID : 0;
                },
                'schema' => self::merge_schema(array()),
            ),
            'learndash_quiz_completed' => array(
                'label'       => __('Quiz Completed', 'gameengine'),
                'hook'        => 'learndash_quiz_completed',
                'args_count'  => 2,
                'description' => __('User completes a quiz.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($data, $user) {
                    return isset($user->ID) ? (int) $user->ID : 0;
                },
                'schema' => self::merge_schema(array()),
            ),
            'learndash_assignment_uploaded' => array(
                'label'       => __('Assignment Uploaded', 'gameengine'),
                'hook'        => 'learndash_assignment_uploaded',
                'args_count'  => 2,
                'description' => __('User uploads an assignment.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($assignment_id, $post) {
                    $assignment = get_post($assignment_id);
                    return $assignment ? (int) $assignment->post_author : 0;
                },
                'schema' => self::merge_schema(array()),
            ),
        );
    }
}
