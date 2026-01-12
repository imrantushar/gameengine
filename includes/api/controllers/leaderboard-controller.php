<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

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
        global $wpdb;

        // Sanitize Inputs.
        $point_type_id = $request->get_param('point_type') ? absint($request->get_param('point_type')) : 0;
        $time_range    = sanitize_text_field($request->get_param('time_range'));
        $per_page      = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 10;
        $page          = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset        = ($page - 1) * $per_page;

        //  Cache Logic.
        $cache_key   = 'gamify_leaderboard_' . md5($point_type_id . $time_range . $per_page . $page);
        $cached_data = wp_cache_get($cache_key, 'gamify_leaderboard');

        if (false !== $cached_data) {
            return new \WP_REST_Response(
                $cached_data['results'],
                200,
                array(
                    'X-WP-Total'      => $cached_data['total'],
                    'X-WP-TotalPages' => $cached_data['pages'],
                )
            );
        }

        // Prepare Date and Logic Arguments.
        $date_query = $this->get_date_query($time_range);
        $start_date = $date_query ? $date_query : '1000-01-01 00:00:00';

        // Main Query (Optimized for standard compliance).
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    u.ID as user_id,
                    u.display_name as name,
                    IFNULL(SUM(p.points), 0) as total_points,
                    (SELECT COUNT(*) FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = u.ID) as achievements_count,
                    (
                        SELECT l.title FROM {$wpdb->prefix}gamify_user_levels ul 
                        JOIN {$wpdb->prefix}gamify_levels l ON ul.level_id = l.id 
                        WHERE ul.user_id = u.ID ORDER BY l.priority DESC LIMIT 1
                    ) as top_level
                FROM {$wpdb->users} u
                LEFT JOIN {$wpdb->prefix}gamify_points_log p ON u.ID = p.user_id
                WHERE p.points > 0 
                AND ( p.point_type_id = %d OR 0 = %d ) 
                AND p.created_at >= %s
                GROUP BY u.ID
                ORDER BY total_points DESC
                LIMIT %d OFFSET %d",
                $point_type_id,
                $point_type_id,
                $start_date,
                $per_page,
                $offset
            ),
            ARRAY_A
        );

        // Total Count Query for Pagination.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total_items = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT u.ID) 
                FROM {$wpdb->users} u
                LEFT JOIN {$wpdb->prefix}gamify_points_log p ON u.ID = p.user_id
                WHERE p.points > 0 
                AND ( p.point_type_id = %d OR 0 = %d ) 
                AND p.created_at >= %s",
                $point_type_id,
                $point_type_id,
                $start_date
            )
        );

        // Formatting Output.
        $start_rank = $offset + 1;
        foreach ($results as $index => &$row) {
            $row['rank']               = '#' . ($start_rank + $index);
            $row['total_points']       = esc_html(number_format_i18n($row['total_points']));
            $row['achievements_count'] = esc_html(number_format_i18n($row['achievements_count']));
            $row['top_level']          = $row['top_level'] ? esc_html($row['top_level']) : '-';
        }

        $total_pages = (int) ceil($total_items / $per_page);

        // Store Cache.
        $cache_to_save = array(
            'results' => $results,
            'total'   => $total_items,
            'pages'   => $total_pages,
        );
        wp_cache_set($cache_key, $cache_to_save, 'gamify_leaderboard', 300);

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    /**
     * Get date query string based on range.
     *
     * @param string $range Selected time range.
     * @return string|null
     */
    private function get_date_query($range)
    {
        switch ($range) {
            case 'today':
                return gmdate('Y-m-d 00:00:00');
            case 'this_week':
                return gmdate('Y-m-d 00:00:00', strtotime('monday this week'));
            case 'this_month':
                return gmdate('Y-m-01 00:00:00');
            case 'this_year':
                return gmdate('Y-01-01 00:00:00');
            case 'last_30_days':
                return gmdate('Y-m-d 00:00:00', strtotime('-30 days'));
            default:
                return null;
        }
    }
}
