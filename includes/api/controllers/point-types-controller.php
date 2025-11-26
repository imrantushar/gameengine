<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Controller for managing Point Types via REST API.
 */
class PointTypesController extends BaseController
{
    /**
     * The route base for this controller.
     * @var string
     */
    protected $rest_base = 'point-types';

    /**
     * Register routes for Point Types.
     */
    public function register_routes()
    {
        // Route for collection: /gamify/v1/point-types
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE, // GET
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE, // POST
                'callback'            => [$this, 'create_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);

        // Route for single item: /gamify/v1/point-types/{id}
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE, // GET (Single)
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE, // PUT/PATCH
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::DELETABLE, // DELETE
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    /**
     * Retrieve a list of point types.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_items($request)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_point_types';
        $results = $wpdb->get_results("SELECT * FROM {$table} ORDER BY id DESC", ARRAY_A);
        return new \WP_REST_Response($results, 200);
    }

    /**
     * Create a new point type.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item($request)
    {
        global $wpdb;

        $params = $request->get_json_params();
        $name = isset($params['name']) ? sanitize_text_field($params['name']) : '';
        $plural_name = isset($params['plural_name']) ? sanitize_text_field($params['plural_name']) : '';
        $requirements = isset($params['requirements']) ? $params['requirements'] : [];

        if (empty($name)) {
            return new \WP_Error('invalid_data', 'Point Name is required.', ['status' => 400]);
        }

        $table_points = $wpdb->prefix . 'gamify_point_types';
        $table_requirements = $wpdb->prefix . 'gamify_requirements';

        // Generate unique slug
        $base_slug = sanitize_title($name);
        $slug = $base_slug;
        $counter = 1;

        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$table_points} WHERE slug = %s", $slug))) {
            $slug = $base_slug . '-' . $counter;
            $counter++;
        }

        // Insert Point Type
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
            return new \WP_Error('db_error', 'Could not save point type. ' . $wpdb->last_error, ['status' => 500]);
        }

        $point_type_id = $wpdb->insert_id;

        // Insert Requirements
        if (!empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';
                $parameters  = isset($req['parameters']) ? json_encode($req['parameters']) : '{}';

                $wpdb->insert(
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
            }
        }

        return new \WP_REST_Response([
            'message' => 'Point Type saved successfully.',
            'id' => $point_type_id,
            'slug' => $slug
        ], 201);
    }

    /**
     * Retrieve a single point type and its requirements.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');

        $point_type = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gamify_point_types WHERE id = %d",
            $id
        ), ARRAY_A);

        if (empty($point_type)) {
            return new \WP_Error('not_found', 'Item not found', ['status' => 404]);
        }

        // Fetch requirements
        $requirements = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gamify_requirements 
             WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1",
            $id
        ), ARRAY_A);

        // Decode parameters
        foreach ($requirements as &$req) {
            $req['parameters'] = json_decode($req['parameters'], true);
        }

        $point_type['requirements'] = $requirements;

        return new \WP_REST_Response($point_type, 200);
    }

    /**
     * Update an existing point type.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        $name = sanitize_text_field($params['name']);
        $plural_name = sanitize_text_field($params['plural_name']);
        $requirements = isset($params['requirements']) ? $params['requirements'] : [];

        // Update Point Type
        $wpdb->update(
            $wpdb->prefix . 'gamify_point_types',
            ['name' => $name, 'plural_name' => $plural_name],
            ['id' => $id],
            ['%s', '%s'],
            ['%d']
        );

        // Sync Requirements: Delete old, insert new
        $table_req = $wpdb->prefix . 'gamify_requirements';

        $wpdb->delete($table_req, ['reward_type' => 'point_type', 'reward_id' => $id], ['%s', '%d']);

        if (!empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';
                $parameters  = isset($req['parameters']) ? json_encode($req['parameters']) : '{}';

                $wpdb->insert($table_req, [
                    'reward_type' => 'point_type',
                    'reward_id'   => $id,
                    'trigger_key' => $trigger_key,
                    'action_type' => $action_type,
                    'parameters'  => $parameters,
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql')
                ]);
            }
        }

        return new \WP_REST_Response(['message' => 'Updated successfully.'], 200);
    }

    /**
     * Delete a point type.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $table = $wpdb->prefix . 'gamify_point_types';

        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE id = %d", $id));

        if (!$exists) {
            return new \WP_Error('not_found', 'Point type not found.', ['status' => 404]);
        }

        $deleted = $wpdb->delete($table, ['id' => $id], ['%d']);

        if ($deleted) {
            // Delete associated requirements
            $wpdb->delete(
                $wpdb->prefix . 'gamify_requirements',
                ['reward_type' => 'point_type', 'reward_id' => $id],
                ['%s', '%d']
            );

            return new \WP_REST_Response(['message' => 'Deleted successfully.', 'id' => $id], 200);
        }

        return new \WP_REST_Response(['message' => 'Could not delete item.'], 500);
    }
}
