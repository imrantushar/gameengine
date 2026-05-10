<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manages streak tracking and milestone bonuses.
 */
class StreaksManager
{

    public static function init()
    {
        $self = new self();
        $self->register_hooks();
    }

    /**
     * Dynamically register WordPress hooks for each active streak.
     */
    public function register_hooks(): void
    {
        $streaks = self::get_active_streaks();

        foreach ($streaks as $streak) {
            $hook     = sanitize_key($streak['trigger_hook']);
            $streak_id = (int) $streak['id'];

            if (empty($hook)) {
                continue;
            }

            add_action($hook, function () use ($streak_id) {
                $user_id = get_current_user_id();
                if ($user_id > 0) {
                    ( new self() )->track_action($user_id, $streak_id);
                }
            }, 10, 0);
        }
    }

    /**
     * Track a streak action for a user.
     */
    public function track_action(int $user_id, int $streak_id): void
    {
        global $wpdb;

        $streak = self::get_by_id($streak_id);
        if (!$streak) {
            return;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $user_streak = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_user_streaks WHERE user_id = %d AND streak_id = %d",
            $user_id,
            $streak_id
        ), ARRAY_A);

        $now              = current_time('mysql');
        $interval_seconds = $streak['interval_type'] === 'weekly' ? WEEK_IN_SECONDS : DAY_IN_SECONDS;

        if ($user_streak) {
            $last_action = strtotime($user_streak['last_action_at']);
            $elapsed     = time() - $last_action;

            if ($elapsed < $interval_seconds) {
                return;
            }

            if ($elapsed < $interval_seconds * 2) {
                $new_count = (int) $user_streak['current_count'] + 1;
                $longest   = max($new_count, (int) $user_streak['longest_count']);
            } else {
                $prev_count = (int) $user_streak['current_count'];
                $new_count  = 1;
                $longest    = (int) $user_streak['longest_count'];
                do_action('gameengine_streak_broken', $user_id, $streak_id, $prev_count);
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update(
                $wpdb->prefix . 'gameengine_user_streaks',
                array(
                    'current_count'  => $new_count,
                    'longest_count'  => $longest,
                    'last_action_at' => $now,
                ),
                array('user_id' => $user_id, 'streak_id' => $streak_id),
                array('%d', '%d', '%s'),
                array('%d', '%d')
            );
        } else {
            $new_count = 1;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->insert(
                $wpdb->prefix . 'gameengine_user_streaks',
                array(
                    'user_id'        => $user_id,
                    'streak_id'      => $streak_id,
                    'current_count'  => 1,
                    'longest_count'  => 1,
                    'last_action_at' => $now,
                    'created_at'     => $now,
                ),
                array('%d', '%d', '%d', '%d', '%s', '%s')
            );
        }

        $this->maybe_award_milestone($user_id, $streak, $new_count);
    }

    /**
     * Award bonus points when a milestone is reached.
     */
    private function maybe_award_milestone(int $user_id, array $streak, int $count): void
    {
        $milestone = (int) $streak['milestone_at'];
        if ($milestone <= 0 || $count % $milestone !== 0) {
            return;
        }

        $bonus_points    = (int) $streak['bonus_points'];
        $bonus_pt_id     = (int) $streak['bonus_point_type_id'];

        if ($bonus_points > 0) {
            $pm = new PointsManager();
            $pm->add($user_id, $bonus_points, 'streak_milestone', array(
                'point_type_id' => $bonus_pt_id ?: 1,
                'description'   => sprintf(
                    /* translators: 1: streak title, 2: count */
                    __('%1$s streak milestone: %2$d days!', 'gameengine'),
                    $streak['title'],
                    $count
                ),
            ));
        }

        if (class_exists('\GameEngine\Classes\NotificationManager')) {
            $message = sprintf(
                /* translators: 1: count, 2: streak title */
                __('Amazing! %1$d day %2$s streak milestone reached!', 'gameengine'),
                $count,
                $streak['title']
            );
            NotificationManager::add($user_id, 'streak', $message);
        }
    }

    /**
     * Reset broken streaks (called by daily cron).
     * Marks any streak where last_action_at is older than 2 intervals as broken.
     */
    public static function reset_broken_streaks(): void
    {
        global $wpdb;

        $streaks = self::get_active_streaks();

        foreach ($streaks as $streak) {
            $interval_seconds = $streak['interval_type'] === 'weekly' ? WEEK_IN_SECONDS : DAY_IN_SECONDS;
            $threshold_dt     = gmdate('Y-m-d H:i:s', time() - ($interval_seconds * 2));

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $broken_users = $wpdb->get_results($wpdb->prepare(
                "SELECT user_id, current_count FROM {$wpdb->prefix}gameengine_user_streaks
                 WHERE streak_id = %d AND current_count > 0 AND last_action_at < %s",
                $streak['id'],
                $threshold_dt
            ), ARRAY_A);

            foreach ($broken_users as $row) {
                do_action('gameengine_streak_broken', (int) $row['user_id'], (int) $streak['id'], (int) $row['current_count']);

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->update(
                    $wpdb->prefix . 'gameengine_user_streaks',
                    array('current_count' => 0),
                    array('user_id' => (int) $row['user_id'], 'streak_id' => (int) $streak['id']),
                    array('%d'),
                    array('%d', '%d')
                );
            }
        }
    }

    /**
     * Get all active streaks.
     */
    public static function get_active_streaks(): array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}gameengine_streaks WHERE status = 'publish'",
            ARRAY_A
        ) ?: array();
    }

    /**
     * Get all streaks (for admin).
     */
    public static function get_all(): array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}gameengine_streaks ORDER BY id DESC",
            ARRAY_A
        ) ?: array();
    }

    /**
     * Get a streak by ID.
     */
    public static function get_by_id(int $id): ?array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_streaks WHERE id = %d",
            $id
        ), ARRAY_A);
        return $row ?: null;
    }

    /**
     * Get user streaks with streak info.
     */
    public static function get_user_streaks(int $user_id): array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_results($wpdb->prepare(
            "SELECT s.title, s.milestone_at, s.interval_type,
                    us.current_count, us.longest_count, us.last_action_at
             FROM {$wpdb->prefix}gameengine_user_streaks us
             JOIN {$wpdb->prefix}gameengine_streaks s ON us.streak_id = s.id
             WHERE us.user_id = %d AND s.status = 'publish'",
            $user_id
        ), ARRAY_A) ?: array();
    }

    /**
     * Create a streak.
     */
    public static function create(array $data): int
    {
        global $wpdb;
        $slug = sanitize_title($data['title'] ?? '');
        $slug = self::unique_slug($slug);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->insert(
            $wpdb->prefix . 'gameengine_streaks',
            array(
                'title'               => sanitize_text_field($data['title'] ?? ''),
                'slug'                => $slug,
                'trigger_hook'        => sanitize_key($data['trigger_hook'] ?? ''),
                'interval_type'       => in_array($data['interval_type'] ?? '', array('daily', 'weekly'), true) ? $data['interval_type'] : 'daily',
                'bonus_points'        => absint($data['bonus_points'] ?? 0),
                'bonus_point_type_id' => !empty($data['bonus_point_type_id']) ? absint($data['bonus_point_type_id']) : null,
                'milestone_at'        => absint($data['milestone_at'] ?? 7),
                'status'              => 'publish',
                'created_at'          => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s')
        );

        return (int) $wpdb->insert_id;
    }

    /**
     * Update a streak.
     */
    public static function update(int $id, array $data): bool
    {
        global $wpdb;
        $update = array();

        if (isset($data['title'])) $update['title'] = sanitize_text_field($data['title']);
        if (isset($data['trigger_hook'])) $update['trigger_hook'] = sanitize_key($data['trigger_hook']);
        if (isset($data['interval_type']) && in_array($data['interval_type'], array('daily', 'weekly'), true)) {
            $update['interval_type'] = $data['interval_type'];
        }
        if (isset($data['bonus_points'])) $update['bonus_points'] = absint($data['bonus_points']);
        if (isset($data['bonus_point_type_id'])) $update['bonus_point_type_id'] = absint($data['bonus_point_type_id']);
        if (isset($data['milestone_at'])) $update['milestone_at'] = absint($data['milestone_at']);
        if (isset($data['status'])) $update['status'] = sanitize_key($data['status']);

        if (empty($update)) return false;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (bool) $wpdb->update($wpdb->prefix . 'gameengine_streaks', $update, array('id' => $id), null, array('%d'));
    }

    /**
     * Delete a streak and its user records.
     */
    public static function delete(int $id): bool
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete($wpdb->prefix . 'gameengine_user_streaks', array('streak_id' => $id), array('%d'));
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return (bool) $wpdb->delete($wpdb->prefix . 'gameengine_streaks', array('id' => $id), array('%d'));
    }

    private static function unique_slug(string $base): string
    {
        global $wpdb;
        $slug = $base;
        $i    = 1;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_streaks WHERE slug = %s", $slug))) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
