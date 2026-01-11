<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Controller for managing Point Types via REST API.
 */
class PointTypesController extends BaseController
{
    /**
     * @var string
     */
    protected $rest_base = 'point-types';

    /**
     * Register routes for Point Types.
     */
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

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }
    /**
     * Retrieve a list of point types with their associated requirements.
     */
    public function get_items($request)
    {
        $cache_key = 'gamify_point_types_list';
        $results = get_transient($cache_key);

        if (false === $results) {
            global $wpdb;
            $table_points = $wpdb->prefix . 'gamify_point_types';
            $table_reqs   = $wpdb->prefix . 'gamify_requirements';

            // 1. Fetch all point types from the database
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
            $point_types = $wpdb->get_results("SELECT * FROM {$table_points} ORDER BY id DESC", ARRAY_A);

            if (!empty($point_types)) {
                foreach ($point_types as &$pt) {
                    // 2. Fetch requirements for each specific point type
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                    $reqs = $wpdb->get_results($wpdb->prepare(
                        "SELECT * FROM {$table_reqs} WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1",
                        $pt['id']
                    ), ARRAY_A);

                    // 3. Decode JSON parameters for each requirement into an array
                    if (!empty($reqs)) {
                        foreach ($reqs as &$r) {
                            $r['parameters'] = json_decode($r['parameters'], true);
                        }
                    }

                    // 4. Attach the requirements array to the point type object
                    $pt['requirements'] = !empty($reqs) ? $reqs : [];
                }
            }

            $results = $point_types;

            // Set transient cache for 60 seconds
            set_transient($cache_key, $results, 60);
        }

        return new \WP_REST_Response($results, 200);
    }

    /**
     * Create a new point type.
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

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
        $base_slug = sanitize_title($name);
        $slug = $base_slug;
        $counter = 1;

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$table_points} WHERE slug = %s", $slug))) {
            $slug = $base_slug . '-' . $counter;
            $counter++;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
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
            return new \WP_Error('db_error', 'Could not save point type.', ['status' => 500]);
        }

        $point_type_id = $wpdb->insert_id;

        if (!empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';
                $parameters  = isset($req['parameters']) ? json_encode($req['parameters']) : '{}';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
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

        delete_transient('gamify_point_types_list');

        return new \WP_REST_Response([
            'message' => __('Point Type saved successfully.', 'gamify'),
            'id' => $point_type_id,
            'slug' => $slug
        ], 201);
    }

    /**
     * Retrieve a single point type.
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');

        // Cache single item
        $cache_key = 'gamify_point_type_' . $id;
        $point_type = get_transient($cache_key);

        if (false === $point_type) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $point_type = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gamify_point_types WHERE id = %d",
                $id
            ), ARRAY_A);

            if (empty($point_type)) {
                return new \WP_Error('not_found', 'Item not found', ['status' => 404]);
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $requirements = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gamify_requirements 
                 WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1",
                $id
            ), ARRAY_A);

            foreach ($requirements as &$req) {
                $req['parameters'] = json_decode($req['parameters'], true);
            }

            $point_type['requirements'] = $requirements;

            // Cache for 60 seconds
            set_transient($cache_key, $point_type, 60);
        }

        return new \WP_REST_Response($point_type, 200);
    }

    /**
     * Update an existing point type.
     */
    public function update_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        $name = sanitize_text_field($params['name']);
        $plural_name = sanitize_text_field($params['plural_name']);
        $requirements = isset($params['requirements']) ? $params['requirements'] : [];

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->update(
            $wpdb->prefix . 'gamify_point_types',
            ['name' => $name, 'plural_name' => $plural_name],
            ['id' => $id],
            ['%s', '%s'],
            ['%d']
        );

        $table_req = $wpdb->prefix . 'gamify_requirements';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($table_req, ['reward_type' => 'point_type', 'reward_id' => $id], ['%s', '%d']);

        if (!empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';
                $parameters  = isset($req['parameters']) ? json_encode($req['parameters']) : '{}';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->insert($table_req, [
                    'reward_type' => 'point_type',
                    'reward_id'   => $id,
                    'trigger_key' => $trigger_key,
                    'action_type' => $action_type,
                    'parameters'  => $parameters,
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql')
                ], ['%s', '%d', '%s', '%s', '%s', '%d', '%s']);
            }
        }

        delete_transient('gamify_point_types_list');
        delete_transient('gamify_point_type_' . $id);

        return new \WP_REST_Response(['message' => 'Updated successfully.'], 200);
    }

    /**
     * Delete a point type.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $table = $wpdb->prefix . 'gamify_point_types';

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE id = %d", $id));

        if (!$exists) {
            return new \WP_Error('not_found', 'Point type not found.', ['status' => 404]);
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $deleted = $wpdb->delete($table, ['id' => $id], ['%d']);

        if ($deleted) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->delete(
                $wpdb->prefix . 'gamify_requirements',
                ['reward_type' => 'point_type', 'reward_id' => $id],
                ['%s', '%d']
            );

            delete_transient('gamify_point_types_list');
            delete_transient('gamify_point_type_' . $id);

            return new \WP_REST_Response(['message' => 'Deleted successfully.', 'id' => $id], 200);
        }

        return new \WP_REST_Response(['message' => 'Could not delete item.'], 500);
    }
}
