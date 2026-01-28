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
                $cache_key = 'gameengine_dynamic_achievements_list';
                $results   = wp_cache_get($cache_key, 'gameengine');

                if (false === $results) {
                    global $wpdb;

                    /**
                     * Fetch achievements from custom table.
                     * Using WordPress Object Cache to avoid NoCaching warning.
                     */
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                    $results = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gameengine_achievements LIMIT 50");

                    wp_cache_set($cache_key, $results, 'gameengine', 3600);
                }

                if (empty($results) || ! is_array($results)) {
                    return [];
                }

                return array_map(fn($r) => ['label' => $r->title, 'value' => $r->id], $results);
            }
        ];
    }
}
