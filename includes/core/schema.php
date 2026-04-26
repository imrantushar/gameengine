<?php

namespace GameEngine\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Schema
 * Defines the database table structures for the GameEngine plugin.
 */
final class Schema
{

    /**
     * Returns an array of SQL statements to create all plugin tables.
     *
     * @return array
     */
    public static function get_tables()
    {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix;

        return array(
            self::get_point_types_table_schema($prefix, $charset_collate),
            self::get_achievements_table_schema($prefix, $charset_collate),
            self::get_levels_table_schema($prefix, $charset_collate),
            self::get_requirements_table_schema($prefix, $charset_collate),
            self::get_requirement_progress_table_schema($prefix, $charset_collate),
            self::get_points_log_table_schema($prefix, $charset_collate),
            self::get_user_achievements_table_schema($prefix, $charset_collate),
            self::get_user_levels_table_schema($prefix, $charset_collate),
            self::get_logs_table_schema($prefix, $charset_collate),
        );
    }

    private static function get_point_types_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gameengine_point_types (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            plural_name VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'publish',
            slug VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY slug (slug)
        ) $charset_collate;";
    }

    private static function get_achievements_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gameengine_achievements (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            plural_name VARCHAR(255) DEFAULT NULL,
            status VARCHAR(20) DEFAULT 'publish',
            badge_image VARCHAR(255),
            category VARCHAR(255) DEFAULT NULL,
            congratulations_message TEXT DEFAULT NULL,
            secret_achievement TINYINT(1) DEFAULT 0,
            max_earnings_per_user INT(11) DEFAULT 0,
            unlock_with_points_enabled TINYINT(1) DEFAULT 0,
            is_restricted TINYINT(1) DEFAULT 0,
            required_point_type_id BIGINT(20) UNSIGNED DEFAULT NULL,
            required_points_amount INT(11) DEFAULT 0,
            required_achievement_id BIGINT(20) UNSIGNED DEFAULT NULL,
            required_level_id BIGINT(20) UNSIGNED DEFAULT NULL,
            restriction_message TEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY required_point_type_id (required_point_type_id),
            KEY required_achievement_id (required_achievement_id),
            KEY required_level_id (required_level_id)
        ) $charset_collate;";
    }

    private static function get_levels_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gameengine_levels (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            plural_name VARCHAR(255),
            status VARCHAR(20) DEFAULT 'publish',
            description TEXT,
            icon VARCHAR(255),
            category VARCHAR(255) DEFAULT NULL,
            priority INT(11) NOT NULL DEFAULT 0,
            unlock_with_points_enabled TINYINT(1) DEFAULT 0,
            is_restricted TINYINT(1) DEFAULT 0,
            point_type_id BIGINT(20) UNSIGNED DEFAULT NULL,
            min_points INT(11) DEFAULT 0,
            max_points INT(11) DEFAULT 0,
            congratulations_message TEXT DEFAULT NULL,
            required_achievement_id BIGINT(20) UNSIGNED DEFAULT NULL,
            required_level_id BIGINT(20) UNSIGNED DEFAULT NULL,
            restriction_message TEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY point_type_id (point_type_id),
            KEY required_achievement_id (required_achievement_id),
            KEY required_level_id (required_level_id)
        ) $charset_collate;";
    }

    private static function get_requirements_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gameengine_requirements (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            reward_type VARCHAR(50) NOT NULL,
            reward_id BIGINT(20) UNSIGNED NOT NULL,
            trigger_key VARCHAR(255) NOT NULL,
            action_type ENUM('award', 'deduct') NOT NULL DEFAULT 'award',
            parameters JSON,
            priority INT(11) NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY reward_lookup (reward_type, reward_id),
            KEY trigger_lookup (trigger_key)
        ) $charset_collate;";
    }

    private static function get_requirement_progress_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gameengine_requirement_progress (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            requirement_id BIGINT(20) UNSIGNED NOT NULL,
            progress_count INT(11) NOT NULL DEFAULT 0,
            last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_requirement (user_id, requirement_id)
        ) $charset_collate;";
    }

    private static function get_points_log_table_schema($prefix, $charset_collate)
    {
        return "CREATE TABLE {$prefix}gameengine_points_log (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            point_type_id BIGINT(20) UNSIGNED NOT NULL,
            points INT(11) NOT NULL,
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
        return "CREATE TABLE {$prefix}gameengine_user_achievements (
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
        return "CREATE TABLE {$prefix}gameengine_user_levels (
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
        return "CREATE TABLE {$prefix}gameengine_logs (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED DEFAULT NULL,
            trigger_key VARCHAR(255) NOT NULL,
            status ENUM('success','failed','skipped') NOT NULL,
            points_awarded INT(11) DEFAULT 0,
            message TEXT,
            meta JSON,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY trigger_key (trigger_key)
        ) $charset_collate;";
    }
}
