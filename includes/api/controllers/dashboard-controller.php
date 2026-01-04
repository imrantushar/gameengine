<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class DashboardController
 * Handles API requests for the dashboard statistics with date filtering.
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
     * Supports start_date and end_date parameters.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_stats($request)
    {
        global $wpdb;

        // Get date parameters from request
        $start_date = $request->get_param('start_date'); // Format: YYYY-MM-DD
        $end_date   = $request->get_param('end_date');   // Format: YYYY-MM-DD

        // Create a unique cache key based on the date range
        $cache_key = 'gamify_stats_' . md5($start_date . $end_date);
        $stats = wp_cache_get($cache_key, 'gamify_dashboard');

        if (false === $stats) {

            // Define date filter SQL parts
            $points_where = "WHERE points > 0";
            $deduct_where = "WHERE points < 0";
            $ach_where    = "WHERE 1=1";
            $lvl_where    = "WHERE 1=1";
            $params       = [];

            if (!empty($start_date) && !empty($end_date)) {
                $s = $start_date . ' 00:00:00';
                $e = $end_date . ' 23:59:59';

                $points_where .= " AND created_at BETWEEN %s AND %s";
                $deduct_where .= " AND created_at BETWEEN %s AND %s";
                $ach_where    .= " AND achieved_at BETWEEN %s AND %s";
                $lvl_where    .= " AND achieved_at BETWEEN %s AND %s";

                $params = [$s, $e];
            }

            // --- A. Overview Counts ---

            // Total Points Added
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $total_points = $wpdb->get_var($wpdb->prepare("SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log $points_where", $params));

            // Total Points Deducted
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $total_deducted = $wpdb->get_var($wpdb->prepare("SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log $deduct_where", $params));

            // Total Achievements
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $total_achievements = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_achievements $ach_where", $params));

            // Total Levels
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $total_levels = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_levels $lvl_where", $params));

            // Active Users in this period
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $active_users = $wpdb->get_var($wpdb->prepare("
                SELECT COUNT(DISTINCT user_id) FROM (
                    SELECT user_id FROM {$wpdb->prefix}gamify_points_log $points_where
                    UNION
                    SELECT user_id FROM {$wpdb->prefix}gamify_user_achievements $ach_where
                ) AS active
            ", array_merge($params, $params)));

            // --- B. Chart Data ---
            // If no dates provided, default to last 7 days for chart
            $chart_data = $this->get_chart_data($start_date, $end_date);

            // --- C. Top Users (Leaderboard) ---
            // Leaderboard also respects the date filter
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $top_users = $wpdb->get_results($wpdb->prepare("
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
                $points_where
                GROUP BY u.ID
                ORDER BY total_points DESC
                LIMIT 5
            ", $params), ARRAY_A);

            // Structure the response data
            $stats = [
                'overview' => [
                    'points'          => number_format_i18n((int)$total_points),
                    'points_deducted' => number_format_i18n(abs((int)$total_deducted)),
                    'achievements'    => number_format_i18n((int)$total_achievements),
                    'levels'          => number_format_i18n((int)$total_levels),
                    'active_users'    => number_format_i18n((int)$active_users),
                ],
                'chart'     => $chart_data,
                'top_users' => $top_users
            ];

            // Cache for 5 minutes
            wp_cache_set($cache_key, $stats, 'gamify_dashboard', 300);
        }

        return new \WP_REST_Response($stats, 200);
    }

    /**
     * Helper to retrieve chart data based on date range or last 7 days.
     *
     * @param string|null $start
     * @param string|null $end
     * @return array
     */
    private function get_chart_data($start = null, $end = null)
    {
        global $wpdb;
        $labels = [];
        $points_data = [];
        $achievements_data = [];
        $levels_data = [];

        // Determine how many days to show
        if ($start && $end) {
            $date1 = new \DateTime($start);
            $date2 = new \DateTime($end);
            $interval = $date1->diff($date2);
            $days_to_query = (int) $interval->days;
            // Limit to 30 days maximum to avoid performance issues in chart
            $days_to_query = ($days_to_query > 30) ? 30 : $days_to_query;
            $base_timestamp = strtotime($end);
        } else {
            $days_to_query = 6; // Last 7 days including today
            $base_timestamp = current_time('timestamp');
        }

        for ($i = $days_to_query; $i >= 0; $i--) {
            $timestamp = $base_timestamp - ($i * DAY_IN_SECONDS);
            $db_date   = gmdate('Y-m-d', $timestamp);
            $labels[]  = gmdate('d M', $timestamp);

            // Fetch points
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $points = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log WHERE points > 0 AND DATE(created_at) = %s",
                $db_date
            ));
            $points_data[] = $points ? (int)$points : 0;

            // Fetch achievements
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $ach = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_achievements WHERE DATE(achieved_at) = %s",
                $db_date
            ));
            $achievements_data[] = $ach ? (int)$ach : 0;

            // Fetch levels
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
