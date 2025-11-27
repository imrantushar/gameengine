<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * A central registry for all available system triggers.
 */
final class TriggerRegistry
{
    private static $triggers = [];
    private static $initialized = false;

    public static function init()
    {
        if (self::$initialized) return;

        self::register_defaults();
        self::$triggers = apply_filters('gamify_available_triggers', self::$triggers);
        self::$initialized = true;
    }

    private static function register_defaults()
    {
        // --- 1. Login Trigger ---
        self::add('wp_login', [
            'label'       => __('User logs in', 'gamify'),
            'description' => __('Fires when a user logs in.', 'gamify'),
            'hook'        => 'wp_login',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'user',
            'get_user_id' => function ($user_login, $user) {
                return $user->ID;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 10, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Label', 'gamify'), 'default' => __('Daily Login Bonus', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 5, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Label', 'gamify'), 'default' => __('Login Penalty', 'gamify')],
            ]
        ]);

        // --- 2. Publish Post Trigger ---
        self::add('publish_post', [
            'label'       => __('User publishes a post', 'gamify'),
            'description' => __('Fires when a user publishes a new post.', 'gamify'),
            'hook'        => 'publish_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'content',
            'get_user_id' => function ($post_id, $post) {
                return $post->post_author;
            },
        ]);

        // --- 3. Comment Post Trigger ---
        self::add('comment_post', [
            'label'       => __('User posts a comment', 'gamify'),
            'description' => __('Fires when a user submits a comment.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'discussion',
            'get_user_id' => function ($comment_id, $comment_approved) {
                $comment = get_comment($comment_id);
                return (int) ($comment->user_id ?? 0);
            },
        ]);
    }

    public static function add(string $key, array $config)
    {
        self::$triggers[$key] = $config;
    }

    public static function get_all(): array
    {
        if (! self::$initialized) self::init();
        return self::$triggers;
    }

    public static function get(string $key)
    {
        $triggers = self::get_all();
        return $triggers[$key] ?? null;
    }
}
