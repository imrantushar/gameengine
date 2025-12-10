<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\Classes\TriggerRegistry;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class LogsController
 * Handles API requests for fetching and updating logs.
 */
class LogsController extends BaseController
{
    /**
     * @var string
     */
    protected $rest_base = 'logs';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'admin_permission_check'],
                'args'                => $this->get_collection_params(),
            ],
        ]);

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    /**
     * Retrieve logs with pagination and search.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_items(\WP_REST_Request $request)
    {
        global $wpdb;
        $table_logs  = $wpdb->prefix . 'gamify_logs';
        $table_users = $wpdb->users;

        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $offset   = ($page - 1) * $per_page;

        // Cache key based on params
        $cache_key = 'gamify_logs_' . md5($per_page . $page . $search);
        $cached_data = get_transient($cache_key);

        if (false !== $cached_data) {
            return $cached_data;
        }

        $where_sql = "WHERE 1=1";
        $prepare_args = [];

        if (!empty($search)) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $where_sql .= " AND (u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s)";
            $like_search = '%' . $wpdb->esc_like($search) . '%';
            array_push($prepare_args, $like_search, $like_search, $like_search, $like_search);
        }

        // Count Query
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $count_sql = "SELECT COUNT(l.id) FROM {$table_logs} as l LEFT JOIN {$table_users} as u ON l.user_id = u.ID $where_sql";

        if (!empty($prepare_args)) {
            // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
            $total_items = $wpdb->get_var($wpdb->prepare($count_sql, $prepare_args));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
            $total_items = $wpdb->get_var($count_sql);
        }

        // Main Query
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $sql = "SELECT 
                    l.id, l.user_id, l.trigger_key, l.status, l.points_awarded, l.message, l.meta, l.created_at,
                    u.display_name as user_name, u.user_email
                FROM {$table_logs} as l
                LEFT JOIN {$table_users} as u ON l.user_id = u.ID
                $where_sql
                ORDER BY l.created_at DESC 
                LIMIT %d OFFSET %d";

        array_push($prepare_args, $per_page, $offset);

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $results = $wpdb->get_results($wpdb->prepare($sql, $prepare_args), ARRAY_A);

        foreach ($results as &$row) {
            $row['meta'] = !empty($row['meta']) ? json_decode($row['meta'], true) : [];

            $trigger_config = TriggerRegistry::get($row['trigger_key']);
            $row['event_name'] = ($trigger_config && isset($trigger_config['label']))
                ? $trigger_config['label']
                : ucwords(str_replace(['_', '-'], ' ', $row['trigger_key']));
        }

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) ceil($total_items / $per_page));

        set_transient($cache_key, $response, 10);

        return $response;
    }

    /**
     * Update a log entry.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function update_item(\WP_REST_Request $request)
    {
        global $wpdb;
        $table_logs = $wpdb->prefix . 'gamify_logs';
        $table_points = $wpdb->prefix . 'gamify_points_log';

        $id = $request->get_param('id');
        $params = $request->get_json_params();

        // 1. Fetch existing log
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_logs} WHERE id = %d", $id), ARRAY_A);

        if (!$existing) {
            return new \WP_Error('not_found', 'Log entry not found.', ['status' => 404]);
        }

        // ... (Data Prep Logic) ...
        $data = [];
        $format = [];

        if (isset($params['message'])) {
            $data['message'] = sanitize_text_field($params['message']);
            $format[] = '%s';
        }

        if (isset($params['points_awarded'])) {
            $new_points = intval($params['points_awarded']);
            if ($params['type'] === 'deduct') {
                $new_points = -abs($new_points);
            } else {
                $new_points = abs($new_points);
            }

            $data['points_awarded'] = $new_points;
            $format[] = '%d';

            $meta = json_decode($existing['meta'], true);
            if (isset($meta['log_id'])) {
                $wpdb->update(
                    $table_points,
                    ['points' => $new_points],
                    ['id' => $meta['log_id']],
                    ['%d'],
                    ['%d']
                );
                delete_transient('gamify_dashboard_stats');
            }
        }

        if (isset($params['trigger_key'])) {
            $data['trigger_key'] = sanitize_key($params['trigger_key']);
            $format[] = '%s';
        }

        if (empty($data)) {
            return new \WP_REST_Response(['message' => 'No changes made.'], 200);
        }

        $updated = $wpdb->update($table_logs, $data, ['id' => $id], $format, ['%d']);

        if ($updated === false) {
            return new \WP_Error('db_error', 'Could not update log.', ['status' => 500]);
        }

        return new \WP_REST_Response(['message' => 'Log updated successfully.'], 200);
    }

    public function get_collection_params()
    {
        return [
            'page'     => ['default' => 1, 'sanitize_callback' => 'absint'],
            'per_page' => ['default' => 20, 'sanitize_callback' => 'absint'],
            'search'   => ['default' => '', 'sanitize_callback' => 'sanitize_text_field'],
        ];
    }
}
