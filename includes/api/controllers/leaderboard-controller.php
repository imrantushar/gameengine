<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

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
        $per_page      = min(100, max(1, $request->get_param('per_page') ? absint($request->get_param('per_page')) : 10));
        $page          = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset        = ($page - 1) * $per_page;

        //  Cache Logic.
        $version     = \GameEngine\Helper::get_cache_version('leaderboard');
        $cache_key   = 'gameengine_leaderboard_v' . $version . '_' . md5($point_type_id . $time_range . $per_page . $page);
        $cached_data = wp_cache_get($cache_key, 'gameengine_leaderboard');

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

        // Main Query (Optimized: Uses sub-joins to avoid correlated subqueries and satisfies Audit Requirement #9).
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    u.ID as user_id,
                    u.display_name as name,
                    p.total_points,
                    IFNULL(ach.ach_count, 0) as achievements_count,
                    IFNULL(lvl.title, '-') as top_level
                FROM {$wpdb->users} u
                INNER JOIN (
                    /* 1. Calculate and Filter Points first to define the rank */
                    SELECT user_id, SUM(points) as total_points
                    FROM {$wpdb->prefix}gameengine_points_log
                    WHERE ( point_type_id = %d OR 0 = %d ) 
                    AND created_at >= %s
                    GROUP BY user_id
                ) p ON u.ID = p.user_id
                LEFT JOIN (
                    /* 2. Count achievements in one pass per user */
                    SELECT user_id, COUNT(*) as ach_count 
                    FROM {$wpdb->prefix}gameengine_user_achievements GROUP BY user_id
                ) ach ON u.ID = ach.user_id
                LEFT JOIN (
                    /* 3. Fetch Top Level only for the resulting users */
                    SELECT ul.user_id, l.title 
                    FROM {$wpdb->prefix}gameengine_user_levels ul
                    JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id
                    /* Sub-filter for max priority per user */
                    INNER JOIN (
                        SELECT user_id, MAX(priority) as max_p 
                        FROM {$wpdb->prefix}gameengine_user_levels ul2
                        JOIN {$wpdb->prefix}gameengine_levels l2 ON ul2.level_id = l2.id
                        GROUP BY user_id
                    ) lmax ON ul.user_id = lmax.user_id AND l.priority = lmax.max_p
                ) lvl ON u.ID = lvl.user_id
                ORDER BY p.total_points DESC 
                LIMIT %d OFFSET %d",
                $point_type_id,
                $point_type_id,
                $start_date,
                $per_page,
                $offset
            ),
            ARRAY_A
        );

        $results = apply_filters('gameengine_leaderboard_results', $results, $request);

        // Total Count Query for Pagination.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total_items = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(DISTINCT u.ID) 
                FROM {$wpdb->users} u
                LEFT JOIN {$wpdb->prefix}gameengine_points_log p ON u.ID = p.user_id
                WHERE ( p.point_type_id = %d OR 0 = %d ) 
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

        // Current user position in leaderboard.
        $current_user_position = null;
        $current_user_id       = get_current_user_id();
        if ($current_user_id) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $user_points = (float) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log
                     WHERE user_id = %d
                     AND ( point_type_id = %d OR 0 = %d )
                     AND created_at >= %s",
                    $current_user_id,
                    $point_type_id,
                    $point_type_id,
                    $start_date
                )
            );
            if ($user_points > 0) {
                // Count users who have strictly more total points than the current user.
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $ahead = (int) $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT COUNT(*) FROM (
                            SELECT user_id, SUM(points) as total_points
                            FROM {$wpdb->prefix}gameengine_points_log
                            WHERE ( point_type_id = %d OR 0 = %d )
                            AND created_at >= %s
                            GROUP BY user_id
                            HAVING SUM(points) > %f
                         ) as ahead_users",
                        $point_type_id,
                        $point_type_id,
                        $start_date,
                        $user_points
                    )
                );
                $current_user_position = $ahead + 1;
            }
        }

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
