<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class DashboardController
 * Handles API requests for the dashboard statistics.
 */
class DashboardController extends BaseController
{
    /**
     * @var string
     */
    protected $rest_base = 'dashboard';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_stats'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    /**
     * Retrieve dashboard statistics.
     * Uses transient caching to improve performance and reduce database load.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_stats($request)
    {
        // Check for cached data first (Transient)
        $stats = get_transient('gamify_dashboard_stats');

        if (false === $stats) {
            global $wpdb;

            // --- A. Overview Counts ---

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $total_points = $wpdb->get_var("SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log WHERE points > 0");

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $total_achievements = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_achievements");

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $total_levels = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_levels");

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $active_users = $wpdb->get_var("
                SELECT COUNT(DISTINCT user_id) FROM (
                    SELECT user_id FROM {$wpdb->prefix}gamify_points_log
                    UNION
                    SELECT user_id FROM {$wpdb->prefix}gamify_user_achievements
                ) AS active
            ");

            // --- B. Chart Data ---
            $chart_data = $this->get_chart_data();

            // --- C. Top Users (Leaderboard) ---

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $top_users = $wpdb->get_results("
                SELECT 
                    u.ID, 
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
                GROUP BY u.ID
                ORDER BY total_points DESC
                LIMIT 5
            ", ARRAY_A);

            // Structure the response data
            $stats = [
                'overview' => [
                    'points'       => number_format((int)$total_points),
                    'achievements' => number_format((int)$total_achievements),
                    'levels'       => number_format((int)$total_levels),
                    'active_users' => number_format((int)$active_users),
                ],
                'chart'     => $chart_data,
                'top_users' => $top_users
            ];

            // Cache the data for 60 seconds (1 minute) to reduce DB hits
            set_transient('gamify_dashboard_stats', $stats, 60);
        }

        return new \WP_REST_Response($stats, 200);
    }

    /**
     * Helper to retrieve chart data for the last 7 days.
     *
     * @return array
     */
    private function get_chart_data()
    {
        global $wpdb;
        $labels = [];
        $points_data = [];
        $achievements_data = [];
        $levels_data = [];

        for ($i = 6; $i >= 0; $i--) {
            // Calculate timestamp for past days
            $timestamp = current_time('timestamp') - ($i * DAY_IN_SECONDS);

            // Format date for database query (Y-m-d)
            $db_date = gmdate('Y-m-d', $timestamp);

            // Format label for chart (d M, y)
            $labels[] = gmdate('d M, y', $timestamp);

            // Fetch points for the day
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $points = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log WHERE points > 0 AND DATE(created_at) = %s",
                $db_date
            ));
            $points_data[] = $points ? (int)$points : 0;

            // Fetch achievements count for the day
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $ach = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_achievements WHERE DATE(achieved_at) = %s",
                $db_date
            ));
            $achievements_data[] = $ach ? (int)$ach : 0;

            // Fetch levels count for the day
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $lvl = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_levels WHERE DATE(achieved_at) = %s",
                $db_date
            ));
            $levels_data[] = $lvl ? (int)$lvl : 0;
        }

        return [
            'labels'       => $labels,
            'points'       => $points_data,
            'achievements' => $achievements_data,
            'levels'       => $levels_data
        ];
    }
}
