<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

final class TriggerRegistry
{
    private static $triggers = [];

    /**
     * Register all available triggers.
     */
    public static function register()
    {
        self::add('wp_login', [
            'label'       => __('User logs in', 'gamify'),
            'hook'        => 'wp_login',
            'args_count'  => 2,
            'get_user_id' => function ($user_login, $user) {
                return $user->ID;
            },
        ]);

        self::add('publish_post', [
            'label'       => __('User publishes a new post', 'gamify'),
            'hook'        => 'publish_post',
            'args_count'  => 2,
            'get_user_id' => function ($post_id, $post) {
                return $post->post_author;
            },
        ]);

        self::add('comment_post', [
            'label'       => __('User posts a comment', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 1,
            'get_user_id' => function ($comment_id) {
                $comment = get_comment($comment_id);
                return (int) ($comment->user_id ?? 0);
            },
        ]);

        // Add more triggers here...

        // Allow other developers to add their own triggers
        self::$triggers = apply_filters('gamify_register_triggers', self::$triggers);
    }

    /**
     * Add a single trigger to the registry.
     */
    public static function add(string $key, array $config)
    {
        self::$triggers[$key] = $config;
    }

    /**
     * Get all registered triggers.
     */
    public static function get_all(): array
    {
        if (empty(self::$triggers)) {
            self::register();
        }
        return self::$triggers;
    }

    /**
     * Get a single trigger by its key.
     */
    public static function get(string $key)
    {
        return self::get_all()[$key] ?? null;
    }
}
