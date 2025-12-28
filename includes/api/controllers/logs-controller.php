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

        // 1. Sanitize Inputs
        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $offset   = ($page - 1) * $per_page;

        // 2. Object Caching
        $cache_key   = 'gamify_logs_' . md5($per_page . $page . $search);
        $cached_data = wp_cache_get($cache_key, 'gamify_logs');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, [
                'X-WP-Total'      => $cached_data['total'],
                'X-WP-TotalPages' => $cached_data['pages'],
            ]);
        }

        // 3. Dynamic Where Construction
        $where_sql    = "WHERE 1=1";
        $prepare_args = [];

        if (!empty($search)) {
            $where_sql .= " AND (u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s)";
            $like_search = '%' . $wpdb->esc_like($search) . '%';
            $prepare_args = array_fill(0, 4, $like_search);
        }

        // 4. Count Query
        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQL.NotPrepared
        $count_query = $wpdb->prepare(
            "SELECT COUNT(l.id) FROM {$wpdb->prefix}gamify_logs as l LEFT JOIN {$wpdb->users} as u ON l.user_id = u.ID $where_sql",
            $prepare_args
        );
        $total_items = (int) $wpdb->get_var($count_query);

        // 5. Main Query
        $main_args = array_merge($prepare_args, [$per_page, $offset]);
        $main_query = $wpdb->prepare(
            "SELECT 
                l.id, l.user_id, l.trigger_key, l.status, l.points_awarded, l.message, l.meta, l.created_at,
                u.display_name as user_name, u.user_email
            FROM {$wpdb->prefix}gamify_logs as l
            LEFT JOIN {$wpdb->users} as u ON l.user_id = u.ID
            $where_sql
            ORDER BY l.created_at DESC 
            LIMIT %d OFFSET %d",
            $main_args
        );
        $results = $wpdb->get_results($main_query, ARRAY_A);
        // phpcs:enable

        // 6. Formatting Meta & Trigger Labels
        foreach ($results as &$row) {
            $row['meta'] = !empty($row['meta']) ? json_decode($row['meta'], true) : [];
            $trigger_config = TriggerRegistry::get($row['trigger_key']);
            $row['event_name'] = ($trigger_config && isset($trigger_config['label']))
                ? $trigger_config['label']
                : ucwords(str_replace(['_', '-'], ' ', $row['trigger_key']));
        }

        $total_pages = (int) ceil($total_items / $per_page);

        // 7. Save Cache
        $cache_to_save = [
            'results' => $results,
            'total'   => $total_items,
            'pages'   => $total_pages
        ];
        wp_cache_set($cache_key, $cache_to_save, 'gamify_logs', 60);

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

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

        $log_id = absint($request->get_param('id'));
        $params = $request->get_json_params();

        // 1. Fetch existing log
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gamify_logs WHERE id = %d", $log_id), ARRAY_A);

        if (!$existing) {
            return new \WP_Error('not_found', __('Log entry not found.', 'gamify'), ['status' => 404]);
        }

        $data   = [];
        $format = [];

        if (isset($params['message'])) {
            $data['message'] = sanitize_text_field($params['message']);
            $format[]        = '%s';
        }

        if (isset($params['points_awarded'])) {
            $new_points = intval($params['points_awarded']);
            if (isset($params['type']) && $params['type'] === 'deduct') {
                $new_points = -abs($new_points);
            } else {
                $new_points = abs($new_points);
            }

            $data['points_awarded'] = $new_points;
            $format[]               = '%d';

            $meta = json_decode($existing['meta'], true);
            if (isset($meta['log_id'])) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->update(
                    $wpdb->prefix . 'gamify_points_log',
                    ['points' => $new_points],
                    ['id' => absint($meta['log_id'])],
                    ['%d'],
                    ['%d']
                );
                wp_cache_flush();
            }
        }

        if (isset($params['trigger_key'])) {
            $data['trigger_key'] = sanitize_key($params['trigger_key']);
            $format[]            = '%s';
        }

        if (empty($data)) {
            return new \WP_REST_Response(['message' => __('No changes made.', 'gamify')], 200);
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $updated = $wpdb->update($wpdb->prefix . 'gamify_logs', $data, ['id' => $log_id], $format, ['%d']);

        if ($updated === false) {
            return new \WP_Error('db_error', __('Could not update log.', 'gamify'), ['status' => 500]);
        }

        wp_cache_delete('gamify_logs_' . md5('201'), 'gamify_logs'); // Basic cache clear

        return new \WP_REST_Response(['message' => __('Log updated successfully.', 'gamify')], 200);
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
