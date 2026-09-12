<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class bbPress extends BaseIntegration
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
        return array(
            'bbp_new_topic' => array(
                'label'       => __('New Topic Created', 'gameengine'),
                'hook'        => 'bbp_new_topic',
                'args_count'  => 4,
                'description' => __('User creates a new forum topic.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($topic_id, $forum_id, $anonymous_data, $topic_author) {
                    return function_exists('bbp_get_topic_author_id')
                        ? (int) bbp_get_topic_author_id($topic_id)
                        : (int) $topic_author;
                },
                'schema' => self::merge_schema(array()),
            ),
            'bbp_new_reply' => array(
                'label'       => __('Reply Posted', 'gameengine'),
                'hook'        => 'bbp_new_reply',
                'args_count'  => 5,
                'description' => __('User posts a reply in a forum topic.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($reply_id, $topic_id, $forum_id, $anonymous_data, $reply_author) {
                    return function_exists('bbp_get_reply_author_id')
                        ? (int) bbp_get_reply_author_id($reply_id)
                        : (int) $reply_author;
                },
                'schema' => self::merge_schema(array()),
            ),
            'bbp_topic_resolved' => array(
                'label'       => __('Topic Marked Resolved', 'gameengine'),
                'hook'        => 'bbp_resolved_topic',
                'args_count'  => 1,
                'description' => __('User marks their topic as resolved.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($topic_id) {
                    return function_exists('bbp_get_topic_author_id')
                        ? (int) bbp_get_topic_author_id($topic_id)
                        : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
            'bbp_user_favorited' => array(
                'label'       => __('Topic Favorited', 'gameengine'),
                'hook'        => 'bbp_add_user_favorite',
                'args_count'  => 2,
                'description' => __('User marks a topic as a favorite.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $topic_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
        );
    }
}
