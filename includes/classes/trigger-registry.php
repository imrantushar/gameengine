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

    // --- HELPER FUNCTIONS ---

    /**
     * Helper to fetch Point Types.
     */
    private static function get_point_type_list()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';
        $options = ['1' => __('Default', 'gamify')];

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) != $table) {
            return $options;
        }

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results("SELECT id, name FROM {$table}");

        if (!empty($results)) {
            $options = [];
            foreach ($results as $type) {
                $options[(string)$type->id] = $type->name;
            }
        }
        return $options;
    }

    /**
     * Helper to fetch Achievements.
     */
    private static function get_achievements_list()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_achievements';
        $options = [];

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) != $table) return $options;

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results("SELECT id, title FROM {$table} ORDER BY id DESC");

        if (!empty($results)) {
            foreach ($results as $item) {
                $options[(string)$item->id] = $item->title . " (ID: {$item->id})";
            }
        }
        return $options;
    }

    /**
     * Helper to fetch Levels.
     */
    private static function get_levels_list()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_levels';
        $options = [];

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) != $table) return $options;

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results("SELECT id, title FROM {$table} ORDER BY priority ASC");

        if (!empty($results)) {
            foreach ($results as $item) {
                $options[(string)$item->id] = $item->title;
            }
        }
        return $options;
    }

    /**
     * Helper to fetch Roles.
     */
    private static function get_roles_list()
    {
        global $wp_roles;
        if (!isset($wp_roles)) {
            $wp_roles = new \WP_Roles();
        }
        return $wp_roles->get_names();
    }

    /**
     * Register core default triggers.
     */
    private static function register_defaults()
    {
        // ==========================================
        // 1. GAMIFY TRIGGERS
        // ==========================================

        // --- Unlock Specific Achievement ---
        self::add('unlock_specific_achievement', [
            'label'       => __('Unlock a specific achievement', 'gamify'),
            'description' => __('Fires when a specific achievement is unlocked.', 'gamify'),
            'hook'        => 'gamify_achievement_unlocked',
            'args_count'  => 3,
            'type'        => 'gamify',
            'category'    => 'gamify',
            'supports'    => ['level', 'point_type'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'achievement_id' => [
                    'type'    => 'select',
                    'label'   => __('Select Achievement', 'gamify'),
                    'options' => self::get_achievements_list(),
                    'required' => true
                ],
                'points' => ['type' => 'number', 'label' => __('Points Award', 'gamify'), 'default' => 50, 'scope' => ['point_type']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'], 'default' => '1_time'],
            ]
        ]);

        // --- Expend Amount of Points ---
        self::add('expend_amount_of_points', [
            'label'       => __('Expend an amount of points', 'gamify'),
            'description' => __('Unlock when user spends a certain amount of points.', 'gamify'),
            'hook'        => 'gamify_points_deducted',
            'args_count'  => 5,
            'type'        => 'gamify',
            'category'    => 'gamify',
            'supports'    => ['achievement', 'level'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'points_needed' => ['type' => 'number', 'label' => __('Points to expend', 'gamify'), 'default' => 100],
                'point_type_id' => [
                    'type'    => 'select',
                    'label'   => __('Point Type', 'gamify'),
                    'options' => self::get_point_type_list(),
                    'default' => 1
                ],
                'limit' => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'], 'default' => 'unlimited'],
            ]
        ]);

        // --- Reach a Level ---
        self::add('reach_level', [
            'label'       => __('Reach a level', 'gamify'),
            'description' => __('Fires when a user reaches a specific level.', 'gamify'),
            'hook'        => 'gamify_level_awarded',
            'args_count'  => 3,
            'type'        => 'gamify',
            'category'    => 'gamify',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'level_id' => [
                    'type'    => 'select',
                    'label'   => __('Select Level', 'gamify'),
                    'options' => self::get_levels_list(),
                    'required' => true
                ],
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 100, 'scope' => ['point_type']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'], 'default' => '1_time'],
            ]
        ]);

        // ==========================================
        // 2. SITE INTERACTIONS
        // ==========================================

        // --- Daily Visit Website ---
        self::add('daily_visit_website', [
            'label'       => __('Daily visit the website', 'gamify'),
            'description' => __('Fires when a logged-in user visits any page.', 'gamify'),
            'hook'        => 'gamify_site_visit',
            'args_count'  => 2,
            'type'        => 'interaction',
            'category'    => 'interaction',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'limit'  => ['type' => 'hidden', 'default' => '1_per_day'],
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 5, 'scope' => ['point_type']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Daily Visit', 'gamify')],
            ]
        ]);

        // --- Visit Specific Post ---
        self::add('visit_specific_post', [
            'label'       => __('Visit a specific post', 'gamify'),
            'description' => __('Fires when a user visits a specific post.', 'gamify'),
            'hook'        => 'gamify_site_visit',
            'args_count'  => 2,
            'type'        => 'interaction',
            'category'    => 'interaction',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'post_id' => ['type' => 'number', 'label' => __('Post ID', 'gamify'), 'required' => true],
                'points'  => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 10, 'scope' => ['point_type']],
                'limit'   => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['1_time' => 'Once', '1_per_day' => 'Daily'], 'default' => '1_time'],
            ]
        ]);

        // ==========================================
        // 3. WORDPRESS CORE TRIGGERS
        // ==========================================

        // --- User Register ---
        self::add('user_register', [
            'label'       => __('Register to website', 'gamify'),
            'description' => __('Fires when a new user registers.', 'gamify'),
            'hook'        => 'user_register',
            'args_count'  => 1,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 50, 'scope' => ['point_type']],
                'limit'  => ['type' => 'hidden', 'default' => '1_time'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Registration Bonus', 'gamify')],
            ]
        ]);

        // --- User Login ---
        self::add('wp_login', [
            'label'       => __('Login to website', 'gamify'),
            'description' => __('Fires when a user logs in.', 'gamify'),
            'hook'        => 'wp_login',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($user_login, $user) {
                return $user->ID;
            },
            'award_fields' => [
                'point_type_id' => [
                    'type'    => 'select',
                    'label'   => __('Point Type', 'gamify'),
                    'options' => self::get_point_type_list(),
                    'default' => 1,
                    'scope'   => ['achievement', 'level'],
                ],
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 10, 'required' => true, 'scope' => ['point_type']],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day', '1_time' => '1 Time Only'],
                    'default' => '1_per_day'
                ],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Daily Login Bonus', 'gamify')],
            ],
            'deduct_fields' => [
                'point_type_id' => [
                    'type'    => 'select',
                    'label'   => __('Point Type', 'gamify'),
                    'options' => self::get_point_type_list(),
                    'default' => 1,
                    'scope'   => ['achievement', 'level'],
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

        // --- Publish Post ---
        self::add('publish_post', [
            'label'       => __('Publish a new post', 'gamify'),
            'description' => __('Fires when a user publishes a new post.', 'gamify'),
            'hook'        => 'publish_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($post_id, $post) {
                return $post->post_author;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 20, 'required' => true, 'scope' => ['point_type']],
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
            'label'       => __('Comment on a post', 'gamify'),
            'description' => __('Fires when a user submits a valid comment.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($comment_id, $comment_approved) {
                $comment = get_comment($comment_id);
                return (int) ($comment->user_id ?? 0);
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 5, 'required' => true, 'scope' => ['point_type']],
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

        // --- Publish Page ---
        self::add('publish_page', [
            'label'       => __('Publish a new page', 'gamify'),
            'hook'        => 'publish_page',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($id, $post) {
                return $post->post_author;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 30, 'scope' => ['point_type']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('New Page Published', 'gamify')],
            ]
        ]);

        // --- Delete Post ---
        self::add('delete_post', [
            'label'       => __('Delete a post', 'gamify'),
            'hook'        => 'before_delete_post',
            'args_count'  => 1,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type'],
            'get_user_id' => function ($post_id) {
                $post = get_post($post_id);
                return $post ? $post->post_author : 0;
            },
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 10, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Post Deleted Penalty', 'gamify')],
            ]
        ]);

        // --- Get Added to Role ---
        self::add('user_role_change', [
            'label'       => __('Get added to any role', 'gamify'),
            'description' => __('Fires when a user role is changed.', 'gamify'),
            'hook'        => 'set_user_role',
            'args_count'  => 3,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['achievement', 'level', 'point_type'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'role' => [
                    'type'    => 'select',
                    'label'   => __('Select Role', 'gamify'),
                    'options' => self::get_roles_list(),
                    'required' => true
                ],
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 50, 'scope' => ['point_type']],
                'limit'  => ['type' => 'hidden', 'default' => '1_time'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Role Promotion', 'gamify')],
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
