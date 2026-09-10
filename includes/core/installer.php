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
     * Option storing the hash of the current table definitions.
     * When Schema::get_tables() changes, the hash changes and maybe_sync_schema()
     * re-runs dbDelta automatically — so a schema edit no longer needs a manual
     * reactivation or a scratch update script.
     */
    const SCHEMA_HASH_OPTION = 'gameengine_schema_hash';

    /**
     * Run the installer process on plugin activation.
     */
    public function run()
    {
        $this->create_tables();

        update_option( self::SCHEMA_HASH_OPTION, self::compute_schema_hash(), true );

		if ( ! get_option( 'gameengine_first_install_time' ) ) {
			add_option( 'gameengine_first_install_time', time(), false );
		}
    }

    /**
     * Hash of the current table definitions, used to detect schema changes.
     */
    public static function compute_schema_hash()
    {
        return md5( implode( '', Schema::get_tables() ) );
    }

    /**
     * Re-runs the installer when the table definitions change.
     *
     * Hooked early on `init`; cheap because it only reads one autoloaded option
     * and md5s the schema strings. dbDelta runs only when the hash differs.
     */
    public static function maybe_sync_schema()
    {
        $hash = self::compute_schema_hash();
        if ( ! $hash || $hash === get_option( self::SCHEMA_HASH_OPTION ) ) {
            return;
        }

        ( new self() )->run();
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

        $levels_table = "{$wpdb->prefix}gameengine_levels";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $column = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$levels_table} LIKE %s", 'description'));

        if (empty($column)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("ALTER TABLE {$levels_table} ADD COLUMN description TEXT AFTER status");
        }

        $ach_table = "{$wpdb->prefix}gameengine_achievements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $badge_col = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$ach_table} LIKE %s", 'badge_id'));

        if (empty($badge_col)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("ALTER TABLE {$ach_table} ADD COLUMN badge_id BIGINT(20) UNSIGNED DEFAULT NULL AFTER badge_image");
        }

        $ranks_table = "{$wpdb->prefix}gameengine_ranks";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $color_col = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$ranks_table} LIKE %s", 'color'));

        if (empty($color_col)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("ALTER TABLE {$ranks_table} ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#6c5ce7' AFTER icon");
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
