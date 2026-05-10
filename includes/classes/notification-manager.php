<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manages persistent user notifications stored in the DB.
 */
class NotificationManager
{

    public static function init()
    {
        $self = new self();
        add_action('gameengine_points_added', array($self, 'on_points_added'), 20, 5);
        add_action('gameengine_points_deducted', array($self, 'on_points_deducted'), 20, 5);
        add_action('gameengine_achievement_unlocked', array($self, 'on_achievement_unlocked'), 10, 2);
        add_action('gameengine_level_up', array($self, 'on_level_up'), 10, 2);
        add_action('gameengine_rank_achieved', array($self, 'on_rank_achieved'), 20, 2);
    }

    /**
     * Insert a notification record.
     */
    public static function add(int $user_id, string $type, string $message): bool
    {
        if (!self::is_enabled($type)) {
            return false;
        }

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $result = $wpdb->insert(
            $wpdb->prefix . 'gameengine_notifications',
            array(
                'user_id'    => $user_id,
                'type'       => sanitize_key($type),
                'message'    => sanitize_text_field($message),
                'is_read'    => 0,
                'created_at' => current_time('mysql'),
            ),
            array('%d', '%s', '%s', '%d', '%s')
        );

        return (bool) $result;
    }

    /**
     * Get notifications for a user.
     */
    public static function get_for_user(int $user_id, int $limit = 20, int $page = 1): array
    {
        global $wpdb;
        $offset = ($page - 1) * $limit;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_notifications
             WHERE user_id = %d
             ORDER BY created_at DESC
             LIMIT %d OFFSET %d",
            $user_id,
            $limit,
            $offset
        ), ARRAY_A) ?: array();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_notifications WHERE user_id = %d",
            $user_id
        ));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $unread = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_notifications WHERE user_id = %d AND is_read = 0",
            $user_id
        ));

        return array(
            'items'  => $items,
            'total'  => $total,
            'unread' => $unread,
        );
    }

    /**
     * Mark a single notification as read.
     */
    public static function mark_read(int $id, int $user_id): bool
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (bool) $wpdb->update(
            $wpdb->prefix . 'gameengine_notifications',
            array('is_read' => 1),
            array('id' => $id, 'user_id' => $user_id),
            array('%d'),
            array('%d', '%d')
        );
    }

    /**
     * Mark all notifications as read for a user.
     */
    public static function mark_all_read(int $user_id): bool
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (bool) $wpdb->update(
            $wpdb->prefix . 'gameengine_notifications',
            array('is_read' => 1),
            array('user_id' => $user_id),
            array('%d'),
            array('%d')
        );
    }

    /**
     * Delete notifications older than $days days.
     */
    public static function cleanup(int $days = 90): void
    {
        if ($days <= 0) {
            return;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->prefix}gameengine_notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $days
        ));
    }

    public function on_points_added($user_id, $points, $context, $log_id, $point_type_id): void
    {
        $message = sprintf(
            /* translators: %d: points awarded */
            __('You earned %d points!', 'gameengine'),
            $points
        );
        self::add((int) $user_id, 'points', $message);
    }

    public function on_points_deducted($user_id, $points, $context, $log_id, $point_type_id): void
    {
        $message = sprintf(
            /* translators: %d: points deducted */
            __('%d points were deducted from your balance.', 'gameengine'),
            $points
        );
        self::add((int) $user_id, 'points', $message);
    }

    public function on_achievement_unlocked($user_id, $achievement_id): void
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $title = $wpdb->get_var($wpdb->prepare(
            "SELECT title FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d",
            $achievement_id
        ));
        if (!$title) {
            return;
        }
        $message = sprintf(
            /* translators: %s: achievement title */
            __('Achievement unlocked: %s', 'gameengine'),
            $title
        );
        self::add((int) $user_id, 'achievement', $message);
    }

    public function on_level_up($user_id, $level_id): void
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $title = $wpdb->get_var($wpdb->prepare(
            "SELECT title FROM {$wpdb->prefix}gameengine_levels WHERE id = %d",
            $level_id
        ));
        if (!$title) {
            return;
        }
        $message = sprintf(
            /* translators: %s: level title */
            __('You reached a new level: %s', 'gameengine'),
            $title
        );
        self::add((int) $user_id, 'level', $message);
    }

    public function on_rank_achieved($user_id, $rank_id): void
    {
        $rank = RanksManager::get_by_id((int) $rank_id);
        if (!$rank) {
            return;
        }
        $message = sprintf(
            /* translators: %s: rank title */
            __('You achieved the rank: %s', 'gameengine'),
            $rank['title']
        );
        self::add((int) $user_id, 'rank', $message);
    }

    /**
     * Check if notifications of this type are enabled in settings.
     */
    private static function is_enabled(string $type): bool
    {
        $settings = get_option('gameengine_notification_settings', array());
        $key      = 'enable_' . $type . '_notifications';
        return isset($settings[$key]) ? (bool) $settings[$key] : true;
    }
}
