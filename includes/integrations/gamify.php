<?php

namespace Gamify\Integrations;

if (!defined('ABSPATH')) exit;

class Gamify extends BaseIntegration
{

    public static function get_slug(): string
    {
        return 'gamify';
    }
    public static function get_name(): string
    {
        return __('Gamify Logic', 'gamify');
    }
    public static function get_icon(): string
    {
        return 'dashicons-games';
    }

    public static function get_triggers(): array
    {
        return [
            'unlock_specific_achievement' => [
                'label'       => __('Unlock Achievement', 'gamify'),
                'hook'        => 'gamify_achievement_unlocked',
                'description' => __('Unlock achivemeet successfully  into your website.', 'gamify'),
                'args_count'  => 3,
                'supports'    => ['point_type'],
                'get_user_id' => function ($user_id) {
                    return $user_id;
                },
                'schema'      => self::merge_schema([
                    ['key' => 'achievement_id', 'label' => __('Select Achievement', 'gamify'), 'type' => 'select', 'dynamic' => ['integration' => 'gamify', 'query' => 'achievements'], 'required' => true]
                ])
            ]
        ];
    }

    public static function get_dynamic_queries(): array
    {
        return [
            'achievements' => function () {
                global $wpdb;
                $results = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gamify_achievements LIMIT 50");
                return array_map(fn($r) => ['label' => $r->title, 'value' => $r->id], $results);
            }
        ];
    }
}
