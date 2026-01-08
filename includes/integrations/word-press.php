<?php

namespace Gamify\Integrations;

class WordPress extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'wordpress';
    }
    public static function get_name(): string
    {
        return __('WordPress Core', 'gamify');
    }
    public static function get_icon(): string
    {
        return 'dashicons-wordpress';
    }

    public static function get_triggers(): array
    {
        return [
            'wp_login' => [
                'label' => __('User Login', 'gamify'),
                'hook' => 'wp_login',
                'args_count' => 2,
                'get_user_id' => function ($login, $user) {
                    return $user->ID;
                },
                'schema' => self::get_standard_schema()
            ],
            'user_register' => [
                'label' => __('User Register', 'gamify'),
                'hook' => 'user_register',
                'args_count' => 1,
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::get_standard_schema()
            ],
            'publish_post' => [
                'label' => __('Publish Post', 'gamify'),
                'hook' => 'publish_post',
                'args_count' => 2,
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => array_merge([
                    ['key' => 'min_words', 'label' => __('Min Word Count (Pro)', 'gamify'), 'type' => 'number', 'is_pro' => true, 'default' => 500]
                ], self::get_standard_schema())
            ],
            'publish_page' => [
                'label' => __('Publish Page', 'gamify'),
                'hook' => 'publish_page',
                'args_count' => 2,
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => array_merge([
                    ['key' => 'min_media', 'label' => __('Min Media Count (Pro)', 'gamify'), 'type' => 'number', 'is_pro' => true]
                ], self::get_standard_schema())
            ],
            'comment_post' => [
                'label' => __('Post Comment', 'gamify'),
                'hook' => 'comment_post',
                'args_count' => 2,
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    return $c ? $c->user_id : 0;
                },
                'schema' => array_merge([
                    ['key' => 'min_chars', 'label' => __('Min Character Count (Pro)', 'gamify'), 'type' => 'number', 'is_pro' => true],
                    ['key' => 'instant_reward', 'label' => __('Instant Reward (Pro)', 'gamify'), 'type' => 'switch', 'is_pro' => true]
                ], self::get_standard_schema())
            ],
            'delete_post' => [
                'label' => __('Delete Post', 'gamify'),
                'hook' => 'before_delete_post',
                'args_count' => 1,
                'get_user_id' => function ($id) {
                    $p = get_post($id);
                    return $p ? $p->post_author : 0;
                },
                'schema' => array_merge([
                    ['key' => 'age_check', 'label' => __('Post Age Limit in Days (Pro)', 'gamify'), 'type' => 'number', 'is_pro' => true]
                ], self::get_standard_schema('deduct'))
            ],
            'user_role_change' => [
                'label' => __('Role Change', 'gamify'),
                'hook' => 'set_user_role',
                'args_count' => 3,
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => array_merge([
                    ['key' => 'role', 'label' => __('Target Role', 'gamify'), 'type' => 'select', 'dynamic' => ['integration' => 'wordpress', 'query' => 'roles']]
                ], self::get_standard_schema())
            ],
            'profile_update' => [
                'label' => __('Profile Update', 'gamify'),
                'hook' => 'profile_update',
                'args_count' => 2,
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::get_standard_schema()
            ],
            'post_updated' => [
                'label' => __('Post Updated', 'gamify'),
                'hook' => 'post_updated',
                'args_count' => 3,
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => array_merge([
                    ['key' => 'min_change', 'label' => __('Min Content Change % (Pro)', 'gamify'), 'type' => 'number', 'is_pro' => true]
                ], self::get_standard_schema())
            ],
            'after_password_reset' => [
                'label' => __('Password Reset', 'gamify'),
                'hook' => 'after_password_reset',
                'args_count' => 1,
                'get_user_id' => function ($u) {
                    return $u->ID;
                },
                'schema' => self::get_standard_schema()
            ]
        ];
    }
    public static function get_dynamic_queries(): array
    {
        return [
            'roles' => function () {
                return array_map(fn($n) => ['label' => $n, 'value' => $n], get_editable_roles());
            },
            'posts' => function () {
                $posts = get_posts(['posts_per_page' => 20]);
                return array_map(fn($p) => ['label' => $p->post_title, 'value' => $p->ID], $posts);
            }
        ];
    }
}
