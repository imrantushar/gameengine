<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH'))
    exit;

class WordPress extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'wordpress';
    }

    public static function get_name(): string
    {
        return __('Core', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-wordpress';
    }

    public static function get_triggers(): array
    {
        return [
            'wp_login' => [
                'label' => __('User Login', 'gameengine'),
                'hook' => 'wp_login',
                'args_count' => 2,
                'description' => __('Awarded when a user successfully logs into your website.', 'gameengine'),
                'get_user_id' => function ($login, $user) {
                    return $user->ID;
                },
                'supports' => ['achievement', 'point_type', 'level'],
                'schema' => self::merge_schema([])
            ],
            'user_register' => [
                'label' => __('User Register', 'gameengine'),
                'hook' => 'user_register',
                'description' => __('Awarded when a user successfully register into your website.', 'gameengine'),
                'args_count' => 1,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::merge_schema([])
            ],
            'publish_post' => [
                'label' => __('Publish Post', 'gameengine'),
                'hook' => 'publish_post',
                'description' => __('Publish post successfully into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => self::merge_schema([])

            ],
            'publish_page' => [
                'label' => __('Publish Page', 'gameengine'),
                'hook' => 'publish_page',
                'description' => __('Publish page successfully into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => self::merge_schema([])
            ],
            'comment_post' => [
                'label' => __('Post Comment', 'gameengine'),
                'hook' => 'comment_post',
                'description' => __('Comment post successfully into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    return $c ? $c->user_id : 0;
                },
                'schema' => self::merge_schema([])
            ],
            'delete_post' => [
                'label' => __('Delete Post', 'gameengine'),
                'hook' => 'wp_trash_post',
                'description' => __('Delete post successfully into your website.', 'gameengine'),
                'args_count' => 1,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($post_id) {
                    $post = get_post($post_id);
                    return $post ? $post->post_author : 0;
                },
                'schema' => self::merge_schema([], 'deduct')
            ],
            'user_role_change' => [
                'label' => __('Role Change', 'gameengine'),
                'hook' => 'set_user_role',
                'description' => __('User role change successfully into your website.', 'gameengine'),
                'args_count' => 3,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::merge_schema([])
            ],
            'profile_update' => [
                'label' => __('Profile Update', 'gameengine'),
                'hook' => 'profile_update',
                'description' => __('Profile update successfully into your website.', 'gameengine'),
                'supports' => ['point_type', 'achievement', 'level'],
                'args_count' => 2,
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::merge_schema([])
            ],
            'post_updated' => [
                'label' => __('Post Updated', 'gameengine'),
                'hook' => 'post_updated',
                'description' => __('Post update successfully into your website.', 'gameengine'),
                'args_count' => 3,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => self::merge_schema([])
            ],
            'after_password_reset' => [
                'label' => __('Password Reset', 'gameengine'),
                'hook' => 'after_password_reset',
                'description' => __('Reset password successfully into your website.', 'gameengine'),
                'args_count' => 1,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($u) {
                    return $u->ID;
                },
                'schema' => self::merge_schema([])
            ],
            'daily_visit_website' => [
                'label' => __('Daily Visit', 'gameengine'),
                'hook' => 'gameengine_site_visit',
                'description' => __('Daily visit successfully  into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::merge_schema([])
            ],
            'visit_specific_post' => [
                'label' => __('Visit Specific Post', 'gameengine'),
                'hook' => 'gameengine_site_visit',
                'description' => __('Visit Specific post successfully  into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    return $id;
                },
                'schema' => self::merge_schema([
                    ['key' => 'post_id', 'label' => __('Select Post', 'gameengine'), 'type' => 'select', 'width' => '50%', 'dynamic' => ['integration' => 'wordpress', 'query' => 'posts']],
                ])
            ],
            'author_comment_reply' => [
                'label' => __('Author Reply', 'gameengine'),
                'hook' => 'comment_post',
                'description' => __('Author comment successfully  into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    if (!$c || $c->comment_parent == 0)
                        return 0;
                    $p = get_post($c->comment_post_ID);
                    return ($p && (int) $p->post_author === (int) $c->user_id) ? $c->user_id : 0;
                },
                'schema' => self::merge_schema([])
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
            },
            'categories' => function () {
                $terms = get_terms(['taxonomy' => 'category', 'hide_empty' => false]);
                return array_map(fn($t) => ['label' => $t->name, 'value' => $t->term_id], $terms);
            }
        ];
    }
}
