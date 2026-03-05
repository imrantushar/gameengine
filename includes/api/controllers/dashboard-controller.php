<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

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
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'dashboard';

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
                    'callback'            => array($this, 'get_stats'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route($this->namespace, '/menus', array(
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_admin_menus'),
                'permission_callback' => array($this, 'admin_permission_check'),
            ),
        ));
    }


    /**
     * Returns the updated menu list for the sidebar.
     * Response matches the format of GameEngineGlobal.menu
     */
    public function get_admin_menus()
    {
        $menus = \GameEngine\Helper::get_admin_menu_list();

        return new \WP_REST_Response($menus, 200);
    }

    /**
     * Retrieve dashboard statistics.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
     */
    public function get_stats($request)
    {
        global $wpdb;

        // Sanitize input parameters.
        $raw_start_date = $request->get_param('start_date');
        $raw_end_date   = $request->get_param('end_date');

        $start_date = ! empty($raw_start_date) ? sanitize_text_field($raw_start_date) : '';
        $end_date   = ! empty($raw_end_date) ? sanitize_text_field($raw_end_date) : '';

        // Create a unique cache key based on dates.
        $cache_key = 'gameengine_stats_' . md5($start_date . $end_date);
        $stats     = wp_cache_get($cache_key, 'gameengine_dashboard');

        if (false === $stats) {

            // Set default broad date range if not provided.
            $s = ! empty($start_date) ? $start_date . ' 00:00:00' : '1000-01-01 00:00:00';
            $e = ! empty($end_date) ? $end_date . ' 23:59:59' : '9999-12-31 23:59:59';

            // ---  Overview Counts ---

            // Total Points Added.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $total_points = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log WHERE points > 0 AND created_at BETWEEN %s AND %s",
                    $s,
                    $e
                )
            );

            // Total Points Deducted.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $total_deducted = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log WHERE points < 0 AND created_at BETWEEN %s AND %s",
                    $s,
                    $e
                )
            );

            // Total Achievements.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $total_achievements = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_user_achievements WHERE achieved_at BETWEEN %s AND %s",
                    $s,
                    $e
                )
            );

            // Total Levels.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $total_levels = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_user_levels WHERE achieved_at BETWEEN %s AND %s",
                    $s,
                    $e
                )
            );

            // Active Users Count.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $active_users = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(DISTINCT user_id) FROM (
						SELECT user_id FROM {$wpdb->prefix}gameengine_points_log WHERE points > 0 AND created_at BETWEEN %s AND %s
						UNION
						SELECT user_id FROM {$wpdb->prefix}gameengine_user_achievements WHERE achieved_at BETWEEN %s AND %s
					) AS active",
                    $s,
                    $e,
                    $s,
                    $e
                )
            );

            // ---  Chart Data ---
            $chart_data = $this->get_chart_data($start_date, $end_date);

            // ---  Top Users (Leaderboard) ---
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $top_users = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT 
						u.ID, 
						u.display_name as name, 
						IFNULL(SUM(p.points), 0) as total_points,
						(SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_user_achievements WHERE user_id = u.ID) as achievements_count,
						(
							SELECT l.title FROM {$wpdb->prefix}gameengine_user_levels ul 
							JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id 
							WHERE ul.user_id = u.ID ORDER BY l.priority DESC LIMIT 1
						) as top_level
					FROM {$wpdb->users} u
					LEFT JOIN {$wpdb->prefix}gameengine_points_log p ON u.ID = p.user_id
					WHERE p.points > 0 AND p.created_at BETWEEN %s AND %s
					GROUP BY u.ID
					ORDER BY total_points DESC
					LIMIT 5",
                    $s,
                    $e
                ),
                ARRAY_A
            );

            $stats = array(
                'overview' => array(
                    'points'          => esc_html(number_format_i18n((int) $total_points)),
                    'points_deducted' => esc_html(number_format_i18n(abs((int) $total_deducted))),
                    'achievements'    => esc_html(number_format_i18n((int) $total_achievements)),
                    'levels'          => esc_html(number_format_i18n((int) $total_levels)),
                    'active_users'    => esc_html(number_format_i18n((int) $active_users)),
                ),
                'chart'     => $chart_data,
                'top_users' => $top_users,
            );

            wp_cache_set($cache_key, $stats, 'gameengine_dashboard', 300);
        }

        return new \WP_REST_Response($stats, 200);
    }

    /**
     * Retrieve chart data based on range.
     *
     * @param string $start Start date.
     * @param string $end   End date.
     * @return array
     */
    private function get_chart_data($start = '', $end = '')
    {
        global $wpdb;
        $labels            = array();
        $points_data       = array();
        $achievements_data = array();
        $levels_data       = array();

        if (! empty($start) && ! empty($end)) {
            try {
                $date1          = new \DateTime($start);
                $date2          = new \DateTime($end);
                $interval       = $date1->diff($date2);
                $days_to_query  = (int) $interval->days;
                $days_to_query  = ($days_to_query > 30) ? 30 : $days_to_query;
                $base_timestamp = strtotime($end);
            } catch (\Exception $ex) {
                $days_to_query  = 6;
                $base_timestamp = current_time('timestamp');
            }
        } else {
            $days_to_query  = 6;
            $base_timestamp = current_time('timestamp');
        }

        for ($i = $days_to_query; $i >= 0; $i--) {
            $timestamp = $base_timestamp - ($i * DAY_IN_SECONDS);
            $db_date   = gmdate('Y-m-d', $timestamp);
            $labels[]  = gmdate('d M', $timestamp);

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $p_val = $wpdb->get_var($wpdb->prepare("SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log WHERE points > 0 AND DATE(created_at) = %s", $db_date));
            $points_data[] = $p_val ? (int) $p_val : 0;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $a_val = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_user_achievements WHERE DATE(achieved_at) = %s", $db_date));
            $achievements_data[] = $a_val ? (int) $a_val : 0;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $l_val = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_user_levels WHERE DATE(achieved_at) = %s", $db_date));
            $levels_data[] = $l_val ? (int) $l_val : 0;
        }

        return array(
            'labels'       => $labels,
            'points'       => $points_data,
            'achievements' => $achievements_data,
            'levels'       => $levels_data,
        );
    }
}
