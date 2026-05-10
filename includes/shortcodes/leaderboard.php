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
                'season_id'  => 0,
            ),
            $atts
        );

        $limit     = absint($args['count']);
        $season_id = absint($args['season_id']);

        if ($limit <= 0) {
            $limit = 10;
        }

        $cache_key = 'ge_front_lb_' . md5(wp_json_encode($args));
        $top_users = wp_cache_get($cache_key, 'gameengine');

        if (false === $top_users) {
            global $wpdb;

            if ($season_id > 0 && class_exists('\GameEngine\Pro\Pro_Init')) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $top_users = $wpdb->get_results($wpdb->prepare(
                    "SELECT sr.position, u.ID AS user_id, u.display_name AS name,
                            sr.total_points, NULL AS top_level
                     FROM {$wpdb->prefix}gameengine_pro_season_rankings sr
                     INNER JOIN {$wpdb->users} u ON sr.user_id = u.ID
                     WHERE sr.season_id = %d
                     ORDER BY sr.position ASC
                     LIMIT %d",
                    $season_id,
                    $limit
                ), ARRAY_A);
            } else {
                $pt_id      = absint($args['point_type']);
                $time_range = sanitize_text_field($args['time_range']);
                $start_date = $this->get_start_date($time_range);

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
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
                        AND p.created_at >= %s
                        GROUP BY u.ID
                        ORDER BY total_points DESC
                        LIMIT %d",
                        $pt_id,
                        $pt_id,
                        $start_date,
                        $limit
                    ),
                    ARRAY_A
                );
            }

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

    /**
     * Convert a time_range slug into an SQL-ready start date string.
     *
     * @param string $range
     * @return string
     */
    private function get_start_date($range)
    {
        switch ($range) {
            case 'today':
                return gmdate('Y-m-d 00:00:00');
            case 'this_week':
            case 'weekly':
                return gmdate('Y-m-d 00:00:00', strtotime('monday this week'));
            case 'this_month':
            case 'monthly':
                return gmdate('Y-m-01 00:00:00');
            case 'this_year':
                return gmdate('Y-01-01 00:00:00');
            case 'last_30_days':
                return gmdate('Y-m-d 00:00:00', strtotime('-30 days'));
            default:
                return '1000-01-01 00:00:00';
        }
    }
}
