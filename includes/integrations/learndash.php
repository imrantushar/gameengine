<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * LearnDash LMS Integration.
 */
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
        return [
            'ld_course_enrolled' => [
                'label'       => __('Course Enrolled', 'gameengine'),
                'hook'        => 'learndash_course_enrolled',
                'args_count'  => 2,
                'description' => __('Awarded when a user enrolls in a LearnDash course.', 'gameengine'),
                'get_user_id' => function ($course_id, $user_id) { return $user_id; },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_course_completed' => [
                'label'       => __('Course Completed', 'gameengine'),
                'hook'        => 'learndash_course_completed',
                'args_count'  => 1,
                'description' => __('Awarded when a user completes a LearnDash course.', 'gameengine'),
                'get_user_id' => function ($data) { return $data['user']->ID ?? 0; },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_lesson_completed' => [
                'label'       => __('Lesson Completed', 'gameengine'),
                'hook'        => 'learndash_lesson_completed',
                'args_count'  => 1,
                'description' => __('Awarded when a user completes a LearnDash lesson.', 'gameengine'),
                'get_user_id' => function ($data) { return $data['user']->ID ?? 0; },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_topic_completed' => [
                'label'       => __('Topic Completed', 'gameengine'),
                'hook'        => 'learndash_topic_completed',
                'args_count'  => 1,
                'description' => __('Awarded when a user completes a LearnDash topic.', 'gameengine'),
                'get_user_id' => function ($data) { return $data['user']->ID ?? 0; },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_quiz_completed_pass' => [
                'label'       => __('Quiz Passed', 'gameengine'),
                'hook'        => 'learndash_quiz_completed',
                'args_count'  => 2,
                'description' => __('Awarded when a user passes a LearnDash quiz.', 'gameengine'),
                'get_user_id' => function ($quiz_data, $user) {
                    // Only fire for passed quizzes; hook condition checked in Triggers::execute via filter.
                    if (! empty($quiz_data['pass'])) {
                        return $user->ID;
                    }
                    return 0;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_quiz_completed_fail' => [
                'label'       => __('Quiz Failed (Consolation)', 'gameengine'),
                'hook'        => 'learndash_quiz_completed',
                'args_count'  => 2,
                'description' => __('Awarded when a user fails a LearnDash quiz.', 'gameengine'),
                'get_user_id' => function ($quiz_data, $user) {
                    if (empty($quiz_data['pass'])) {
                        return $user->ID;
                    }
                    return 0;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_assignment_submitted' => [
                'label'       => __('Assignment Submitted', 'gameengine'),
                'hook'        => 'learndash_assignment_uploaded',
                'args_count'  => 1,
                'description' => __('Awarded when a user submits a LearnDash assignment.', 'gameengine'),
                'get_user_id' => function ($assignment_post_id) {
                    $post = get_post($assignment_post_id);
                    return $post ? (int) $post->post_author : 0;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'ld_assignment_approved' => [
                'label'       => __('Assignment Approved', 'gameengine'),
                'hook'        => 'learndash_assignment_approved',
                'args_count'  => 1,
                'description' => __('Awarded when a LearnDash assignment is approved.', 'gameengine'),
                'get_user_id' => function ($assignment_post_id) {
                    $post = get_post($assignment_post_id);
                    return $post ? (int) $post->post_author : 0;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
        ];
    }
}
