<?php

namespace GameEngine\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Installer
 * Handles database table creation and schema updates during activation.
 * Data persists even after deactivation.
 */
class Installer
{

    /**
     * Run the installer process on plugin activation.
     */
    public function run()
    {
        $this->create_tables();
        $this->maybe_run_migrations();

		if ( ! get_option( 'gameengine_first_install_time' ) ) {
			add_option( 'gameengine_first_install_time', time(), false );
		}
    }

    /**
     * Run additive schema migrations keyed by a DB version stored in options.
     * Each migration is run once; the version is bumped after success.
     */
    private function maybe_run_migrations()
    {
        $current_db_version = (int) get_option('gameengine_db_version', 0);

        $migrations = [
            // Version 1: add expiration columns and badge assertion column
            1 => function () {
                global $wpdb;
                $log_table = $wpdb->prefix . 'gameengine_points_log';
                $ua_table  = $wpdb->prefix . 'gameengine_user_achievements';

                // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $has_expires = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$log_table} LIKE %s", 'expires_at'));
                if (empty($has_expires)) {
                    $wpdb->query("ALTER TABLE {$log_table} ADD COLUMN expires_at DATETIME NULL DEFAULT NULL AFTER description");
                }

                $has_expired = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$log_table} LIKE %s", 'expired'));
                if (empty($has_expired)) {
                    $wpdb->query("ALTER TABLE {$log_table} ADD COLUMN expired TINYINT(1) NOT NULL DEFAULT 0 AFTER expires_at");
                }

                $has_pt_idx = $wpdb->get_results($wpdb->prepare("SHOW INDEX FROM {$log_table} WHERE Key_name = %s", 'pt_created'));
                if (empty($has_pt_idx)) {
                    $wpdb->query("ALTER TABLE {$log_table} ADD INDEX pt_created (point_type_id, created_at)");
                }

                $has_assertion = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$ua_table} LIKE %s", 'badge_assertion_id'));
                if (empty($has_assertion)) {
                    $wpdb->query("ALTER TABLE {$ua_table} ADD COLUMN badge_assertion_id BIGINT(20) UNSIGNED NULL DEFAULT NULL");
                }
                // phpcs:enable
            },
        ];

        foreach ($migrations as $version => $migration) {
            if ($current_db_version < $version) {
                $migration();
                update_option('gameengine_db_version', $version);
                $current_db_version = $version;
            }
        }
    }

    /**
     * Creates or updates database tables using dbDelta.
     * It does not insert default data.
     */
    private function create_tables()
    {
        if (!function_exists('dbDelta')) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        // Fetch table schemas from the Schema class
        $schemas = Schema::get_tables();

        // Create or update each table safely
        foreach ($schemas as $schema_sql) {
            dbDelta($schema_sql);
        }

        $this->ensure_columns_exist();
    }

    /**
     * Specifically ensure certain columns exist that might be missed by dbDelta in some envs.
     */
    private function ensure_columns_exist()
    {
        global $wpdb;
        $table_name = "{$wpdb->prefix}gameengine_levels";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $column = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$table_name} LIKE %s", 'description'));

        if (empty($column)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("ALTER TABLE {$table_name} ADD COLUMN description TEXT AFTER status");
        }
    }

    /**
     * This method is intentionally left empty.
     * We do not drop tables on deactivation to preserve user data.
     */
    public function uninstall()
    {
        // No table drop logic here
    }
}
