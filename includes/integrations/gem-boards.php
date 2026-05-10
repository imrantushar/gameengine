<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class GemBoards extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'gemboards';
    }

    public static function get_name(): string
    {
        return __('GemBoards', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-columns';
    }

    public static function get_triggers(): array
    {
        return array(
            'gemboards_card_created' => array(
                'label'       => __('Card Created', 'gameengine'),
                'hook'        => 'gemboards_card_created',
                'args_count'  => 2,
                'description' => __('User creates a new card/task on a GemBoards board.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($card_id, $user_id) {
                    return $user_id ? (int) $user_id : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
            'gemboards_card_completed' => array(
                'label'       => __('Card Completed', 'gameengine'),
                'hook'        => 'gemboards_card_completed',
                'args_count'  => 2,
                'description' => __('User marks a card/task as complete.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($card_id, $user_id) {
                    return $user_id ? (int) $user_id : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
            'gemboards_card_moved' => array(
                'label'       => __('Card Moved', 'gameengine'),
                'hook'        => 'gemboards_card_moved',
                'args_count'  => 3,
                'description' => __('User moves a card to a different column.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($card_id, $column_id, $user_id) {
                    return $user_id ? (int) $user_id : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
            'gemboards_board_created' => array(
                'label'       => __('Board Created', 'gameengine'),
                'hook'        => 'gemboards_board_created',
                'args_count'  => 2,
                'description' => __('User creates a new GemBoards board.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($board_id, $user_id) {
                    return $user_id ? (int) $user_id : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
            'gemboards_comment_added' => array(
                'label'       => __('Comment Added to Card', 'gameengine'),
                'hook'        => 'gemboards_comment_added',
                'args_count'  => 2,
                'description' => __('User adds a comment to a GemBoards card.', 'gameengine'),
                'supports'    => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($comment_id, $user_id) {
                    return $user_id ? (int) $user_id : get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),
        );
    }
}
