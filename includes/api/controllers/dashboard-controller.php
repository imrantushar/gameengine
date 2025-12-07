<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) exit;

class DashboardController extends BaseController
{
    protected $rest_base = 'dashboard';

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

    public function get_stats($request)
    {
        global $wpdb;

        // 1. Overview Counts
        $total_points = $wpdb->get_var("SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log WHERE points > 0");
        $total_achievements = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_achievements");
        $total_levels = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_levels");

        // Active Users (Users who earned points/achievements/levels)
        $active_users = $wpdb->get_var("
            SELECT COUNT(DISTINCT user_id) FROM (
                SELECT user_id FROM {$wpdb->prefix}gamify_points_log
                UNION
                SELECT user_id FROM {$wpdb->prefix}gamify_user_achievements
            ) AS active
        ");

        // 2. Chart Data (Last 7 Days)
        $chart_data = $this->get_chart_data();

        // 3. Top Users (Leaderboard based on Total Points)
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

        return new \WP_REST_Response([
            'overview' => [
                'points' => number_format((int)$total_points),
                'achievements' => number_format((int)$total_achievements),
                'levels' => number_format((int)$total_levels),
                'active_users' => number_format((int)$active_users),
            ],
            'chart' => $chart_data,
            'top_users' => $top_users
        ], 200);
    }

    private function get_chart_data()
    {
        global $wpdb;
        $labels = [];
        $points_data = [];
        $achievements_data = [];
        $levels_data = [];

        // Last 7 Days Loop
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $labels[] = date('d M, y', strtotime($date));

            // Points on this day
            $points = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(points) FROM {$wpdb->prefix}gamify_points_log WHERE points > 0 AND DATE(created_at) = %s",
                $date
            ));
            $points_data[] = $points ? (int)$points : 0;

            // Achievements on this day
            $ach = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_achievements WHERE DATE(achieved_at) = %s",
                $date
            ));
            $achievements_data[] = $ach ? (int)$ach : 0;

            // Levels on this day
            $lvl = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_user_levels WHERE DATE(achieved_at) = %s",
                $date
            ));
            $levels_data[] = $lvl ? (int)$lvl : 0;
        }

        return [
            'labels' => $labels, //level
            'points' => $points_data,
            'achievements' => $achievements_data,
            'levels' => $levels_data
        ];
    }
}
