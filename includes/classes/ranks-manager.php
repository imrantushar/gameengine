<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manages rank progression and assignment.
 */
class RanksManager
{

    public static function init()
    {
        $self = new self();
        add_action('gameengine_points_added', array($self, 'on_points_changed'), 10, 5);
        add_action('gameengine_points_deducted', array($self, 'on_points_changed'), 10, 5);
        add_action('gameengine_rank_achieved', array($self, 'create_rank_notification'), 10, 2);
    }

    /**
     * Called after any points change to re-evaluate rank.
     */
    public function on_points_changed($user_id, $points, $context, $log_id, $point_type_id)
    {
        $this->assign_rank((int) $user_id);
    }

    /**
     * Get all ranks ordered by points_required ascending.
     */
    public static function get_all(): array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}gameengine_ranks WHERE status = 'publish' ORDER BY points_required ASC",
            ARRAY_A
        ) ?: array();
    }

    /**
     * Get a single rank by ID.
     */
    public static function get_by_id(int $id): ?array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_ranks WHERE id = %d",
            $id
        ), ARRAY_A);
        return $row ?: null;
    }

    /**
     * Get the current (highest) rank for a user.
     */
    public static function get_user_rank(int $user_id): ?array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT r.* FROM {$wpdb->prefix}gameengine_ranks r
             INNER JOIN {$wpdb->prefix}gameengine_user_ranks ur ON r.id = ur.rank_id
             WHERE ur.user_id = %d
             ORDER BY r.points_required DESC
             LIMIT 1",
            $user_id
        ), ARRAY_A);
        return $row ?: null;
    }

    /**
     * Assign eligible ranks to the user based on their grand total points.
     * Ranks are permanent — never removed.
     */
    public function assign_rank(int $user_id): void
    {
        $points_manager = new PointsManager();
        $grand_total    = $points_manager->get_grand_total($user_id);

        $ranks = self::get_all();

        foreach ($ranks as $rank) {
            if ($grand_total >= (int) $rank['points_required']) {
                $this->maybe_award_rank($user_id, (int) $rank['id']);
            }
        }
    }

    /**
     * Award rank if not already earned.
     */
    private function maybe_award_rank(int $user_id, int $rank_id): void
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gameengine_user_ranks WHERE user_id = %d AND rank_id = %d",
            $user_id,
            $rank_id
        ));

        if ($exists) {
            return;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->insert(
            $wpdb->prefix . 'gameengine_user_ranks',
            array(
                'user_id'     => $user_id,
                'rank_id'     => $rank_id,
                'achieved_at' => current_time('mysql'),
            ),
            array('%d', '%d', '%s')
        );

        do_action('gameengine_rank_achieved', $user_id, $rank_id);
    }

    /**
     * Create a notification when a rank is achieved.
     */
    public function create_rank_notification(int $user_id, int $rank_id): void
    {
        $rank = self::get_by_id($rank_id);
        if (!$rank) {
            return;
        }

        if (class_exists('\GameEngine\Classes\NotificationManager')) {
            $message = sprintf(
                /* translators: %s: rank title */
                __('You achieved the rank: %s', 'gameengine'),
                $rank['title']
            );
            NotificationManager::add($user_id, 'rank', $message);
        }
    }

    /**
     * Reset user ranks (admin action).
     */
    public static function reset_user_rank(int $user_id): void
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete($wpdb->prefix . 'gameengine_user_ranks', array('user_id' => $user_id), array('%d'));
    }

    /**
     * Get count of users who have earned a given rank.
     */
    public static function get_user_count(int $rank_id): int
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_user_ranks WHERE rank_id = %d",
            $rank_id
        ));
    }

    /**
     * Create a new rank.
     */
    public static function create(array $data): int
    {
        global $wpdb;

        $slug = sanitize_title($data['title'] ?? '');
        $slug = self::unique_slug($slug);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->insert(
            $wpdb->prefix . 'gameengine_ranks',
            array(
                'title'           => sanitize_text_field($data['title'] ?? ''),
                'slug'            => $slug,
                'description'     => sanitize_textarea_field($data['description'] ?? ''),
                'icon'            => sanitize_text_field($data['icon'] ?? ''),
                'color'           => sanitize_hex_color($data['color'] ?? '') ?: '#6c5ce7',
                'points_required' => absint($data['points_required'] ?? 0),
                'status'          => 'publish',
                'created_at'      => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s')
        );

        return (int) $wpdb->insert_id;
    }

    /**
     * Update a rank.
     */
    public static function update(int $id, array $data): bool
    {
        global $wpdb;

        $update = array();
        if (isset($data['title'])) {
            $update['title'] = sanitize_text_field($data['title']);
        }
        if (isset($data['description'])) {
            $update['description'] = sanitize_textarea_field($data['description']);
        }
        if (isset($data['icon'])) {
            $update['icon'] = sanitize_text_field($data['icon']);
        }
        if (isset($data['color'])) {
            $update['color'] = sanitize_hex_color($data['color']) ?: '#6c5ce7';
        }
        if (isset($data['points_required'])) {
            $update['points_required'] = absint($data['points_required']);
        }
        if (isset($data['status'])) {
            $update['status'] = sanitize_key($data['status']);
        }

        if (empty($update)) {
            return false;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (bool) $wpdb->update(
            $wpdb->prefix . 'gameengine_ranks',
            $update,
            array('id' => $id),
            null,
            array('%d')
        );
    }

    /**
     * Delete a rank.
     */
    public static function delete(int $id): bool
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete($wpdb->prefix . 'gameengine_user_ranks', array('rank_id' => $id), array('%d'));
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (bool) $wpdb->delete($wpdb->prefix . 'gameengine_ranks', array('id' => $id), array('%d'));
    }

    private static function unique_slug(string $base): string
    {
        global $wpdb;
        $slug = $base;
        $i    = 1;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_ranks WHERE slug = %s", $slug))) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
