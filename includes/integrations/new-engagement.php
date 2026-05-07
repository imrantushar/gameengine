<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * New Engagement Integration.
 * Provides link-click, video-watch, birthday, and anniversary triggers.
 */
class NewEngagement extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'new_engagement';
    }

    public static function get_name(): string
    {
        return __('Engagement', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-heart';
    }

    public static function get_triggers(): array
    {
        return [
            'gameengine_link_click' => [
                'label'       => __('Link Click', 'gameengine'),
                'hook'        => 'gameengine_link_click',
                'args_count'  => 2,
                'description' => __('Awarded when a user clicks a tracked GameEngine link.', 'gameengine'),
                'get_user_id' => function ($user_id, $link_token) {
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'gameengine_video_watched' => [
                'label'       => __('Video Watched', 'gameengine'),
                'hook'        => 'gameengine_video_watched',
                'args_count'  => 3,
                'description' => __('Awarded when a user watches a tracked video to the configured threshold.', 'gameengine'),
                'get_user_id' => function ($user_id, $video_id, $threshold) {
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([
                    [
                        'key'     => 'watch_threshold',
                        'label'   => __('Watch Threshold', 'gameengine'),
                        'type'    => 'select',
                        'width'   => '50%',
                        'options' => [
                            ['label' => __('Video Started', 'gameengine'), 'value' => 'start'],
                            ['label' => __('50% Watched', 'gameengine'), 'value' => '50'],
                            ['label' => __('100% Watched', 'gameengine'), 'value' => '100'],
                        ],
                        'default' => '100',
                        'scope'   => ['point_type', 'achievement', 'level'],
                    ],
                ]),
            ],
            'gameengine_birthday' => [
                'label'       => __('Birthday Reward', 'gameengine'),
                'hook'        => 'gameengine_birthday',
                'args_count'  => 1,
                'description' => __('Awarded once per year on the user\'s birthday.', 'gameengine'),
                'get_user_id' => function ($user_id) {
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'gameengine_anniversary' => [
                'label'       => __('Anniversary Reward', 'gameengine'),
                'hook'        => 'gameengine_anniversary',
                'args_count'  => 1,
                'description' => __('Awarded once per year on the anniversary of the user\'s registration.', 'gameengine'),
                'get_user_id' => function ($user_id) {
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
        ];
    }
}
