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
final class Schema
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
            // Resource Tables
            self::get_point_types_table_schema($prefix, $charset_collate),
            self::get_achievements_table_schema($prefix, $charset_collate),
            self::get_levels_table_schema($prefix, $charset_collate),

            // Engine Tables (Requirements & Logic)
            self::get_requirements_table_schema($prefix, $charset_collate),
            self::get_requirement_progress_table_schema($prefix, $charset_collate),

            // User Data & Log Tables
            self::get_points_log_table_schema($prefix, $charset_collate),
            self::get_user_achievements_table_schema($prefix, $charset_collate),
            self::get_user_levels_table_schema($prefix, $charset_collate), // New Table Added
            self::get_logs_table_schema($prefix, $charset_collate),
        ];
    }

    // --- RESOURCE TABLES ---

    private static function get_point_types_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_point_types (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            plural_name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY slug (slug)
        ) $charset_collate;";
    }

    private static function get_achievements_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_achievements (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            badge_image VARCHAR(255),
            secret_achievement TINYINT(1) DEFAULT 0, -- Updated based on new docs
            max_earnings_per_user INT(11) DEFAULT 0,
            unlock_with_points_enabled TINYINT(1) DEFAULT 0,
            required_point_type_id BIGINT(20) UNSIGNED DEFAULT NULL,
            required_points_amount INT(11) DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY required_point_type_id (required_point_type_id)
        ) $charset_collate;";
    }

    private static function get_levels_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_levels (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            icon VARCHAR(255),
            priority INT(11) NOT NULL DEFAULT 0, -- Added priority for sorting levels
            point_type_id BIGINT(20) UNSIGNED NOT NULL,
            min_points INT(11) NOT NULL DEFAULT 0,
            max_points INT(11) DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY point_type_id (point_type_id)
        ) $charset_collate;";
    }

    // --- ENGINE TABLES ---

    private static function get_requirements_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_requirements (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            reward_type VARCHAR(50) NOT NULL, -- 'point_type', 'achievement', 'level'
            reward_id BIGINT(20) UNSIGNED NOT NULL,
            trigger_key VARCHAR(255) NOT NULL,
            action_type ENUM('award', 'deduct') NOT NULL DEFAULT 'award', -- Added action_type
            parameters JSON,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY reward_lookup (reward_type, reward_id),
            KEY trigger_lookup (trigger_key)
        ) $charset_collate;";
    }

    private static function get_requirement_progress_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_requirement_progress (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            requirement_id BIGINT(20) UNSIGNED NOT NULL,
            progress_count INT(11) NOT NULL DEFAULT 0,
            last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_requirement (user_id, requirement_id)
        ) $charset_collate;";
    }

    // --- USER DATA & LOG TABLES ---

    private static function get_points_log_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_points_log (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            point_type_id BIGINT(20) UNSIGNED NOT NULL,
            points INT(11) NOT NULL, -- Can be negative for deductions
            context VARCHAR(100) NOT NULL,
            requirement_id BIGINT(20) UNSIGNED DEFAULT NULL,
            description TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY point_type_id (point_type_id)
        ) $charset_collate;";
    }

    private static function get_user_achievements_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_user_achievements (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            achievement_id BIGINT(20) UNSIGNED NOT NULL,
            achieved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY achievement_id (achievement_id)
        ) $charset_collate;";
    }

    private static function get_user_levels_table_schema($prefix, $charset_collate)
    {
        // New table to track current level for users
        return "CREATE TABLE {$prefix}gamify_user_levels (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            level_id BIGINT(20) UNSIGNED NOT NULL,
            achieved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY level_id (level_id)
        ) $charset_collate;";
    }

    private static function get_logs_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gamify_logs (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED DEFAULT NULL,
            event_name VARCHAR(255) NOT NULL,
            status ENUM('success','failed','skipped') NOT NULL,
            message TEXT,
            meta JSON,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) $charset_collate;";
    }
}
