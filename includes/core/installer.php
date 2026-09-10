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
			add_option( 'gameengine_first_install_time', time(), '', false );
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
     * Option flagging that the blanked point type repair has run.
     */
    const POINT_TYPE_REPAIR_OPTION = 'gameengine_point_types_repaired';

    /**
     * Restore point types blanked by a partial update.
     *
     * Earlier releases had the update endpoint write every column on every request, so a
     * call that carried only a status — trashing a row from its action menu —
     * emptied the name, plural name and status alongside it. Rows damaged that
     * way render as a blank line in the list and match no status tab.
     *
     * The slug is derived from the name when a point type is created and is
     * never rewritten, so it is the closest thing to the original left on the
     * record. Statuses that survived as an empty string go back to the column
     * default rather than staying invisible.
     */
    public static function maybe_repair_blanked_point_types()
    {
        if (get_option(self::POINT_TYPE_REPAIR_OPTION)) {
            return;
        }

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $table_exists = $wpdb->get_var(
            $wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->prefix . 'gameengine_point_types')
        );

        if ($table_exists) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("UPDATE {$wpdb->prefix}gameengine_point_types SET name = slug WHERE name = '' AND slug <> ''");

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("UPDATE {$wpdb->prefix}gameengine_point_types SET status = 'publish' WHERE status NOT IN ('publish', 'draft', 'pending', 'trash')");
        }

        update_option(self::POINT_TYPE_REPAIR_OPTION, 1, true);
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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $desc_col = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$ach_table} LIKE %s", 'description'));

        if (empty($desc_col)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("ALTER TABLE {$ach_table} ADD COLUMN description TEXT DEFAULT NULL AFTER congratulations_message");
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $slug_col = $wpdb->get_results($wpdb->prepare("SHOW COLUMNS FROM {$ach_table} LIKE %s", 'slug'));

        if (empty($slug_col)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("ALTER TABLE {$ach_table} ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER plural_name");
        }

        $this->backfill_achievement_slugs();
    }

    /**
     * Generate a unique slug for any pre-existing achievement row left over
     * from before the `slug` column existed.
     */
    private function backfill_achievement_slugs()
    {
        global $wpdb;
        $ach_table = "{$wpdb->prefix}gameengine_achievements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows = $wpdb->get_results("SELECT id, title FROM {$ach_table} WHERE slug IS NULL OR slug = ''", ARRAY_A);

        if (empty($rows)) {
            // Add the unique index now that every row has a slug (no-op if it already exists).
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $index = $wpdb->get_results($wpdb->prepare("SHOW INDEX FROM {$ach_table} WHERE Key_name = %s", 'slug'));
            if (empty($index)) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
                $wpdb->query("ALTER TABLE {$ach_table} ADD UNIQUE KEY slug (slug)");
            }
            return;
        }

        foreach ($rows as $row) {
            $base = sanitize_title($row['title']);
            if ('' === $base) {
                $base = 'achievement-' . $row['id'];
            }

            $slug = $base;
            $i    = 1;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$ach_table} WHERE slug = %s", $slug))) {
                $slug = $base . '-' . $i++;
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update($ach_table, array('slug' => $slug), array('id' => $row['id']));
        }
    }

    /**
     * Runs on deactivation.
     *
     * Tables and options are deliberately left in place so user progress
     * survives a deactivate/reactivate cycle. Only the scheduled events are
     * cleared, so nothing keeps firing once the plugin is off.
     */
    public function uninstall()
    {
        foreach ( array( 'gameengine_cleanup_logs_cron', 'gameengine_daily_inactivity_cron' ) as $hook ) {
            wp_clear_scheduled_hook( $hook );
        }
    }
}
