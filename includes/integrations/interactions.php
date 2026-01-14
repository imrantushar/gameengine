<?php

namespace Gamify\Integrations;

class Interactions extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'interaction';
    }
    public static function get_name(): string
    {
        return __('Interactions', 'gamify');
    }
    public static function get_icon(): string
    {
        return 'dashicons-groups';
    }

    public static function get_triggers(): array
    {
        return [
            'daily_visit_website' => [
                'label' => __('Daily Visit', 'gamify'),
                'hook' => 'gamify_site_visit',
                'description' => __('Daily visit successfully  into your website.', 'gamify'),
                'args_count' => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => array_merge([
                    ['key' => 'streak_bonus', 'label' => __('Enable Streak Bonus (Pro)', 'gamify'), 'type' => 'switch', 'width'   => '100%', 'is_pro' => true],
                    ['key' => 'min_stay', 'label' => __('Min Stay Duration (Pro)', 'gamify'), 'type' => 'number', 'width'   => '50%', 'is_pro' => true]
                ], self::get_standard_schema())
            ],
            'visit_specific_post' => [
                'label' => __('Visit Specific Post', 'gamify'),
                'hook' => 'gamify_site_visit',
                'description' => __('Visit Specific post successfully  into your website.', 'gamify'),
                'args_count' => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => array_merge([
                    ['key' => 'post_id', 'label' => __('Select Post', 'gamify'), 'type' => 'select', 'width'   => '100%', 'dynamic' => ['integration' => 'interaction', 'query' => 'posts']]
                ], self::get_standard_schema())
            ],
            'author_comment_reply' => [
                'label' => __('Author Reply', 'gamify'),
                'hook' => 'comment_post',
                'description' => __('Author comment successfully  into your website.', 'gamify'),
                'args_count' => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    if (!$c || $c->comment_parent == 0) return 0;
                    $p = get_post($c->comment_post_ID);
                    return ($p && (int)$p->post_author === (int)$c->user_id) ? $c->user_id : 0;
                },
                'schema' => array_merge([
                    ['key' => 'min_reply_len', 'label' => __('Min Reply Length (Pro)', 'gamify'), 'type' => 'number', 'width'   => '50%', 'is_pro' => true]
                ], self::get_standard_schema())
            ]
        ];
    }
    public static function get_dynamic_queries(): array
    {
        return [
            'posts' => function () {
                $posts = get_posts(['posts_per_page' => 20]);
                return array_map(fn($p) => ['label' => $p->post_title, 'value' => $p->ID], $posts);
            }
        ];
    }
}
