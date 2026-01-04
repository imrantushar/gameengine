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
        $options = ['1' => __('Default', 'gamify')];

        // 1. Check Cache
        $cache_key = 'gamify_registry_point_types';
        $cached    = wp_cache_get($cache_key, 'gamify');
        if (false !== $cached) {
            return $cached;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';

        // 2. Verify table exists safely
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) !== $table) {
            return $options;
        }

        // 3. Fetch Data
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}gamify_point_types");

        if (!empty($results)) {
            $options = [];
            foreach ($results as $type) {
                $options[(string)$type->id] = $type->name;
            }
        }

        // 4. Set Cache
        wp_cache_set($cache_key, $options, 'gamify', 300);

        return $options;
    }

    /**
     * Helper to fetch Achievements.
     */
    private static function get_achievements_list()
    {
        // 1. Check Cache
        $cache_key = 'gamify_registry_achievements';
        $cached    = wp_cache_get($cache_key, 'gamify');
        if (false !== $cached) {
            return $cached;
        }

        $options = [];
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_achievements';

        // 2. Verify table exists safely
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) !== $table) {
            return $options;
        }

        // 3. Fetch Data
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gamify_achievements ORDER BY id DESC");

        if (!empty($results)) {
            foreach ($results as $item) {
                $options[(string)$item->id] = $item->title . " (ID: {$item->id})";
            }
        }

        // 4. Set Cache
        wp_cache_set($cache_key, $options, 'gamify', 300);

        return $options;
    }

    /**
     * Helper to fetch Levels.
     */
    private static function get_levels_list()
    {
        // 1. Check Cache
        $cache_key = 'gamify_registry_levels';
        $cached    = wp_cache_get($cache_key, 'gamify');
        if (false !== $cached) {
            return $cached;
        }

        $options = [];
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_levels';

        // 2. Verify table exists safely
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table)) !== $table) {
            return $options;
        }

        // 3. Fetch Data
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC");

        if (!empty($results)) {
            foreach ($results as $item) {
                $options[(string)$item->id] = $item->title;
            }
        }

        // 4. Set Cache
        wp_cache_set($cache_key, $options, 'gamify', 300);

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
     * Helper to fetch all Posts and Pages.
     */
    private static function get_all_posts_list()
    {
        $options = [];
        $args = [
            'post_type'      => ['post'],
            'posts_per_page' => 100,
            'post_status'    => 'publish',
        ];

        $posts = get_posts($args);

        if (!empty($posts)) {
            foreach ($posts as $post) {
                $options[(string)$post->ID] = $post->post_title . " (ID: {$post->ID})";
            }
        }

        return $options;
    }

    /**
     * Register core default triggers.
     */
    private static function register_defaults()
    {
        // Unlock Specific Achievement
        // --- Unlock Specific Achievement ---
        self::add('unlock_specific_achievement', [
            'label'       => __('Unlock a specific achievement', 'gamify'),
            'description' => __('Fires when a specific achievement is unlocked.', 'gamify'),
            'hook'        => 'gamify_achievement_unlocked',
            'args_count'  => 3,
            'type'        => 'gamify',
            'category'    => 'gamify',
            'supports'    => ['achievement', 'point_type'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'achievement_id' => [
                    'type'    => 'select',
                    'label'   => __('Select Achievement', 'gamify'),
                    'options' => self::get_achievements_list(),
                    'required' => true,
                    'scope'    => ['achievement', 'point_type']
                ],
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points Award', 'gamify'),
                    'default' => 50,
                    'scope'   => ['achievement', 'point_type']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'],
                    'default' => '1_time',
                    'scope'   => ['achievement', 'point_type']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Achievement Unlock Bonus', 'gamify'),
                    'scope'   => ['achievement', 'point_type']
                ],
            ],
            'deduct_fields' => [
                'achievement_id' => [
                    'type'    => 'select',
                    'label'   => __('Select Achievement', 'gamify'),
                    'options' => self::get_achievements_list(),
                    'required' => true,
                    'scope'    => ['achievement', 'point_type']
                ],
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points to Deduct', 'gamify'),
                    'default' => 10,
                    'scope'   => ['achievement', 'point_type']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'],
                    'default' => '1_time',
                    'scope'   => ['achievement', 'point_type']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Achievement Unlock Penalty', 'gamify'),
                    'scope'   => ['achievement', 'point_type']
                ],
            ]
        ]);

        // User Login
        self::add('wp_login', [
            'label'       => __('Login to website', 'gamify'),
            'description' => __('Fires when a user logs in.', 'gamify'),
            'hook'        => 'wp_login',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
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

        // Publish Post
        self::add('publish_post', [
            'label'       => __('Publish a new post', 'gamify'),
            'description' => __('Fires when a user publishes a new post.', 'gamify'),
            'hook'        => 'publish_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
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

        // Comment on Post
        self::add('comment_post', [
            'label'       => __('Comment on a post', 'gamify'),
            'description' => __('Fires when a user submits a valid comment.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
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

        // --- User Register ---
        self::add('user_register', [
            'label'       => __('Register to website', 'gamify'),
            'description' => __('Fires when a new user registers on the site.', 'gamify'),
            'hook'        => 'user_register',
            'args_count'  => 1,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points', 'gamify'),
                    'default' => 50,
                    'scope'   => ['point_type']
                ],
                'limit'  => [
                    'type'    => 'hidden',
                    'default' => '1_time',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Registration Bonus', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 0],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Registration Reversal', 'gamify')],
            ]
        ]);

        // --- Publish Page ---
        self::add('publish_page', [
            'label'       => __('Publish a new page', 'gamify'),
            'description' => __('Fires when a user publishes a new WordPress page.', 'gamify'),
            'hook'        => 'publish_page',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($post_id, $post) {
                return $post->post_author;
            },
            'award_fields' => [
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points', 'gamify'),
                    'default' => 30,
                    'scope'   => ['point_type', 'achievement']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day', '1_time' => '1 Time Only'],
                    'default' => 'unlimited',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('New Page Published', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ],
            'deduct_fields' => [
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Deduct Points', 'gamify'),
                    'default' => 15,
                    'required' => true
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited'],
                    'default' => 'unlimited'
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Page Deletion Penalty', 'gamify')
                ],
            ]
        ]);


        // --- Delete Post ---
        self::add('delete_post', [
            'label'       => __('Delete a post', 'gamify'),
            'description' => __('Fires when a post is permanently deleted from the site.', 'gamify'),
            'hook'        => 'before_delete_post',
            'args_count'  => 1,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($post_id) {
                $post = get_post($post_id);
                return $post ? $post->post_author : 0;
            },
            'award_fields' => [
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points', 'gamify'),
                    'default' => 0,
                    'scope'   => ['point_type', 'achievement']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited'],
                    'default' => 'unlimited',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Post Deleted Reward', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ],
            'deduct_fields' => [
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Deduct Points', 'gamify'),
                    'default' => 20,
                    'required' => true
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['unlimited' => 'Unlimited'],
                    'default' => 'unlimited'
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Post Deletion Penalty', 'gamify')
                ],
            ]
        ]);

        // --- User Role Change ---
        self::add('user_role_change', [
            'label'       => __('Change user role', 'gamify'),
            'description' => __('Fires when a user is assigned to a specific role.', 'gamify'),
            'hook'        => 'set_user_role',
            'args_count'  => 3,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id, $role, $old_roles) {
                return $user_id;
            },
            'award_fields' => [
                'role' => [
                    'type'    => 'select',
                    'label'   => __('Select Target Role', 'gamify'),
                    'options' => self::get_roles_list(),
                    'required' => true,
                    'scope'    => ['point_type', 'achievement']
                ],
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points to Award', 'gamify'),
                    'default' => 50,
                    'scope'   => ['point_type', 'achievement']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['1_time' => '1 Time Only', 'unlimited' => 'Unlimited'],
                    'default' => '1_time',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Role Promotion Reward', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ],
            'deduct_fields' => [
                'role' => [
                    'type'    => 'select',
                    'label'   => __('Select Target Role', 'gamify'),
                    'options' => self::get_roles_list(),
                    'required' => true,
                    'scope'    => ['point_type', 'achievement']
                ],
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points to Deduct', 'gamify'),
                    'default' => 20,
                    'scope'   => ['point_type', 'achievement']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['1_time' => '1 Time Only', 'unlimited' => 'Unlimited'],
                    'default' => 'unlimited',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Role Downgrade Penalty', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ]
        ]);

        // --- Profile Update ---
        self::add('profile_update', [
            'label'       => __('Update user profile', 'gamify'),
            'description' => __('Fires when a user updates their profile information.', 'gamify'),
            'hook'        => 'profile_update',
            'args_count'  => 2,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points Award', 'gamify'), 'default' => 20, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['1_time' => '1 Time Only', '1_per_month' => 'Once a Month'], 'default' => '1_time', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Profile Completion Reward', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 10, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Profile Reversal Penalty', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ]
        ]);

        // --- Update Existing Post ---
        self::add('post_updated', [
            'label'       => __('Update an existing post', 'gamify'),
            'description' => __('Fires when an author edits and updates an already published post.', 'gamify'),
            'hook'        => 'post_updated',
            'args_count'  => 3,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($post_id, $post_after, $post_before) {
                if ($post_after->post_status === 'publish') {
                    return $post_after->post_author;
                }
                return 0;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points Award', 'gamify'), 'default' => 5, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '3_per_day' => '3 Per Day'], 'default' => '3_per_day', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Content Improvement Bonus', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 2, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Post Update Reversal', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ]
        ]);

        // --- Password Reset ---
        self::add('after_password_reset', [
            'label'       => __('Change account password', 'gamify'),
            'description' => __('Fires when a user successfully resets or changes their password.', 'gamify'),
            'hook'        => 'after_password_reset',
            'args_count'  => 1,
            'type'        => 'wordpress',
            'category'    => 'wordpress',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user) {
                return $user->ID;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points Award', 'gamify'), 'default' => 15, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['1_time' => '1 Time Only', 'unlimited' => 'Unlimited'], 'default' => '1_time', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Security Awareness Reward', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 0, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Security Penalty', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ]
        ]);


        // ==========================================
        // 2. SITE INTERACTIONS
        // ==========================================

        // --- Daily Visit Website ---
        self::add('daily_visit_website', [
            'label'       => __('Daily visit website', 'gamify'),
            'description' => __('Fires when a user visits the website (ideally once per day).', 'gamify'),
            'hook'        => 'gamify_site_visit',
            'args_count'  => 2,
            'type'        => 'interaction',
            'category'    => 'interaction',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id) {
                return $user_id;
            },
            'award_fields' => [
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points', 'gamify'),
                    'default' => 5,
                    'scope'   => ['point_type']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['1_per_day' => '1 Per Day', 'unlimited' => 'Unlimited'],
                    'default' => '1_per_day',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Daily Visit Reward', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 0],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Visit Penalty', 'gamify')],
            ]
        ]);

        // --- Visit Specific Post ---
        self::add('visit_specific_post', [
            'label'       => __('Visit a specific post', 'gamify'),
            'description' => __('Fires when a user visits a specific post or page.', 'gamify'),
            'hook'        => 'gamify_site_visit',
            'args_count'  => 2,
            'type'        => 'interaction',
            'category'    => 'interaction',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($user_id, $post_id) {
                return $user_id;
            },
            'award_fields' => [
                'post_id' => [
                    'type'     => 'select',
                    'label'    => __('Select Post/Page', 'gamify'),
                    'options'  => self::get_all_posts_list(),
                    'required' => true,
                    'scope'    => ['point_type', 'achievement']
                ],
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points to Award', 'gamify'),
                    'default' => 10,
                    'scope'   => ['point_type', 'achievement']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['1_time' => '1 Time Only', '1_per_day' => '1 Per Day', 'unlimited' => 'Unlimited'],
                    'default' => '1_time',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Specific Post Visit Reward', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ],
            'deduct_fields' => [
                'post_id' => [
                    'type'     => 'select',
                    'label'    => __('Select Post/Page', 'gamify'),
                    'options'  => self::get_all_posts_list(),
                    'required' => true,
                    'scope'    => ['point_type', 'achievement']
                ],
                'points' => [
                    'type'    => 'number',
                    'label'   => __('Points to Deduct', 'gamify'),
                    'default' => 5,
                    'scope'   => ['point_type', 'achievement']
                ],
                'limit'  => [
                    'type'    => 'select',
                    'label'   => __('Limit', 'gamify'),
                    'options' => ['1_time' => '1 Time Only', '1_per_day' => '1 Per Day', 'unlimited' => 'Unlimited'],
                    'default' => 'unlimited',
                    'scope'   => ['point_type', 'achievement']
                ],
                'label'  => [
                    'type'    => 'text',
                    'label'   => __('Log Description', 'gamify'),
                    'default' => __('Specific Post Visit Penalty', 'gamify'),
                    'scope'   => ['point_type', 'achievement']
                ],
            ]
        ]);

        // --- Author Reply to Comment ---
        self::add('author_comment_reply', [
            'label'       => __('Reply to a comment (Author only)', 'gamify'),
            'description' => __('Fires when a post author replies to a comment on their own post.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'interaction',
            'category'    => 'interaction',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($comment_id, $comment_approved) {
                $comment = get_comment($comment_id);
                if (!$comment || $comment->comment_parent == 0) return 0;

                $post = get_post($comment->comment_post_ID);
                if ($post && (int)$post->post_author === (int)$comment->user_id) {
                    return $comment->user_id;
                }
                return 0;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points Award', 'gamify'), 'default' => 10, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '5_per_day' => '5 Per Day'], 'default' => 'unlimited', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Author Engagement Bonus', 'gamify'), 'scope' => ['point_type', 'achievement']],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 5, 'scope' => ['point_type', 'achievement']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited', 'scope' => ['point_type', 'achievement']],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Author Engagement Penalty', 'gamify'), 'scope' => ['point_type', 'achievement']],
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
        if (!isset($config['category'])) {
            $config['category'] = 'general';
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

    /**
     * Get list of all unique categories for filtering.
     */
    public static function get_categories()
    {
        if (! self::$initialized) {
            self::init();
        }

        $categories = array_unique(array_column(self::$triggers, 'category'));

        $formatted = [];
        foreach ($categories as $cat) {
            $formatted[] = [
                'slug'  => $cat,
                'label' => ucwords(str_replace(['-', '_'], ' ', $cat))
            ];
        }
        return $formatted;
    }
}
