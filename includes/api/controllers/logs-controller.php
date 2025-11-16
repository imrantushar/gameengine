<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) exit;

class LogsController extends BaseController
{
    /**
     * Route base.
     * @var string
     */
    protected $rest_base = 'logs';


    /**
     * Register the routes for this controller.
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
    }

    /**
     * Get logs.
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_items(\WP_REST_Request $request)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_logs';

        $per_page = $request->get_param('per_page');
        $page     = $request->get_param('page');
        $offset   = $per_page * ($page - 1);

        $sql = "SELECT * FROM {$table} ORDER BY created_at DESC";
        $sql .= $wpdb->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);
        $results = $wpdb->get_results($sql, ARRAY_A);

        $total_items = $wpdb->get_var("SELECT COUNT(id) FROM {$table}");
        $response = new \WP_REST_Response($results, 200);

        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', ceil($total_items / $per_page));

        return $response;
    }

    /**
     * Get collection parameters.
     * @return array
     */
    public function get_collection_params()
    {
        return [
            'page'     => ['default' => 1, 'sanitize_callback' => 'absint'],
            'per_page' => ['default' => 20, 'sanitize_callback' => 'absint'],
        ];
    }
}
