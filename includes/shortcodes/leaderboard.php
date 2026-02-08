<?php

namespace GameEngine\Shortcodes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Leaderboard
 * Handles the [gameengine_leaderboard] shortcode.
 */
class Leaderboard
{

    /**
     * Leaderboard constructor.
     */
    public function __construct()
    {
        add_shortcode('gameengine_leaderboard', array($this, 'render_view'));
    }

    /**
     * Renders the leaderboard view.
     *
     * @param array $atts Shortcode attributes.
     * @return string HTML output.
     */
    public function render_view($atts)
    {

        $args = shortcode_atts(
            array(
                'count'      => 10,
                'point_type' => 0,
                'time_range' => 'all_time',
            ),
            $atts
        );

        $limit = absint($args['count']);
        if ($limit <= 0) {
            $limit = 10;
        }

        $pt_id = absint($args['point_type']);

        $cache_key = 'ge_front_lb_' . md5(wp_json_encode($args));
        $top_users = wp_cache_get($cache_key, 'gameengine');

        if (false === $top_users) {
            global $wpdb;

            /**
             * Fix: Moved the entire SQL string directly inside $wpdb->prepare().
             * Added appropriate ignore tags for table prefix interpolation.
             */
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $top_users = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT
                        u.ID AS user_id,
                        u.display_name AS name,
                        IFNULL(SUM(p.points), 0) AS total_points,
                        (
                            SELECT l.title
                            FROM {$wpdb->prefix}gameengine_user_levels ul
                            JOIN {$wpdb->prefix}gameengine_levels l
                                ON ul.level_id = l.id
                            WHERE ul.user_id = u.ID
                            ORDER BY l.priority DESC
                            LIMIT 1
                        ) AS top_level
                    FROM {$wpdb->users} u
                    JOIN {$wpdb->prefix}gameengine_points_log p
                        ON u.ID = p.user_id
                    WHERE p.points > 0
                    AND ( %d = 0 OR p.point_type_id = %d )
                    GROUP BY u.ID
                    ORDER BY total_points DESC
                    LIMIT %d",
                    $pt_id,
                    $pt_id,
                    $limit
                ),
                ARRAY_A
            );

            if (! is_array($top_users)) {
                $top_users = array();
            }

            wp_cache_set($cache_key, $top_users, 'gameengine', 300);
        }

        ob_start();
        \GameEngine\Helper::get_template(
            'shortcode/leaderboard.php',
            array(
                'users' => $top_users,
            )
        );

        return apply_filters(
            'gameengine/templates/shortcode/leaderboard',
            ob_get_clean()
        );
    }
}
