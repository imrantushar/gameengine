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

    public function __construct()
    {
        add_shortcode('gameengine_leaderboard', array($this, 'render_view'));
    }

    public function render_view($atts)
    {
        //  Process attributes
        $args = shortcode_atts(array(
            'count'      => 10,
            'point_type' => 0,
            'time_range' => 'all_time',
        ), $atts);

        //  Cache Logic
        $cache_key = 'ge_front_lb_' . md5(wp_json_encode($args));
        $top_users = wp_cache_get($cache_key, 'gameengine');

        if (false === $top_users) {
            global $wpdb;
            $limit = absint($args['count']);
            $pt_id = absint($args['point_type']);

            $where_sql = "WHERE p.points > 0";
            if ($pt_id > 0) {
                $where_sql .= $wpdb->prepare(" AND p.point_type_id = %d", $pt_id);
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $top_users = $wpdb->get_results($wpdb->prepare(
                "SELECT 
                    u.ID as user_id, u.display_name as name, IFNULL(SUM(p.points), 0) as total_points,
                    (SELECT l.title FROM {$wpdb->prefix}gameengine_user_levels ul JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id WHERE ul.user_id = u.ID ORDER BY l.priority DESC LIMIT 1) as top_level
                FROM {$wpdb->users} u
                JOIN {$wpdb->prefix}gameengine_points_log p ON u.ID = p.user_id
                $where_sql
                GROUP BY u.ID ORDER BY total_points DESC LIMIT %d",
                $limit
            ), ARRAY_A);

            wp_cache_set($cache_key, $top_users, 'gameengine', 300);
        }

        ob_start();
        \GameEngine\Helper::get_template('shortcode/leaderboard.php', array('users' => $top_users));
        return apply_filters('gameengine/templates/shortcode/leaderboard', ob_get_clean());
    }
}
