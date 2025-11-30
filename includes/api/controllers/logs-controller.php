<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\System\TriggerRegistry;

if (! defined('ABSPATH')) exit;

class LogsController extends BaseController
{
    protected $rest_base = 'logs';

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
    }

    public function get_items(\WP_REST_Request $request)
    {
        global $wpdb;

        // Tables
        $table_logs  = $wpdb->prefix . 'gamify_logs';
        $table_users = $wpdb->users;

        // Pagination & Search Params
        $per_page = $request->get_param('per_page');
        $page     = $request->get_param('page');
        $search   = $request->get_param('search');
        $offset   = $per_page * ($page - 1);

        $sql = "SELECT 
                    l.id, 
                    l.user_id, 
                    l.trigger_key, 
                    l.status, 
                    l.message, 
                    l.meta, 
                    l.created_at,
                    u.display_name as user_name,
                    u.user_email
                FROM {$table_logs} as l
                LEFT JOIN {$table_users} as u ON l.user_id = u.ID
                WHERE 1=1";

        $prepare_args = [];

        // Search Filter (Update to search in trigger_key)
        if (!empty($search)) {
            $sql .= " AND (u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s)";
            $like_search = '%' . $wpdb->esc_like($search) . '%';
            array_push($prepare_args, $like_search, $like_search, $like_search, $like_search);
        }

        // Count Query
        $count_sql = "SELECT COUNT(l.id) FROM {$table_logs} as l LEFT JOIN {$table_users} as u ON l.user_id = u.ID WHERE 1=1";
        if (!empty($search)) {
            $count_sql .= " AND (u.display_name LIKE %s OR u.user_email LIKE %s OR l.trigger_key LIKE %s OR l.message LIKE %s)";
        }

        if (!empty($prepare_args)) {
            $total_items = $wpdb->get_var($wpdb->prepare($count_sql, $prepare_args));
        } else {
            $total_items = $wpdb->get_var($count_sql);
        }

        // Get Data
        $sql .= " ORDER BY l.created_at DESC LIMIT %d OFFSET %d";
        array_push($prepare_args, $per_page, $offset);

        $results = $wpdb->get_results($wpdb->prepare($sql, $prepare_args), ARRAY_A);

        // ৩. Process Data: Relation Logic
        foreach ($results as &$row) {
            // JSON Decode
            if (!empty($row['meta'])) {
                $row['meta'] = json_decode($row['meta'], true);
            } else {
                $row['meta'] = [];
            }

            // --- RELATION LOGIC ---
            $trigger_config = TriggerRegistry::get($row['trigger_key']);

            if ($trigger_config && isset($trigger_config['label'])) {
                $row['event_name'] = $trigger_config['label'];
            } else {
                $readable = ucwords(str_replace(['_', '-'], ' ', $row['trigger_key']));
                $row['event_name'] = $readable;
            }
        }

        // Response
        $response = new \WP_REST_Response($results, 200);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) ceil($total_items / $per_page));

        return $response;
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
