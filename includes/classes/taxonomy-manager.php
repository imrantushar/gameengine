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
     * Taxonomy registered for achievement categories.
     */
    const ACHIEVEMENT_TAXONOMY = 'gameengine_achievement_type';

    /**
     * Taxonomy registered for level categories.
     */
    const LEVEL_TAXONOMY = 'gameengine_level_type';

    /**
     * Slugs used before the taxonomies were prefixed, kept for the one-time
     * rename of terms created by earlier versions.
     */
    const LEGACY_TAXONOMIES = array(
        'achievement_type' => self::ACHIEVEMENT_TAXONOMY,
        'level_type'       => self::LEVEL_TAXONOMY,
    );

    /**
     * Option flagging that the legacy terms have been renamed.
     */
    const RENAME_OPTION = 'gameengine_taxonomies_prefixed';

    /**
     * Initialize the taxonomies.
     */
    public static function init()
    {
        self::maybe_rename_legacy_taxonomies();
        self::register_gameengine_taxonomies();
    }

    /**
     * Move terms created under the old, unprefixed slugs onto the prefixed ones.
     *
     * The slugs were generic enough for another plugin to claim, so they were
     * prefixed. Sites upgrading from an earlier version still hold their terms
     * under the old names, and this reassigns them once.
     */
    public static function maybe_rename_legacy_taxonomies()
    {
        if (get_option(self::RENAME_OPTION)) {
            return;
        }

        global $wpdb;

        foreach (self::LEGACY_TAXONOMIES as $legacy => $prefixed) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update(
                $wpdb->term_taxonomy,
                array('taxonomy' => $prefixed),
                array('taxonomy' => $legacy),
                array('%s'),
                array('%s')
            );
        }

        clean_taxonomy_cache(self::ACHIEVEMENT_TAXONOMY);
        clean_taxonomy_cache(self::LEVEL_TAXONOMY);

        update_option(self::RENAME_OPTION, 1, true);
    }

    /**
     * Register taxonomies without auto-syncing on every load.
     */
    public static function register_gameengine_taxonomies()
    {
        // Achievement Types
        register_taxonomy(
            self::ACHIEVEMENT_TAXONOMY,
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
            self::LEVEL_TAXONOMY,
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

        $sync_targets = array(
            array('table' => 'gameengine_achievements', 'tax' => self::ACHIEVEMENT_TAXONOMY),
            array('table' => 'gameengine_levels',       'tax' => self::LEVEL_TAXONOMY),
        );

        foreach ($sync_targets as $target) {
            $table_name = $target['table'];
            $taxonomy   = $target['tax'];

            $table_full = $wpdb->prefix . $table_name;
            $query      = "SELECT id, category FROM {$table_full}";

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $rows = $wpdb->get_results($query);

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

                            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                            $wpdb->update(
                                $table_full,
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
