<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\NotificationManager;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for the user Notification Center.
 * User-scoped — requires login but not manage_options.
 */
class NotificationsController extends BaseController
{

    /**
     * The kinds NotificationManager writes. Anything else is not a real filter.
     */
    const TYPES = array('points', 'achievement', 'level');

    protected $rest_base = 'notifications';

    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/admin-feed',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_admin_feed'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'logged_in_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/read-all',
            array(
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'mark_all_read'),
                    'permission_callback' => array($this, 'logged_in_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/read',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'mark_read'),
                    'permission_callback' => array($this, 'logged_in_check'),
                ),
            )
        );
    }

    /**
     * Platform-wide activity, for the admin bell and its full screen.
     *
     * Paged and filterable so the "View All" screen can page through the
     * history; the bell just asks for the first page.
     */
    public function get_admin_feed(\WP_REST_Request $request)
    {
        global $wpdb;

        $per_page = min(100, max(1, absint($request->get_param('per_page') ?: 20)));
        $page     = max(1, absint($request->get_param('page') ?: 1));
        $offset   = ($page - 1) * $per_page;
        $search   = sanitize_text_field((string) $request->get_param('search'));
        $type     = sanitize_key((string) $request->get_param('type'));

        $where  = array('1=1');
        $values = array();

        if (in_array($type, self::TYPES, true)) {
            $where[]  = 'n.type = %s';
            $values[] = $type;
        }

        if ('' !== $search) {
            $like     = '%' . $wpdb->esc_like($search) . '%';
            $where[]  = '( n.message LIKE %s OR u.display_name LIKE %s )';
            $values[] = $like;
            $values[] = $like;
        }

        $where_sql = implode(' AND ', $where);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT n.id, n.user_id, u.display_name, n.type, n.message, n.is_read, n.created_at
                 FROM {$wpdb->prefix}gameengine_notifications n
                 INNER JOIN {$wpdb->users} u ON n.user_id = u.ID
                 WHERE {$where_sql}
                 ORDER BY n.created_at DESC
                 LIMIT %d OFFSET %d",
                array_merge($values, array($per_page, $offset))
            ),
            ARRAY_A
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $total = (int) $wpdb->get_var(
            $values
                ? $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_notifications n
                     INNER JOIN {$wpdb->users} u ON n.user_id = u.ID
                     WHERE {$where_sql}",
                    $values
                )
                : "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_notifications n
                   INNER JOIN {$wpdb->users} u ON n.user_id = u.ID"
        );

        $since_24h = gmdate('Y-m-d H:i:s', strtotime('-24 hours'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $recent_count = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_notifications WHERE created_at >= %s",
                $since_24h
            )
        );

        $response = new \WP_REST_Response($items ?: array(), 200);
        $response->header('X-GE-Recent-Count', $recent_count);
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', (int) ceil($total / $per_page));

        return $response;
    }

    public function logged_in_check(\WP_REST_Request $request)
    {
        if (!is_user_logged_in()) {
            return new \WP_Error('rest_forbidden', __('You must be logged in.', 'gameengine'), array('status' => 401));
        }
        return true;
    }

    public function get_items(\WP_REST_Request $request)
    {
        $user_id  = get_current_user_id();
        $per_page = min(50, max(1, absint($request->get_param('per_page') ?: 20)));
        $page     = max(1, absint($request->get_param('page') ?: 1));

        $data     = NotificationManager::get_for_user($user_id, $per_page, $page);
        $response = new \WP_REST_Response($data['items'], 200);
        $response->header('X-WP-Total', $data['total']);
        $response->header('X-GE-Unread', $data['unread']);
        return $response;
    }

    public function mark_read(\WP_REST_Request $request)
    {
        $id      = absint($request->get_param('id'));
        $user_id = get_current_user_id();

        NotificationManager::mark_read($id, $user_id);
        return new \WP_REST_Response(array('marked' => true), 200);
    }

    public function mark_all_read(\WP_REST_Request $request)
    {
        $user_id = get_current_user_id();
        NotificationManager::mark_all_read($user_id);
        return new \WP_REST_Response(array('marked' => true), 200);
    }
}
