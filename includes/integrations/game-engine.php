<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) exit;

class GameEngine extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'gameengine';
    }
    public static function get_name(): string
    {
        return __('GameEngine Logic', 'gameengine');
    }
    public static function get_icon(): string
    {
        return 'dashicons-games';
    }

    public static function get_triggers(): array
    {
        return [
            'unlock_specific_achievement' => [
                'label'       => __('Unlock Achievement', 'gameengine'),
                'hook'        => 'gameengine_achievement_unlocked',
                'description' => __('Unlock achivemeet successfully  into your website.', 'gameengine'),
                'args_count'  => 3,
                'supports'    => ['point_type'],
                'get_user_id' => function ($user_id) {
                    return $user_id;
                },
                'schema'      => self::merge_schema([
                    ['key' => 'achievement_id', 'label' => __('Select Achievement', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'dynamic' => ['integration' => 'gameengine', 'query' => 'achievements'], 'required' => true]
                ])
            ]
        ];
    }

    public static function get_dynamic_queries(): array
    {
        return [
            'achievements' => function () {
                global $wpdb;
                $results = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gameengine_achievements LIMIT 50");
                return array_map(fn($r) => ['label' => $r->title, 'value' => $r->id], $results);
            }
        ];
    }
}
