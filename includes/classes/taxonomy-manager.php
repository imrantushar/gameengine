<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class TaxonomyManager
 * Registers taxonomies for Achievements and Levels.
 */
class TaxonomyManager
{

    /**
     * Initialize the class.
     */
    public static function init()
    {
        self::register_gamify_taxonomies();
    }

    /**
     * Register taxonomies.
     */
    public static function register_gamify_taxonomies()
    {
        // 1. Achievement Types
        register_taxonomy(
            'achievement_type',
            array(),
            array(
                'hierarchical'      => true,
                'labels'            => array(
                    'name'          => __('Achievement Types', 'gamify'),
                    'singular_name' => __('Achievement Type', 'gamify'),
                ),
                'show_ui'           => true,
                'show_in_menu'      => false, // Hide from default WP sidebar
                'show_in_rest'      => true,
                'query_var'         => true,
                'rewrite'           => array('slug' => 'achievement-type'),
            )
        );

        // 2. Level Types
        register_taxonomy(
            'level_type',
            array(),
            array(
                'hierarchical'      => true,
                'labels'            => array(
                    'name'          => __('Level Types', 'gamify'),
                    'singular_name' => __('Level Type', 'gamify'),
                ),
                'show_ui'           => true,
                'show_in_menu'      => false, // Hide from default WP sidebar
                'show_in_rest'      => true,
                'query_var'         => true,
                'rewrite'           => array('slug' => 'level-type'),
            )
        );
    }
}
