<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) exit;

class LeaderboardController extends BaseController
{
    protected $rest_base = 'leaderboard';

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

    public function get_leaderboard(\WP_REST_Request $request)
    {
        global $wpdb;

        // Filters
        $point_type_id = $request->get_param('point_type'); // e.g., 1
        $time_range    = $request->get_param('time_range'); // e.g., 'this_month'

        // Pagination
        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 10;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset   = ($page - 1) * $per_page;

        // Base Query
        $where_clause = "WHERE points > 0"; // Only show users with points

        if ($point_type_id) {
            $where_clause .= $wpdb->prepare(" AND point_type_id = %d", $point_type_id);
        }

        if ($time_range) {
            $date_query = $this->get_date_query($time_range);
            if ($date_query) {
                $where_clause .= " AND created_at >= '{$date_query}'";
            }
        }

        // Main Query (Aggregated Points)
        $sql = "
            SELECT 
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
            $where_clause
            GROUP BY u.ID
            ORDER BY total_points DESC
            LIMIT %d OFFSET %d
        ";

        // Count Query for Pagination
        $count_sql = "
            SELECT COUNT(DISTINCT u.ID) 
            FROM {$wpdb->users} u
            LEFT JOIN {$wpdb->prefix}gamify_points_log p ON u.ID = p.user_id
            $where_clause
        ";

        $results = $wpdb->get_results($wpdb->prepare($sql, $per_page, $offset), ARRAY_A);
        $total_items = $wpdb->get_var($count_sql);

        // Add Rank
        $start_rank = $offset + 1;
        foreach ($results as $index => &$row) {
            $row['rank'] = "#" . ($start_rank + $index);
            $row['total_points'] = number_format($row['total_points']);
            $row['achievements_count'] = number_format($row['achievements_count']);
            $row['top_level'] = $row['top_level'] ?: '-';
        }

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) ceil($total_items / $per_page));

        return $response;
    }

    private function get_date_query($range)
    {
        switch ($range) {
            case 'today':
                return date('Y-m-d 00:00:00');
            case 'this_week':
                return date('Y-m-d 00:00:00', strtotime('monday this week'));
            case 'this_month':
                return date('Y-m-01 00:00:00');
            case 'this_year':
                return date('Y-01-01 00:00:00');
            case 'last_30_days':
                return date('Y-m-d 00:00:00', strtotime('-30 days'));
            default:
                return null; // All Time
        }
    }
}
