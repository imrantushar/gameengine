<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class TaxonomyManager
 * Handles registration for GameEngine taxonomies.
 */
class TaxonomyManager
{

    /**
     * Initialize the taxonomies.
     */
    public static function init()
    {
        self::register_gameengine_taxonomies();
    }

    /**
     * Register taxonomies without auto-syncing on every load.
     */
    public static function register_gameengine_taxonomies()
    {
        // Achievement Types
        register_taxonomy(
            'achievement_type',
            array(),
            array(
                'hierarchical' => true,
                'labels'       => array('name' => __('Achievement Types', 'gameengine')),
                'show_ui'      => true,
                'show_in_rest' => true,
            )
        );

        // Level Types
        register_taxonomy(
            'level_type',
            array(),
            array(
                'hierarchical' => true,
                'labels'       => array('name' => __('Level Types', 'gameengine')),
                'show_ui'      => true,
                'show_in_rest' => true,
            )
        );
    }

    /**
     * This should only be called during plugin activation or migration.
     * 
     * It syncs existing string-based categories into official WordPress taxonomies.
     */
    public static function sync_existing_categories()
    {
        global $wpdb;

        $tables = array(
            'gameengine_achievements' => 'achievement_type',
            'gameengine_levels'       => 'level_type',
        );

        foreach ($tables as $table_name => $taxonomy) {

            /**
             * Since table names cannot be prepared via %s, we must interpolate it.
             */
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
            $rows = $wpdb->get_results("SELECT id, category FROM {$wpdb->prefix}{$table_name}");

            if (! empty($rows)) {
                foreach ($rows as $row) {
                    // Only sync if category is a string name, not an ID.
                    if (! is_numeric($row->category) && ! empty($row->category)) {

                        $term_name = sanitize_text_field($row->category);
                        $term      = term_exists($term_name, $taxonomy);

                        if (! $term) {
                            $term = wp_insert_term($term_name, $taxonomy);
                        }

                        if (! is_wp_error($term) && isset($term['term_id'])) {

                            $term_id = (int) $term['term_id'];

                            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter
                            $wpdb->update(
                                "{$wpdb->prefix}{$table_name}",
                                array('category' => (string) $term_id),
                                array('id' => absint($row->id)),
                                array('%s'),
                                array('%d')
                            );
                        }
                    }
                }
            }
        }
    }
}
