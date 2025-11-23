<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * A central registry for all available system triggers.
 * Allows registering default WordPress hooks and external plugin hooks.
 */
final class TriggerRegistry
{
    /**
     * Stores all registered trigger configurations.
     * @var array
     */
    private static $triggers = [];

    /**
     * Flag to ensure initialization runs only once.
     * @var bool
     */
    private static $initialized = false;

    /**
     * Initialize the registry.
     * Populates the triggers array with defaults and allows external modification.
     */
    public static function init()
    {
        if (self::$initialized) {
            return;
        }

        // Register core WordPress triggers
        self::register_defaults();

        // Allow other plugins to add their own triggers via this filter
        self::$triggers = apply_filters('gamify_available_triggers', self::$triggers);

        self::$initialized = true;
    }

    /**
     * Registers the default WordPress triggers.
     */
    private static function register_defaults()
    {
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
        ]);

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

    /**
     * Add a single trigger to the registry array.
     *
     * @param string $key    Unique identifier for the trigger.
     * @param array  $config Configuration options for the trigger.
     */
    public static function add(string $key, array $config)
    {
        self::$triggers[$key] = $config;
    }

    /**
     * Retrieve all registered triggers.
     *
     * @return array
     */
    public static function get_all(): array
    {
        if (! self::$initialized) {
            self::init();
        }
        return self::$triggers;
    }

    /**
     * Retrieve a single trigger configuration by key.
     *
     * @param string $key
     * @return array|null
     */
    public static function get(string $key)
    {
        $triggers = self::get_all();
        return $triggers[$key] ?? null;
    }
}
