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
     * @var string
     */
    protected $rest_base = 'leaderboard';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_leaderboard'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    /**
     * Retrieve leaderboard data with filtering and pagination.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_leaderboard(\WP_REST_Request $request)
    {
        global $wpdb;

        // 1. Sanitize Inputs
        $point_type_id = $request->get_param('point_type') ? absint($request->get_param('point_type')) : 0;
        $time_range    = sanitize_text_field($request->get_param('time_range'));
        $per_page      = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 10;
        $page          = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset        = ($page - 1) * $per_page;

        // 2. Cache Key Generation
        $cache_key = 'gamify_leaderboard_' . md5($point_type_id . $time_range . $per_page . $page);
        $cached_data = wp_cache_get($cache_key, 'gamify_leaderboard');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, [
                'X-WP-Total'      => $cached_data['total'],
                'X-WP-TotalPages' => $cached_data['pages'],
            ]);
        }

        // 3. Dynamic Where Clause Construction
        $where_sql  = "WHERE 1=1 AND p.points > 0";
        $where_args = [];

        if ($point_type_id > 0) {
            $where_sql   .= " AND p.point_type_id = %d";
            $where_args[] = $point_type_id;
        }

        if (!empty($time_range)) {
            $date_query = $this->get_date_query($time_range);
            if ($date_query) {
                $where_sql   .= " AND p.created_at >= %s";
                $where_args[] = $date_query;
            }
        }

        // 4. Main Query (Optimized for PCP)
        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $sql = $wpdb->prepare(
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
            $where_sql
            GROUP BY u.ID
            ORDER BY total_points DESC
            LIMIT %d OFFSET %d",
            array_merge($where_args, [$per_page, $offset])
        );

        $results = $wpdb->get_results($sql, ARRAY_A);

        // 5. Count Query
        $count_sql = $wpdb->prepare(
            "SELECT COUNT(DISTINCT u.ID) 
            FROM {$wpdb->users} u
            LEFT JOIN {$wpdb->prefix}gamify_points_log p ON u.ID = p.user_id
            $where_sql",
            $where_args
        );
        $total_items = (int) $wpdb->get_var($count_sql);
        // phpcs:enable

        // 6. Formatting
        $start_rank = $offset + 1;
        foreach ($results as $index => &$row) {
            $row['rank']               = "#" . ($start_rank + $index);
            $row['total_points']       = number_format_i18n($row['total_points']);
            $row['achievements_count'] = number_format_i18n($row['achievements_count']);
            $row['top_level']          = $row['top_level'] ?: '-';
        }

        $total_pages = (int) ceil($total_items / $per_page);

        // 7. Store Cache
        $cache_to_save = [
            'results' => $results,
            'total'   => $total_items,
            'pages'   => $total_pages
        ];
        wp_cache_set($cache_key, $cache_to_save, 'gamify_leaderboard', 300); // 5 Minutes

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    /**
     * Get date query string based on range.
     *
     * @param string $range
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
