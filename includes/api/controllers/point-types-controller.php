<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) exit;

class PointTypesController extends BaseController
{
    protected $rest_base = 'point-types';


    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            ['methods' => \WP_REST_Server::READABLE, 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'admin_permission_check']],
            ['methods' => \WP_REST_Server::CREATABLE, 'callback' => [$this, 'create_item'], 'permission_callback' => [$this, 'admin_permission_check']],
        ]);
    }

    public function get_items(\WP_REST_Request $request)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';
        $results = $wpdb->get_results("SELECT * FROM {$table} ORDER BY id DESC", ARRAY_A);
        return new \WP_REST_Response($results, 200);
    }

    public function create_item(\WP_REST_Request $request)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';
        $name = sanitize_text_field($request->get_param('name'));
        $plural_name = sanitize_text_field($request->get_param('plural_name'));

        if (empty($name) || empty($plural_name)) {
            return new \WP_Error('invalid_data', __('Name and Plural Name are required.', 'gamify'), ['status' => 400]);
        }

        $wpdb->insert($table, ['name' => $name, 'plural_name' => $plural_name, 'slug' => sanitize_title($name), 'created_at' => current_time('mysql')]);
        return new \WP_REST_Response(['id' => $wpdb->insert_id, 'message' => __('Point type created successfully.', 'gamify')], 201);
    }
}
