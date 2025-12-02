<?php

namespace Gamify\Classes;

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

    /**
     * Initialize the registry.
     */
    public static function init()
    {
        if (self::$initialized) {
            return;
        }

        self::register_defaults();
        self::$triggers = apply_filters('gamify_available_triggers', self::$triggers);
        self::$initialized = true;
    }

    /**
     * Helper to fetch Point Types for Select Dropdown.
     */
    private static function get_point_type_list()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';

        $options = ['1' => __('Default', 'gamify')];

        if ($wpdb->get_var("SHOW TABLES LIKE '$table'") != $table) {
            return $options;
        }

        $results = $wpdb->get_results("SELECT id, name FROM $table");

        if (!empty($results)) {
            $options = [];
            foreach ($results as $type) {
                $options[$type->id] = $type->name;
            }
        }

        return $options;
    }

    /**
     * Register core default triggers.
     */
    private static function register_defaults()
    {
        // ==========================================
        // 1. COMMON TRIGGERS (Supports Both)
        // ==========================================

        // --- User Login ---
        self::add('wp_login', [
            'label'       => __('User logs in', 'gamify'),
            'description' => __('Fires when a user logs in.', 'gamify'),
            'hook'        => 'wp_login',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'user',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_login, $user) {
                return $user->ID;
            },
            'award_fields' => [
                // Point Type Selection (Only for Achievements)
                'point_type_id' => [
                    'type'    => 'select',
                    'label'   => __('Point Type', 'gamify'),
                    'options' => self::get_point_type_list(),
                    'default' => 1,
                    'scope'   => ['achievement'],
                ],
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 10, 'required' => true],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day', '1_time' => '1 Time Only'],
                    'default' => 'unlimited'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Daily Login Bonus', 'gamify')],
            ],
            'deduct_fields' => [
                // Point Type Selection (Only for Achievements)
                'point_type_id' => [
                    'type'    => 'select',
                    'label'   => __('Point Type', 'gamify'),
                    'options' => self::get_point_type_list(),
                    'default' => 1,
                    'scope'   => ['achievement'],
                ],
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 5, 'required' => true],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', 'limited' => 'Limited Times'],
                    'default' => 'unlimited'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Login Penalty', 'gamify')],
            ]
        ]);

        // ==========================================
        // 2. POINT TYPE SPECIFIC TRIGGERS
        // ==========================================

        // --- Publish Post ---
        self::add('publish_post', [
            'label'       => __('User publishes a post', 'gamify'),
            'description' => __('Fires when a user publishes a new post.', 'gamify'),
            'hook'        => 'publish_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'content',
            'supports'    => ['point_type'],
            'get_user_id' => function ($post_id, $post) {
                return $post->post_author;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 20, 'required' => true],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'],
                    'default' => 'unlimited'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('New Post Published', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 10, 'required' => true],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', 'limited' => 'Limited Times'],
                    'default' => 'unlimited'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Post Penalty', 'gamify')],
            ]
        ]);

        // --- Comment on Post ---
        self::add('comment_post', [
            'label'       => __('User comments on a post', 'gamify'),
            'description' => __('Fires when a user submits a valid comment.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'discussion',
            'supports'    => ['point_type'],
            'get_user_id' => function ($comment_id, $comment_approved) {
                $comment = get_comment($comment_id);
                return (int) ($comment->user_id ?? 0);
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 5, 'required' => true],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'],
                    'default' => 'unlimited'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('New Comment', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 2, 'required' => true],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', 'limited' => 'Limited Times'],
                    'default' => 'unlimited'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Comment Penalty', 'gamify')],
            ]
        ]);

        // ==========================================
        // 3. ACHIEVEMENT SPECIFIC TRIGGERS
        // ==========================================

        // --- Unlock Specific Achievement ---
        self::add('unlock_specific_achievement', [
            'label'       => __('Unlock a specific achievement', 'gamify'),
            'description' => __('Award points/badge when another specific achievement is unlocked.', 'gamify'),
            'hook'        => 'gamify_achievement_unlocked',
            'args_count'  => 2,
            'type'        => 'gamify',
            'category'    => 'gamify',
            'supports'    => ['achievement'],
            'get_user_id' => function ($user_id, $achievement_id) {
                return $user_id;
            },
            'award_fields' => [
                'achievement_id' => ['type' => 'number', 'label' => __('Achievement ID to watch', 'gamify'), 'required' => true],
                'times'          => ['type' => 'number', 'label' => __('How many times?', 'gamify'), 'default' => 1]
            ]
        ]);

        // --- Expend Amount of Points ---
        self::add('expend_amount_of_points', [
            'label'       => __('Expend an amount of points', 'gamify'),
            'description' => __('Unlock when user spends a certain amount of points.', 'gamify'),
            'hook'        => 'gamify_points_deducted',
            'args_count'  => 4,
            'type'        => 'gamify',
            'category'    => 'gamify',
            'supports'    => ['achievement'],
            'get_user_id' => function ($user_id, $points, $type, $log_id) {
                return $user_id;
            },
            'award_fields' => [
                'points_needed' => [
                    'type' => 'number',
                    'label' => __('Points to expend', 'gamify'),
                    'default' => 100
                ],
                'point_type_id' => [
                    'type'    => 'select',
                    'label'   => __('Point Type', 'gamify'),
                    'options' => self::get_point_type_list(),
                    'default' => 1
                ]
            ]
        ]);

        // --- User Register (Added to Role) ---
        self::add('user_register', [
            'label'       => __('Get added to any role (Registration)', 'gamify'),
            'description' => __('Unlock when a user registers on the site.', 'gamify'),
            'hook'        => 'user_register',
            'args_count'  => 1,
            'type'        => 'wordpress',
            'category'    => 'user',
            'supports'    => ['achievement'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'role' => ['type' => 'text', 'label' => __('Role Slug (e.g. subscriber)', 'gamify'), 'default' => 'subscriber']
            ]
        ]);
    }

    /**
     * Add a new trigger to the registry.
     */
    public static function add(string $key, array $config)
    {
        if (!isset($config['supports'])) {
            $config['supports'] = ['point_type'];
        }
        self::$triggers[$key] = $config;
    }

    /**
     * Get all triggers.
     */
    public static function get_all($scope = null): array
    {
        if (! self::$initialized) {
            self::init();
        }

        if ($scope) {
            return array_filter(self::$triggers, function ($trigger) use ($scope) {
                return isset($trigger['supports']) && in_array($scope, $trigger['supports']);
            });
        }

        return self::$triggers;
    }

    /**
     * Get a specific trigger by key.
     */
    public static function get(string $key)
    {
        if (! self::$initialized) {
            self::init();
        }
        return self::$triggers[$key] ?? null;
    }
}
