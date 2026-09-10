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

        // Versioned like the REST board's key, so a points change clears both.
        // The front end used to lag the admin by up to five minutes.
        $cache_key = 'ge_front_lb_v' . \GameEngine\Helper::get_cache_version('leaderboard') . '_' . md5(wp_json_encode($args));
        $top_users = wp_cache_get($cache_key, 'gameengine');

        if (false === $top_users) {
            $top_users = $season_id > 0
                ? $this->get_season_rows($season_id, $limit)
                : \GameEngine\Classes\LeaderboardManager::get_rows(array(
                    'point_type_id' => absint($args['point_type']),
                    'start'         => \GameEngine\Classes\LeaderboardManager::resolve_range(sanitize_text_field($args['time_range']))['start'],
                    'end'           => null,
                    'limit'         => $limit,
                ));

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
     * Rows for a season.
     *
     * A completed season serves its frozen snapshot — that record is the whole
     * point of the feature and must never be recomputed. A season still running
     * is scored live against its own dates, so people can watch the race; it
     * used to render a blank board until someone captured it.
     *
     * @param int $season_id Season to render.
     * @param int $limit     Rows wanted.
     * @return array
     */
    private function get_season_rows($season_id, $limit)
    {
        global $wpdb;

        if (! class_exists('\\GameEngine\\Pro\\Pro_Init')) {
            return array();
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $season = $wpdb->get_row($wpdb->prepare(
            "SELECT start_date, end_date, status FROM {$wpdb->prefix}gameengine_pro_seasons WHERE id = %d",
            $season_id
        ), ARRAY_A);

        if (! $season) {
            return array();
        }

        if ('completed' === $season['status']) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            return $wpdb->get_results($wpdb->prepare(
                "SELECT sr.position, u.ID AS user_id, u.display_name AS name,
                        sr.total_points, NULL AS top_level, 0 AS achievements_count
                 FROM {$wpdb->prefix}gameengine_pro_season_rankings sr
                 INNER JOIN {$wpdb->users} u ON sr.user_id = u.ID
                 WHERE sr.season_id = %d AND sr.total_points > 0
                 ORDER BY sr.position ASC
                 LIMIT %d",
                $season_id,
                $limit
            ), ARRAY_A) ?: array();
        }

        return \GameEngine\Classes\LeaderboardManager::get_rows(
            \GameEngine\Classes\LeaderboardManager::season_window($season, array('limit' => $limit))
        );
    }

}
