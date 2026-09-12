<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\LeaderboardManager;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class LeaderboardController
 * Handles API requests for leaderboard data.
 */
class LeaderboardController extends BaseController
{

    /**
     * REST base slug.
     *
     * @var string
     */
    protected $rest_base = 'leaderboard';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_leaderboard'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Retrieve leaderboard data with filtering and pagination.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
     */
    public function get_leaderboard(\WP_REST_Request $request)
    {
        // Sanitize Inputs.
        $point_type_id = $request->get_param('point_type') ? absint($request->get_param('point_type')) : 0;
        $time_range    = sanitize_text_field($request->get_param('time_range'));
        $per_page      = min(100, max(1, $request->get_param('per_page') ? absint($request->get_param('per_page')) : 10));
        $page          = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset        = ($page - 1) * $per_page;

        //  Cache Logic.
        $version     = \GameEngine\Helper::get_cache_version('leaderboard');
        $cache_key   = 'gameengine_leaderboard_v' . $version . '_' . md5($point_type_id . $time_range . $per_page . $page);
        $cached_data = wp_cache_get($cache_key, 'gameengine_leaderboard');

        $range = LeaderboardManager::resolve_range($time_range);

        $query_args = array(
            'point_type_id' => $point_type_id,
            'start'         => $range['start'],
            'end'           => $range['end'],
            'limit'         => $per_page,
            'offset'        => $offset,
        );

        // The viewer's own standing is per-user and the cache key is not, so it
        // is worked out on both paths instead of being dropped on a hit.
        $own                   = LeaderboardManager::get_user_position(get_current_user_id(), $query_args);
        $current_user_position = $own ? $own['position'] : null;

        if (false !== $cached_data) {
            $response = new \WP_REST_Response($cached_data['results'], 200);
            $response->header('X-WP-Total', $cached_data['total']);
            $response->header('X-WP-TotalPages', $cached_data['pages']);
            if (null !== $current_user_position) {
                $response->header('X-GE-Current-User-Rank', $current_user_position);
            }

            return $response;
        }

        $results = LeaderboardManager::get_rows($query_args);
        $results = apply_filters('gameengine_leaderboard_results', $results, $request);

        // Formatting Output.
        foreach ($results as &$row) {
            $row['rank']               = '#' . $row['position'];
            $row['total_points']       = esc_html(number_format_i18n($row['total_points']));
            $row['achievements_count'] = esc_html(number_format_i18n($row['achievements_count']));
            $row['top_level']          = $row['top_level'] ? esc_html($row['top_level']) : '-';
        }
        unset($row);

        $total_items = LeaderboardManager::count_rows($query_args);
        $total_pages = (int) ceil($total_items / $per_page);

        // Store Cache.
        $cache_to_save = array(
            'results' => $results,
            'total'   => $total_items,
            'pages'   => $total_pages,
        );
        wp_cache_set($cache_key, $cache_to_save, 'gameengine_leaderboard', 300);

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);
        if (null !== $current_user_position) {
            $response->header('X-GE-Current-User-Rank', $current_user_position);
        }

        return $response;
    }

}
