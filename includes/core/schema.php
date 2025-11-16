<?php

namespace Gamify\Core;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Defines the database schema for the Gamify plugin.
 * Centralizes all table structures for easier maintenance.
 */
final class Schema // 'final' keyword prevents this class from being extended
{
    /**
     * Get all table schemas.
     *
     * @return array An associative array of table schemas.
     */
    public static function get_tables()
    {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix;

        return [
            self::get_points_table_schema($prefix, $charset_collate),
            self::get_logs_table_schema($prefix, $charset_collate),
            self::get_point_types_table_schema($prefix, $charset_collate),
            self::get_triggers_table_schema($prefix, $charset_collate),
        ];
    }

    /**
     * Returns the schema for the 'gamify_points' table.
     */
    private static function get_points_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_points (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            points INT(11) NOT NULL,
            context VARCHAR(100) NOT NULL,
            reference_id BIGINT(20) UNSIGNED DEFAULT NULL,
            description TEXT,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) $charset_collate;";
    }

    /**
     * Returns the schema for the 'gamify_logs' table.
     */
    private static function get_logs_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_logs (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            trigger_key VARCHAR(255) NOT NULL,
            trigger_type ENUM('system','manual','schedule') NOT NULL,
            event_name VARCHAR(255) NOT NULL,
            status ENUM('success','failed','skipped') NOT NULL,
            message TEXT,
            reference_id BIGINT(20) UNSIGNED DEFAULT NULL,
            meta JSON,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY trigger_key (trigger_key)
        ) $charset_collate;";
    }

    /**
     * Returns the schema for the 'gamify_point_types' table.
     */
    private static function get_point_types_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_point_types (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            plural_name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY slug (slug)
        ) $charset_collate;";
    }

    /**
     * Returns the schema for the 'gamify_triggers' table.
     */
    private static function get_triggers_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_triggers (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            trigger_key VARCHAR(255) NOT NULL,
            points_to_award INT(11) NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            log_description VARCHAR(255) DEFAULT '',
            PRIMARY KEY (id),
            UNIQUE KEY trigger_key (trigger_key)
        ) $charset_collate;";
    }
}
