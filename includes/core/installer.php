<?php

namespace Gamify\Core;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles plugin installation, creating database tables and inserting default data.
 * This class relies on Gamify\Core\Schema for table structures.
 */
class Installer
{
    /**
     * Run the installer process.
     * This is the single entry point for installation logic.
     */
    public function run()
    {
        $this->create_tables();
        $this->insert_default_data();
    }

    /**
     * Create necessary database tables using the defined schema.
     */
    private function create_tables()
    {
        // We need dbDelta to create/update tables safely.
        if (! function_exists('dbDelta')) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        // The autoloader will automatically load the Schema class when it's first used here.
        $schemas = Schema::get_tables();

        // Loop through each schema and run dbDelta
        foreach ($schemas as $schema_sql) {
            dbDelta($schema_sql);
        }
    }

    /**
     * Insert default data into tables if they are empty.
     */
    private function insert_default_data()
    {
        $this->insert_default_point_types();
    }

    /**
     * Inserts the default point types (e.g., Coin, Token).
     */
    private function insert_default_point_types()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'gamify_point_types';

        // Check if data already exists to prevent duplicates on re-activation
        $count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        if ($count > 0) {
            return;
        }

        $default_types = [
            ['name' => 'Coin', 'plural_name' => 'Spark Points', 'slug' => 'coin'],
            ['name' => 'Token', 'plural_name' => 'Skill Tokens', 'slug' => 'token'],
            ['name' => 'XP', 'plural_name' => 'Power Gems', 'slug' => 'xp'],
            ['name' => 'A LMS', 'plural_name' => 'Academy LMS', 'slug' => 'lms'],
        ];

        foreach ($default_types as $type) {
            $wpdb->insert($table_name, [
                'name'        => $type['name'],
                'plural_name' => $type['plural_name'],
                'slug'        => $type['slug'],
                'created_at'  => current_time('mysql'),
            ]);
        }
    }
}
