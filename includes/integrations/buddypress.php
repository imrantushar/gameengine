<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * BuddyPress / BuddyBoss Integration.
 */
class BuddyPress extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'buddypress';
    }

    public static function get_name(): string
    {
        return __('BuddyPress / BuddyBoss', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-groups';
    }

    public static function get_triggers(): array
    {
        return [
            'bp_new_topic' => [
                'label'       => __('New Forum Topic', 'gameengine'),
                'hook'        => 'bbp_new_topic',
                'args_count'  => 4,
                'description' => __('Awarded when a user creates a new BuddyPress forum topic.', 'gameengine'),
                'get_user_id' => function ($topic_id, $forum_id, $anon_data, $author) {
                    return $author ? $author->ID : get_current_user_id();
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'bp_new_reply' => [
                'label'       => __('New Forum Reply', 'gameengine'),
                'hook'        => 'bbp_new_reply',
                'args_count'  => 4,
                'description' => __('Awarded when a user replies in a BuddyPress forum.', 'gameengine'),
                'get_user_id' => function ($reply_id, $topic_id, $forum_id, $anon_data) {
                    $reply = get_post($reply_id);
                    return $reply ? (int) $reply->post_author : 0;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'bp_group_join' => [
                'label'       => __('Join a Group', 'gameengine'),
                'hook'        => 'groups_join_group',
                'args_count'  => 2,
                'description' => __('Awarded when a user joins a BuddyPress group.', 'gameengine'),
                'get_user_id' => function ($group_id, $user_id) {
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'bp_friendship_accepted' => [
                'label'       => __('Friendship Accepted', 'gameengine'),
                'hook'        => 'friends_friendship_accepted',
                'args_count'  => 3,
                'description' => __('Awarded when a user accepts a friend request.', 'gameengine'),
                'get_user_id' => function ($friendship_id, $initiator_id, $friend_id) {
                    return $friend_id; // The acceptor.
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'bp_profile_photo_upload' => [
                'label'       => __('Profile Photo Upload', 'gameengine'),
                'hook'        => 'xprofile_avatar_uploaded',
                'args_count'  => 3,
                'description' => __('Awarded once when a user uploads their BuddyPress profile photo.', 'gameengine'),
                'get_user_id' => function ($item_id, $type, $args) {
                    return $item_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
            'bp_profile_update' => [
                'label'       => __('Profile Updated', 'gameengine'),
                'hook'        => 'xprofile_updated_profile',
                'args_count'  => 3,
                'description' => __('Awarded when a user updates their BuddyPress profile.', 'gameengine'),
                'get_user_id' => function ($user_id, $posted_field_ids, $errors) {
                    return $user_id;
                },
                'supports'    => ['point_type', 'achievement', 'level'],
                'schema'      => self::merge_schema([]),
            ],
        ];
    }
}
