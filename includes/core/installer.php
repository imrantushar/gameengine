<?php

namespace Gamify\Core;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles plugin installation, table creation, and default data seeding.
 */
class Installer
{
    /**
     * Run the installer (Activation Hook).
     */
    public function run()
    {
        $this->create_tables();
        $this->insert_default_data();
    }

    /**
     * Drops all custom tables on deactivation using dynamic prefix.
     */
    public function uninstall()
    {
        global $wpdb;

        $tables = [
            'gamify_point_types',
            'gamify_achievements',
            'gamify_levels',
            'gamify_requirements',
            'gamify_points_log',
            'gamify_logs',
            'gamify_user_achievements',
            'gamify_user_levels',
            'gamify_requirement_progress'
        ];

        foreach ($tables as $table) {
            $table_name = $wpdb->prefix . $table;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->query("DROP TABLE IF EXISTS $table_name");
        }
    }

    /**
     * Creates database tables using Schema SQL.
     */
    private function create_tables()
    {
        if (! function_exists('dbDelta')) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        $schemas = Schema::get_tables();

        foreach ($schemas as $schema_sql) {
            dbDelta($schema_sql);
        }
    }

    /**
     * Inserts default starting data.
     */
    private function insert_default_data()
    {
        global $wpdb;

        // 1. Insert Default Point Type (XP)
        $wpdb->insert("{$wpdb->prefix}gamify_point_types", [
            'name'        => 'XP',
            'plural_name' => 'Experience Points',
            'slug'        => 'xp',
            'created_at'  => current_time('mysql'),
        ]);
        $xp_id = $wpdb->insert_id;

        // 2. Insert Default Achievement
        $wpdb->insert("{$wpdb->prefix}gamify_achievements", [
            'title'                      => 'Welcome Member',
            'plural_name'                => 'Welcome Members',
            'category'                   => 'General',
            'congratulations_message'    => 'Welcome! You earned your first badge.',
            'max_earnings_per_user'      => 1,
            'unlock_with_points_enabled' => 0,
            'required_point_type_id'     => $xp_id,
            // Restrict fields default to NULL
            'required_achievement_id'    => null,
            'required_level_id'          => null,
            'restriction_message'        => 'You must complete earlier tasks first.',
            'created_at'                 => current_time('mysql'),
        ]);
        $achievement_id = $wpdb->insert_id;

        // 3. Insert Default Level
        $wpdb->insert("{$wpdb->prefix}gamify_levels", [
            'title'                      => 'Newbie',
            'plural_name'                => 'Newbies',
            'category'                   => 'Progression',
            'priority'                   => 1,
            'unlock_with_points_enabled' => 1,
            'point_type_id'              => $xp_id,
            'min_points'                 => 0,
            'max_points'                 => 500,
            'congratulations_message'    => 'Welcome to the Newbie level!',
            // Restrict fields default to NULL
            'required_achievement_id'    => null,
            'required_level_id'          => null,
            'restriction_message'        => 'Reach the required status to unlock.',
            'created_at'                 => current_time('mysql'),
        ]);
        $level_id = $wpdb->insert_id;

        // 4. Seeding default triggers
        $this->insert_default_triggers($xp_id, $achievement_id, $level_id);
    }

    private function insert_default_triggers($xp_id, $achievement_id, $level_id)
    {
        global $wpdb;
        $table = "{$wpdb->prefix}gamify_requirements";

        // Login -> 10 XP
        $wpdb->insert($table, [
            'reward_type' => 'point_type',
            'reward_id'   => $xp_id,
            'trigger_key' => 'wp_login',
            'parameters'  => json_encode(['points' => 10, 'limit' => 'unlimited', 'log_label' => 'Daily Login']),
            'is_active'   => 1,
        ]);

        // Register -> Welcome Achievement
        $wpdb->insert($table, [
            'reward_type' => 'achievement',
            'reward_id'   => $achievement_id,
            'trigger_key' => 'user_register',
            'parameters'  => json_encode(['log_label' => 'Joined Community']),
            'is_active'   => 1,
        ]);
    }
}
