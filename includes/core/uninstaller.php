<?php

namespace GameEngine\Core;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Removes GameEngine's data when the plugin is deleted — if, and only if, the
 * site owner switched on "Delete all data when GameEngine is deleted".
 *
 * Everything is found by GameEngine's own names: tables that start with this
 * site's prefix followed by gameengine_, options and meta keys that start with
 * gameengine_ or _gameengine_, the ge_badge post type and GameEngine's two
 * taxonomies. Anchoring on $wpdb->prefix matters: a database shared with
 * another WordPress install can hold that install's gameengine tables under a
 * different prefix, and those are not this site's to drop.
 *
 * GameEngine Pro keeps its data under the same names, so it goes too. The
 * exception is the WooCommerce coupons Pro's marketplace issued: they belong
 * to the members who received them and keep working without GameEngine.
 */
final class Uninstaller
{
    const SETTING = 'delete_data_on_uninstall';

    const TAXONOMIES = array('gameengine_achievement_type', 'gameengine_level_type');

    /**
     * Entry point for uninstall.php. On a network, each site decides for itself.
     */
    public static function run()
    {
        if (! is_multisite()) {
            self::run_for_site();
            return;
        }

        foreach (get_sites(array('fields' => 'ids', 'number' => 0)) as $site_id) {
            switch_to_blog($site_id);
            self::run_for_site();
            restore_current_blog();
        }
    }

    /**
     * Whether this site asked for its data to be removed.
     *
     * @return bool
     */
    public static function enabled()
    {
        $general = get_option('gameengine_general_settings', array());

        return is_array($general) && ! empty($general[self::SETTING]);
    }

    /**
     * Everything that would be removed from the current site, by exact name.
     * Nothing here deletes anything.
     *
     * @return array
     */
    public static function targets()
    {
        global $wpdb;

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $tables = $wpdb->get_col($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($wpdb->prefix . 'gameengine_') . '%'));

        $options = $wpdb->get_col($wpdb->prepare(
            "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s OR option_name LIKE %s",
            $wpdb->esc_like('gameengine_') . '%',
            $wpdb->esc_like('_transient_gameengine_') . '%',
            $wpdb->esc_like('_transient_timeout_gameengine_') . '%'
        ));

        $post_ids = array_map('intval', $wpdb->get_col(
            $wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_type = %s", 'ge_badge')
        ));

        $post_meta_keys = $wpdb->get_col($wpdb->prepare(
            "SELECT DISTINCT meta_key FROM {$wpdb->postmeta} WHERE meta_key LIKE %s OR meta_key LIKE %s",
            $wpdb->esc_like('_gameengine_') . '%',
            $wpdb->esc_like('_ge_badge_') . '%'
        ));

        $user_meta_keys = $wpdb->get_col($wpdb->prepare(
            "SELECT DISTINCT meta_key FROM {$wpdb->usermeta} WHERE meta_key LIKE %s OR meta_key LIKE %s",
            $wpdb->esc_like('gameengine_') . '%',
            $wpdb->esc_like('_gameengine_') . '%'
        ));
        // phpcs:enable

        $cron_hooks = array();
        foreach ((array) _get_cron_array() as $events) {
            foreach (array_keys((array) $events) as $hook) {
                if (0 === strpos($hook, 'gameengine_')) {
                    $cron_hooks[$hook] = true;
                }
            }
        }

        return array(
            'tables'         => $tables,
            'options'        => $options,
            'post_ids'       => $post_ids,
            'post_meta_keys' => $post_meta_keys,
            'user_meta_keys' => $user_meta_keys,
            'taxonomies'     => self::TAXONOMIES,
            'cron_hooks'     => array_keys($cron_hooks),
        );
    }

    /**
     * Removes the current site's data if the setting is on.
     */
    public static function run_for_site()
    {
        if (! self::enabled()) {
            return;
        }

        $targets = self::targets();

        self::clear_cron_hooks($targets['cron_hooks']);
        self::delete_posts($targets['post_ids']);
        self::delete_terms($targets['taxonomies']);
        self::delete_meta('post', $targets['post_meta_keys']);
        self::delete_meta('user', $targets['user_meta_keys']);
        self::drop_tables($targets['tables']);

        // Last, so the setting that allowed all of this is the final thing to go.
        self::delete_options($targets['options']);
    }

    private static function clear_cron_hooks(array $hooks)
    {
        foreach ($hooks as $hook) {
            wp_unschedule_hook($hook);
        }
    }

    private static function delete_posts(array $post_ids)
    {
        foreach ($post_ids as $post_id) {
            wp_delete_post((int) $post_id, true);
        }
    }

    /**
     * The taxonomies are not registered while a plugin is being deleted, so
     * wp_delete_term() cannot be used; the rows are removed directly.
     */
    private static function delete_terms(array $taxonomies)
    {
        global $wpdb;

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        foreach ($taxonomies as $taxonomy) {
            $rows = $wpdb->get_results($wpdb->prepare(
                "SELECT term_taxonomy_id, term_id FROM {$wpdb->term_taxonomy} WHERE taxonomy = %s",
                $taxonomy
            ));

            foreach ((array) $rows as $row) {
                $wpdb->delete($wpdb->term_relationships, array('term_taxonomy_id' => (int) $row->term_taxonomy_id));
                $wpdb->delete($wpdb->term_taxonomy, array('term_taxonomy_id' => (int) $row->term_taxonomy_id));

                $still_used = (int) $wpdb->get_var($wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->term_taxonomy} WHERE term_id = %d",
                    (int) $row->term_id
                ));

                if (! $still_used) {
                    $wpdb->delete($wpdb->terms, array('term_id' => (int) $row->term_id));
                    $wpdb->delete($wpdb->termmeta, array('term_id' => (int) $row->term_id));
                }
            }
        }
        // phpcs:enable
    }

    private static function delete_meta($type, array $keys)
    {
        foreach ($keys as $key) {
            delete_metadata($type, 0, $key, '', true);
        }
    }

    private static function drop_tables(array $tables)
    {
        global $wpdb;

        $prefix = $wpdb->prefix . 'gameengine_';

        foreach ($tables as $table) {
            // Refuse anything that is not this site's own GameEngine table.
            if (0 !== strpos($table, $prefix) || ! preg_match('/^[A-Za-z0-9_]+$/', $table)) {
                continue;
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query("DROP TABLE IF EXISTS `{$table}`");
        }
    }

    private static function delete_options(array $options)
    {
        foreach ($options as $option) {
            delete_option($option);
        }
    }
}
