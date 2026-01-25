<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

class TaxonomyManager
{

    /**
     * 
     */
    public static function init()
    {
        self::register_gamify_taxonomies();
    }

    public static function register_gamify_taxonomies()
    {
        // Achievement Types
        register_taxonomy('achievement_type', array(), array(
            'hierarchical' => true,
            'labels'       => array('name' => __('Achievement Types', 'gamify')),
            'show_ui'      => true,
            'show_in_rest' => true,
        ));

        // Level Types
        register_taxonomy('level_type', array(), array(
            'hierarchical' => true,
            'labels'       => array('name' => __('Level Types', 'gamify')),
            'show_ui'      => true,
            'show_in_rest' => true,
        ));

        self::sync_existing_categories();
    }

    private static function sync_existing_categories()
    {
        global $wpdb;

        // Build table name safely (prefix is trusted from WP config, but still treat as identifier).
        $ach_table = $wpdb->prefix . 'gamify_achievements';

        // Cache keys.
        $cache_group   = 'gamify';
        $exists_key    = 'gf_tbl_exists_' . md5($ach_table);
        $cats_cachekey = 'gf_ach_cats_' . md5($ach_table);

        // Check table exists (cached).
        $table_exists = wp_cache_get($exists_key, $cache_group);
        if (false === $table_exists) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $found = $wpdb->get_var(
                $wpdb->prepare(
                    'SHOW TABLES LIKE %s',
                    $ach_table
                )
            );

            $table_exists = ($found === $ach_table);
            wp_cache_set($exists_key, $table_exists, $cache_group, 300);
        }

        if (! $table_exists) {
            return;
        }

        // Fetch distinct categories (cached).
        $ach_cats = wp_cache_get($cats_cachekey, $cache_group);
        if (false === $ach_cats) {

            // Build a safe table identifier (cannot be prepared with %s).
            $prefix    = esc_sql($wpdb->prefix);
            $table     = $prefix . 'gamify_achievements';

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $ach_cats = $wpdb->get_col(
                "SELECT DISTINCT category
         FROM {$table}
         WHERE category IS NOT NULL AND category <> ''"
            );

            wp_cache_set($cats_cachekey, $ach_cats, $cache_group, 300);
        }

        foreach ((array) $ach_cats as $cat) {
            $cat = sanitize_text_field($cat);

            if ('' === $cat) {
                continue;
            }

            if (! term_exists($cat, 'achievement_type')) {
                wp_insert_term($cat, 'achievement_type');
            }
        }
    }
}
