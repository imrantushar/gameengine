<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class TaxonomyManager
 * Handles registration and data migration for Gamify taxonomies.
 */
class TaxonomyManager
{

    /**
     * Initialize the manager.
     */
    public static function init()
    {
        add_action('init', array(__CLASS__, 'register_gamify_taxonomies'));
    }

    /**
     * Register Achievement and Level taxonomies.
     */
    public static function register_gamify_taxonomies()
    {
        // Register Achievement Types.
        register_taxonomy(
            'achievement_type',
            array(),
            array(
                'hierarchical' => true,
                'labels'       => array('name' => __('Achievement Types', 'gamify')),
                'show_ui'      => true,
                'show_in_rest' => true,
            )
        );

        // Register Level Types.
        register_taxonomy(
            'level_type',
            array(),
            array(
                'hierarchical' => true,
                'labels'       => array('name' => __('Level Types', 'gamify')),
                'show_ui'      => true,
                'show_in_rest' => true,
            )
        );

        // Run the data migration for existing categories.
        self::migrate_legacy_categories();
    }

    /**
     * Migrates old string-based categories to new Taxonomy Term IDs.
     */
    private static function migrate_legacy_categories()
    {
        global $wpdb;

        $map = array(
            'gamify_achievements' => 'achievement_type',
            'gamify_levels'       => 'level_type',
        );

        foreach ($map as $table => $taxonomy) {
            $full_table = $wpdb->prefix . $table;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $items = $wpdb->get_results("SELECT id, category FROM $full_table");

            if (! empty($items)) {
                foreach ($items as $item) {
                    $raw_category = $item->category;

                    // If category is not numeric and not empty, it's a legacy string.
                    if (! is_numeric($raw_category) && ! empty($raw_category)) {

                        // Check if term already exists.
                        $term = term_exists($raw_category, $taxonomy);
                        if (! $term) {
                            // Insert as a new term if not found.
                            $term = wp_insert_term($raw_category, $taxonomy);
                        }

                        if (! is_wp_error($term) && isset($term['term_id'])) {
                            // Update the table to replace string name with Term ID.
                            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                            $wpdb->update(
                                $full_table,
                                array('category' => (string) $term['term_id']),
                                array('id' => $item->id),
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
