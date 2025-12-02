<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\Classes\TriggerRegistry;

if (! defined('ABSPATH')) exit;

class LogsController extends BaseController
{
    protected $rest_base = 'logs';

    public function register_routes()
    {
        // GET Logs
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'admin_permission_check'],
                'args'                => $this->get_collection_params(),
            ],
        ]);

        // UPDATE Log (New Route)
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::EDITABLE, // PUT or PATCH
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function get_items(\WP_REST_Request $request)
    {
        global $wpdb;
        $table_logs  = $wpdb->prefix . 'gamify_logs';
        $table_users = $wpdb->users;

        $per_page = $request->get_param('per_page');
        $page     = $request->get_param('page');
        $search   = $request->get_param('search');
        $offset   = $per_page * ($page - 1);

        $sql = "SELECT 
                    l.id, 
                    l.user_id, 
                    l.trigger_key, 
                    l.status, 
                    l.points_awarded,
                    l.message, 
                    l.meta, 
                    l.created_at,
                    u.display_name as user_name,
                    u.user_email
                FROM {$table_logs} as l
                LEFT JOIN {$table_users} as u ON l.user_id = u.ID
                WHERE 1=1";

        $prepare_args = [];

        if (!empty($search)) {
            $sql .= " AND (u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s)";
            $like_search = '%' . $wpdb->esc_like($search) . '%';
            array_push($prepare_args, $like_search, $like_search, $like_search, $like_search);
        }

        $count_sql = "SELECT COUNT(l.id) FROM {$table_logs} as l LEFT JOIN {$table_users} as u ON l.user_id = u.ID WHERE 1=1";
        if (!empty($search)) {
            $count_sql .= " AND (u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s)";
        }

        if (!empty($prepare_args)) {
            $total_items = $wpdb->get_var($wpdb->prepare($count_sql, $prepare_args));
        } else {
            $total_items = $wpdb->get_var($count_sql);
        }

        $sql .= " ORDER BY l.created_at DESC LIMIT %d OFFSET %d";
        array_push($prepare_args, $per_page, $offset);

        $results = $wpdb->get_results($wpdb->prepare($sql, $prepare_args), ARRAY_A);

        foreach ($results as &$row) {
            if (!empty($row['meta'])) {
                $row['meta'] = json_decode($row['meta'], true);
            } else {
                $row['meta'] = [];
            }

            $trigger_config = TriggerRegistry::get($row['trigger_key']);
            if ($trigger_config && isset($trigger_config['label'])) {
                $row['event_name'] = $trigger_config['label'];
            } else {
                $row['event_name'] = ucwords(str_replace(['_', '-'], ' ', $row['trigger_key']));
            }
        }

        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) ceil($total_items / $per_page));

        return $response;
    }

    /**
     * Update a log entry (points, status, message).
     */
    public function update_item(\WP_REST_Request $request)
    {
        global $wpdb;
        $table_logs = $wpdb->prefix . 'gamify_logs';
        $table_points = $wpdb->prefix . 'gamify_points_log'; // To sync wallet

        $id = $request->get_param('id');
        $params = $request->get_json_params();

        // 1. Fetch existing log
        $existing = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_logs} WHERE id = %d", $id), ARRAY_A);
        if (!$existing) {
            return new \WP_Error('not_found', 'Log entry not found.', ['status' => 404]);
        }

        // 2. Prepare Update Data
        $data = [];
        $format = [];

        if (isset($params['message'])) {
            $data['message'] = sanitize_text_field($params['message']);
            $format[] = '%s';
        }

        // If points are updated, we need to sync the wallet log as well (Complex logic simplified)
        if (isset($params['points_awarded'])) {
            $new_points = intval($params['points_awarded']);

            // Determine type based on points value
            if ($params['type'] === 'deduct') {
                $new_points = -abs($new_points);
            } else {
                $new_points = abs($new_points);
            }

            $data['points_awarded'] = $new_points;
            $format[] = '%d';

            // Sync with Wallet Log if linked (using meta log_id)
            $meta = json_decode($existing['meta'], true);
            if (isset($meta['log_id'])) {
                $wpdb->update(
                    $table_points,
                    ['points' => $new_points],
                    ['id' => $meta['log_id']],
                    ['%d'],
                    ['%d']
                );
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
