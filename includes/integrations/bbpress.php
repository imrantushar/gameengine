<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * bbPress Integration.
 */
class BBPress extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'bbpress';
    }

    public static function get_name(): string
    {
        return __('bbPress', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-format-chat';
    }

    public static function get_triggers(): array
    {
        $forum_id_field = [
            'key'         => 'forum_id',
            'label'       => __('Restrict to Forum ID (0 = any)', 'gameengine'),
            'type'        => 'number',
            'width'       => '50%',
            'scope'       => ['point_type', 'achievement', 'level'],
            'description' => __('Enter a forum ID to limit this trigger to one forum, or leave 0 for all forums.', 'gameengine'),
        ];

        return [
            'bbp_new_topic' => [
                'label'       => __('New Forum Topic', 'gameengine'),
                'hook'        => 'bbp_new_topic',
                'args_count'  => 4,
                'description' => __('Awarded when a user creates a new bbPress forum topic.', 'gameengine'),
                'get_user_id' => function ($topic_id, $forum_id, $anon_data, $topic_author_id) {
                    return (int) $topic_author_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([$forum_id_field]),
            ],
            'bbp_new_reply' => [
                'label'       => __('New Forum Reply', 'gameengine'),
                'hook'        => 'bbp_new_reply',
                'args_count'  => 5,
                'description' => __('Awarded when a user posts a reply in a bbPress forum thread.', 'gameengine'),
                'get_user_id' => function ($reply_id, $topic_id, $forum_id, $anon_data, $reply_author_id) {
                    return (int) $reply_author_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([$forum_id_field]),
            ],
            'bbp_topic_resolved' => [
                'label'       => __('Topic Closed / Resolved', 'gameengine'),
                'hook'        => 'bbp_closed_topic',
                'args_count'  => 1,
                'description' => __('Awarded to the topic author when their bbPress topic is closed (marked resolved).', 'gameengine'),
                'get_user_id' => function ($topic_id) {
                    $post = get_post($topic_id);
                    return $post ? (int) $post->post_author : 0;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'bbp_first_post_in_forum' => [
                'label'       => __('First Forum Post (Lifetime)', 'gameengine'),
                'hook'        => 'bbp_new_topic',
                'args_count'  => 4,
                'description' => __('Awarded once per user for their very first bbPress topic, lifetime.', 'gameengine'),
                'get_user_id' => function ($topic_id, $forum_id, $anon_data, $topic_author_id) {
                    $user_id = (int) $topic_author_id;
                    if (! $user_id) {
                        return 0;
                    }
                    // Deduplication flag set by init.php after award fires.
                    if (get_user_meta($user_id, 'gameengine_bbp_first_post_awarded', true)) {
                        return 0;
                    }
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
        ];
    }
}
