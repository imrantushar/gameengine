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
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'create_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function get_items($request)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';
        $results = $wpdb->get_results("SELECT * FROM {$table} ORDER BY id DESC", ARRAY_A);
        return new \WP_REST_Response($results, 200);
    }

    public function create_item($request)
    {
        global $wpdb;

        $params = $request->get_json_params();

        error_log('Gamify Save Data: ' . print_r($params, true));

        $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
        $plural_name = isset($params['plural_name']) ? sanitize_text_field($params['plural_name']) : '';
        $requirements = isset($params['requirements']) ? $params['requirements'] : [];

        if (empty($name)) {
            return new \WP_Error('invalid_data', 'Point Name is required.', ['status' => 400]);
        }

        $table_points = $wpdb->prefix . 'gamify_point_types';
        $table_requirements = $wpdb->prefix . 'gamify_requirements';
        $slug = sanitize_title($name);

        $inserted = $wpdb->insert(
            $table_points,
            [
                'name'        => $name,
                'plural_name' => $plural_name,
                'slug'        => $slug,
                'created_at'  => current_time('mysql')
            ],
            ['%s', '%s', '%s', '%s']
        );

        if ($inserted === false) {
            error_log('Gamify DB Error (Point Type): ' . $wpdb->last_error);
            return new \WP_Error('db_error', 'Could not save point type. ' . $wpdb->last_error, ['status' => 500]);
        }

        $point_type_id = $wpdb->insert_id;

        if (!empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';

                $parameters = isset($req['parameters']) ? json_encode($req['parameters']) : '{}';

                $req_inserted = $wpdb->insert(
                    $table_requirements,
                    [
                        'reward_type' => 'point_type',
                        'reward_id'   => $point_type_id,
                        'trigger_key' => $trigger_key,
                        'action_type' => $action_type,
                        'parameters'  => $parameters,
                        'is_active'   => 1,
                        'created_at'  => current_time('mysql')
                    ],
                    ['%s', '%d', '%s', '%s', '%s', '%d', '%s']
                );

                if ($req_inserted === false) {
                    error_log('Gamify DB Error (Requirement): ' . $wpdb->last_error);
                }
            }
        }

        return new \WP_REST_Response([
            'message' => 'Point Type saved successfully.',
            'id' => $point_type_id
        ], 201);
    }
}
