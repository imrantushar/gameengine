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
        $ach_table = "{$wpdb->prefix}gamify_achievements";
        if ($wpdb->get_var("SHOW TABLES LIKE '$ach_table'") === $ach_table) {
            $ach_cats = $wpdb->get_col("SELECT DISTINCT category FROM $ach_table WHERE category IS NOT NULL AND category != ''");
            foreach ((array) $ach_cats as $cat) {
                if (! term_exists($cat, 'achievement_type')) {
                    wp_insert_term($cat, 'achievement_type');
                }
            }
        }
    }
}
