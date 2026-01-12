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
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'logs';

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
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                    'args'                => $this->get_collection_params(),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Retrieve logs with pagination and search.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
     */
    public function get_items(\WP_REST_Request $request)
    {
        global $wpdb;

        //  Sanitize Inputs.
        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $offset   = ($page - 1) * $per_page;

        // Object Caching.
        $cache_key   = 'gamify_logs_' . md5($per_page . $page . $search);
        $cached_data = wp_cache_get($cache_key, 'gamify_logs');

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

        $like_search = '%' . $wpdb->esc_like($search) . '%';

        // Count Query (Using a static structure to avoid concatenation).
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total_items = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(l.id) FROM {$wpdb->prefix}gamify_logs as l 
                LEFT JOIN {$wpdb->users} as u ON l.user_id = u.ID 
                WHERE ( %s = '' OR u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s )",
                $search,
                $like_search,
                $like_search,
                $like_search,
                $like_search
            )
        );

        // Main Query (Static string with placeholders).
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    l.id, l.user_id, l.trigger_key, l.status, l.points_awarded, l.message, l.meta, l.created_at,
                    u.display_name as user_name, u.user_email
                FROM {$wpdb->prefix}gamify_logs as l
                LEFT JOIN {$wpdb->users} as u ON l.user_id = u.ID
                WHERE ( %s = '' OR u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s )
                ORDER BY l.created_at DESC 
                LIMIT %d OFFSET %d",
                $search,
                $like_search,
                $like_search,
                $like_search,
                $like_search,
                $per_page,
                $offset
            ),
            ARRAY_A
        );

        // Formatting Meta & Trigger Labels.
        foreach ($results as &$row) {
            $row['meta']       = ! empty($row['meta']) ? json_decode($row['meta'], true) : array();
            $event_label       = ucwords(str_replace(array('_', '-'), ' ', $row['trigger_key']));
            $row['event_name'] = $event_label;

            if (class_exists('\Gamify\Classes\TriggerRegistry')) {
                $trigger_config = \Gamify\Classes\TriggerRegistry::get($row['trigger_key']);
                if ($trigger_config && isset($trigger_config['label'])) {
                    $row['event_name'] = $trigger_config['label'];
                }
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);

        // Save Cache.
        $cache_to_save = array(
            'results' => $results,
            'total'   => $total_items,
            'pages'   => $total_pages,
        );
        wp_cache_set($cache_key, $cache_to_save, 'gamify_logs', 30);

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    /**
     * Update a log entry.
     */
    public function update_item(\WP_REST_Request $request)
    {
        global $wpdb;

        $log_id = absint($request->get_param('id'));
        $params = $request->get_json_params();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gamify_logs WHERE id = %d", $log_id), ARRAY_A);

        if (! $existing) {
            return new \WP_Error('not_found', __('Log entry not found.', 'gamify'), array('status' => 404));
        }

        $data = array();

        if (isset($params['message'])) {
            $data['message'] = sanitize_text_field($params['message']);
        }

        if (isset($params['points_awarded'])) {
            $new_points = intval($params['points_awarded']);
            if (isset($params['type']) && 'deduct' === $params['type']) {
                $new_points = -abs($new_points);
            } else {
                $new_points = abs($new_points);
            }
            $data['points_awarded'] = $new_points;

            $meta = is_array($existing['meta']) ? $existing['meta'] : json_decode($existing['meta'], true);
            if (isset($meta['log_id'])) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->update(
                    "{$wpdb->prefix}gamify_points_log",
                    array('points' => $new_points),
                    array('id' => absint($meta['log_id'])),
                    array('%d'),
                    array('%d')
                );
            }
        }

        if (isset($params['trigger_key'])) {
            $data['trigger_key'] = sanitize_key($params['trigger_key']);
        }

        if (empty($data)) {
            return new \WP_REST_Response(array('message' => __('No changes made.', 'gamify')), 200);
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $updated = $wpdb->update("{$wpdb->prefix}gamify_logs", $data, array('id' => $log_id));

        if (false === $updated) {
            return new \WP_Error('db_error', __('Could not update log.', 'gamify'), array('status' => 500));
        }

        wp_cache_delete('gamify_logs_' . md5('201'), 'gamify_logs');
        return new \WP_REST_Response(array('message' => __('Log updated successfully.', 'gamify')), 200);
    }

    /**
     * Get collection parameters.
     */
    public function get_collection_params()
    {
        return array(
            'page'     => array(
                'default'           => 1,
                'sanitize_callback' => 'absint',
            ),
            'per_page' => array(
                'default'           => 20,
                'sanitize_callback' => 'absint',
            ),
            'search'   => array(
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        );
    }
}
