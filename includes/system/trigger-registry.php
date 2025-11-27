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
        // --- 1. Login Trigger (Updated to match React Form) ---
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

            // Matches AwardHookForm: Points, Limit, Label, URL
            'award_fields' => [
                'points' => [
                    'type'     => 'number',
                    'label'    => __('Points', 'gamify'),
                    'default'  => 10,
                    'required' => true
                ],
                'limit' => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => [
                        'unlimited' => __('Unlimited', 'gamify'),
                        '1_per_day' => __('1 per day', 'gamify'),
                        '1_time'    => __('1 time only', 'gamify'),
                    ],
                    'default' => 'unlimited',
                ],
                'label' => [
                    'type'        => 'text',
                    'label'       => __('Log Label', 'gamify'),
                    'placeholder' => __('e.g. Daily Login Bonus', 'gamify'),
                    'default'     => __('Daily Login Bonus', 'gamify'),
                ],
                'url' => [
                    'type'        => 'text',
                    'label'       => __('Reference URL', 'gamify'),
                    'placeholder' => __('https://...', 'gamify'),
                    'default'     => '',
                ],
            ],

            // Matches Logic for Deduction (Points, Limit, Label)
            'deduct_fields' => [
                'points' => [
                    'type'     => 'number',
                    'label'    => __('Deduct Points', 'gamify'),
                    'default'  => 5,
                    'required' => true
                ],
                'limit' => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => [
                        'unlimited' => __('Unlimited', 'gamify'),
                        'limited'   => __('Limited', 'gamify'),
                    ],
                    'default' => 'unlimited',
                ],
                'label' => [
                    'type'    => 'text',
                    'label'   => __('Log Label', 'gamify'),
                    'default' => __('Login Penalty', 'gamify'),
                ],
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
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 20, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Label', 'gamify'), 'default' => __('New Post Published', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 10, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Label', 'gamify'), 'default' => __('Post Penalty', 'gamify')],
            ]
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
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 5, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Label', 'gamify'), 'default' => __('New Comment', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 2, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Label', 'gamify'), 'default' => __('Comment Penalty', 'gamify')],
            ]
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
