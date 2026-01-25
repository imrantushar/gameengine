<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Controller for managing Point Types via REST API.
 */
class PointTypesController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'point-types';

    /**
     * Register routes for Point Types.
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
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'create_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'delete_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Retrieve a list of point types with pagination and search.
     */
    public function get_items($request)
    {
        global $wpdb;

        //  Sanitize Inputs.
        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $offset   = ($page - 1) * $per_page;

        //  Cache Logic.
        $cache_key   = 'gameengine_point_types_' . md5($per_page . $page . $search);
        $cached_data = wp_cache_get($cache_key, 'gameengine_point_types');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, $cached_data['headers']);
        }

        $like_search = '%' . $wpdb->esc_like($search) . '%';

        //  Count Query.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total_items = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_point_types WHERE ( %s = '' OR name LIKE %s OR plural_name LIKE %s )",
            $search,
            $like_search,
            $like_search
        ));

        //  Main Query.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_point_types 
            WHERE ( %s = '' OR name LIKE %s OR plural_name LIKE %s ) 
            ORDER BY id DESC LIMIT %d OFFSET %d",
            $search,
            $like_search,
            $like_search,
            $per_page,
            $offset
        ), ARRAY_A);

        // Attach Requirements to paginated results.
        if (! empty($results)) {
            foreach ($results as &$pt) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1",
                    absint($pt['id'])
                ), ARRAY_A);

                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $pt['requirements'] = $reqs;
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);
        $headers = [
            'X-WP-Total'      => $total_items,
            'X-WP-TotalPages' => $total_pages,
        ];

        wp_cache_set($cache_key, ['results' => $results, 'headers' => $headers], 'gameengine_point_types', 60);

        return new \WP_REST_Response($results, 200, $headers);
    }

    /**
     * Create a new point type.
     */
    public function create_item($request)
    {
        global $wpdb;

        $params       = $request->get_json_params();
        $name         = isset($params['name']) ? sanitize_text_field($params['name']) : '';
        $plural_name  = isset($params['plural_name']) ? sanitize_text_field($params['plural_name']) : '';
        $requirements = isset($params['requirements']) ? $params['requirements'] : array();

        if (empty($name)) {
            return new \WP_Error('invalid_data', 'Point Name is required.', array('status' => 400));
        }

        $base_slug = sanitize_title($name);
        $slug      = $base_slug;
        $counter   = 1;

        // Check for slug existence.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s", $slug))) {
            $slug    = $base_slug . '-' . $counter;
            $counter++;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $inserted = $wpdb->insert(
            "{$wpdb->prefix}gameengine_point_types",
            array(
                'name'        => $name,
                'plural_name' => $plural_name,
                'slug'        => $slug,
                'created_at'  => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%s')
        );

        if (false === $inserted) {
            return new \WP_Error('db_error', 'Could not save point type.', array('status' => 500));
        }

        $point_type_id = $wpdb->insert_id;

        if (! empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';
                $parameters  = isset($req['parameters']) ? wp_json_encode($req['parameters']) : '{}';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->insert(
                    "{$wpdb->prefix}gameengine_requirements",
                    array(
                        'reward_type' => 'point_type',
                        'reward_id'   => $point_type_id,
                        'trigger_key' => $trigger_key,
                        'action_type' => $action_type,
                        'parameters'  => $parameters,
                        'is_active'   => 1,
                        'created_at'  => current_time('mysql'),
                    ),
                    array('%s', '%d', '%s', '%s', '%s', '%d', '%s')
                );
            }
        }

        delete_transient('gameengine_point_types_list');

        return new \WP_REST_Response(
            array(
                'message' => __('Point Type saved successfully.', 'gameengine'),
                'id'      => $point_type_id,
                'slug'    => $slug,
            ),
            201
        );
    }

    /**
     * Retrieve a single point type.
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        $cache_key  = 'gameengine_point_type_' . $id;
        $point_type = get_transient($cache_key);

        if (false === $point_type) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $point_type = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_point_types WHERE id = %d", $id), ARRAY_A);

            if (empty($point_type)) {
                return new \WP_Error('not_found', 'Item not found', array('status' => 404));
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $requirements = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1",
                    $id
                ),
                ARRAY_A
            );

            if (! empty($requirements)) {
                foreach ($requirements as &$req) {
                    $req['parameters'] = json_decode($req['parameters'], true);
                }
            }

            $point_type['requirements'] = $requirements;
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
        $id           = absint($request->get_param('id'));
        $params       = $request->get_json_params();
        $name         = sanitize_text_field($params['name']);
        $plural_name  = sanitize_text_field($params['plural_name']);
        $requirements = isset($params['requirements']) ? $params['requirements'] : array();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->update(
            "{$wpdb->prefix}gameengine_point_types",
            array(
                'name'        => $name,
                'plural_name' => $plural_name,
            ),
            array('id' => $id),
            array('%s', '%s'),
            array('%d')
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->delete("{$wpdb->prefix}gameengine_requirements", array('reward_type' => 'point_type', 'reward_id' => $id), array('%s', '%d'));

        if (! empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                $trigger_key = isset($req['trigger_key']) ? sanitize_text_field($req['trigger_key']) : '';
                $action_type = isset($req['action_type']) ? sanitize_text_field($req['action_type']) : 'award';
                $parameters  = isset($req['parameters']) ? wp_json_encode($req['parameters']) : '{}';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->insert(
                    "{$wpdb->prefix}gameengine_requirements",
                    array(
                        'reward_type' => 'point_type',
                        'reward_id'   => $id,
                        'trigger_key' => $trigger_key,
                        'action_type' => $action_type,
                        'parameters'  => $parameters,
                        'is_active'   => 1,
                        'created_at'  => current_time('mysql'),
                    ),
                    array('%s', '%d', '%s', '%s', '%s', '%d', '%s')
                );
            }
        }

        delete_transient('gameengine_point_types_list');
        delete_transient('gameengine_point_type_' . $id);

        return new \WP_REST_Response(array('message' => 'Updated successfully.'), 200);
    }

    /**
     * Delete a point type.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE id = %d", $id));

        if (! $exists) {
            return new \WP_Error('not_found', 'Point type not found.', array('status' => 404));
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $deleted = $wpdb->delete("{$wpdb->prefix}gameengine_point_types", array('id' => $id), array('%d'));

        if ($deleted) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->delete(
                "{$wpdb->prefix}gameengine_requirements",
                array(
                    'reward_type' => 'point_type',
                    'reward_id'   => $id,
                ),
                array('%s', '%d')
            );

            delete_transient('gameengine_point_types_list');
            delete_transient('gameengine_point_type_' . $id);

            return new \WP_REST_Response(array('message' => 'Deleted successfully.', 'id' => $id), 200);
        }

        return new \WP_REST_Response(array('message' => 'Could not delete item.'), 500);
    }

    /**
     * Get collection parameters for pagination and search.
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
