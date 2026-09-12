<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class BuddyPress extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'buddypress';
    }

    public static function get_name(): string
    {
        return __('BuddyPress', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-buddicons-buddypress-logo';
    }

    public static function get_triggers(): array
    {
        return array(
            'bp_profile_updated' => array(
                'label'       => __('Profile Updated', 'gameengine'),
                'hook'        => 'xprofile_updated_profile',
                'args_count'  => 1,
                'description' => __('User updates their BuddyPress profile.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
            'bp_friendship_created' => array(
                'label'       => __('Friendship Created', 'gameengine'),
                'hook'        => 'friends_friendship_accepted',
                'args_count'  => 2,
                'description' => __('User accepts a friendship request.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($friendship_id, $friendship) {
                    return function_exists('bp_get_friendship_initiator_user_id')
                        ? (int) $friendship->initiator_user_id
                        : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
            'bp_activity_posted' => array(
                'label'       => __('Activity Posted', 'gameengine'),
                'hook'        => 'bp_activity_posted_update',
                'args_count'  => 3,
                'description' => __('User posts a BuddyPress activity update.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($content, $user_id, $activity_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
            'bp_group_joined' => array(
                'label'       => __('Group Joined', 'gameengine'),
                'hook'        => 'groups_join_group',
                'args_count'  => 2,
                'description' => __('User joins a BuddyPress group.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($group_id, $user_id) {
                    return (int) $user_id;
                },
                'schema' => self::merge_schema(array()),
            ),
            'bp_message_sent' => array(
                'label'       => __('Private Message Sent', 'gameengine'),
                'hook'        => 'messages_message_sent',
                'args_count'  => 1,
                'description' => __('User sends a private message.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($message_id) {
                    return get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
        );
    }
}
