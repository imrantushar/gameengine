<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class PointTypesController
 * Handles API requests for managing Point Types with status support.
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
     * Retrieve a list of point types.
     */
    public function get_items($request)
    {
        global $wpdb;

        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $status   = $request->get_param('status') ? sanitize_text_field($request->get_param('status')) : 'all';
        $offset   = ($page - 1) * $per_page;

        // Whitelist Status Logic.
        $allowed_statuses = array('publish', 'draft', 'pending', 'trash');
        if ($status === 'trash') {
            $status_where = "status = 'trash'";
        } elseif (in_array($status, $allowed_statuses, true)) {
            $status_where = $wpdb->prepare("status = %s", $status);
        } else {
            $status_where = "status != 'trash'";
        }

        $cache_key   = 'gameengine_point_types_' . md5($per_page . $page . $search . $status);
        $cached_data = wp_cache_get($cache_key, 'gameengine_point_types');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, $cached_data['headers']);
        }

        $like_search = '%' . $wpdb->esc_like($search) . '%';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $total_items = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_point_types WHERE ( %s = '' OR name LIKE %s OR plural_name LIKE %s ) AND $status_where",
            $search,
            $like_search,
            $like_search
        ));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_point_types WHERE ( %s = '' OR name LIKE %s OR plural_name LIKE %s ) AND $status_where ORDER BY id DESC LIMIT %d OFFSET %d",
            $search,
            $like_search,
            $like_search,
            $per_page,
            $offset
        ), ARRAY_A);

        if (! empty($results)) {
            foreach ($results as &$pt) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1", absint($pt['id'])), ARRAY_A);
                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $pt['requirements'] = $reqs;
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);
        $headers     = array(
            'X-WP-Total'      => $total_items,
            'X-WP-TotalPages' => $total_pages,
        );

        wp_cache_set($cache_key, array('results' => $results, 'headers' => $headers), 'gameengine_point_types', 60);

        return new \WP_REST_Response($results, 200, $headers);
    }

    /**
     * Create a new point type.
     */
    public function create_item($request)
    {
        global $wpdb;
        $params = $request->get_json_params();
        $name   = isset($params['name']) ? sanitize_text_field($params['name']) : '';

        if (empty($name)) {
            return new \WP_Error('invalid_data', 'Point Name is required.', array('status' => 400));
        }

        $base_slug = sanitize_title($name);
        $slug      = $base_slug;
        $counter   = 1;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s", $slug))) {
            $slug = $base_slug . '-' . $counter;
            $counter++;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $inserted = $wpdb->insert(
            "{$wpdb->prefix}gameengine_point_types",
            array(
                'name'        => $name,
                'plural_name' => isset($params['plural_name']) ? sanitize_text_field($params['plural_name']) : '',
                'slug'        => $slug,
                'status'      => isset($params['status']) ? sanitize_text_field($params['status']) : 'publish',
                'created_at'  => current_time('mysql'),
            ),
            array('%s', '%s', '%s', '%s', '%s')
        );

        if (! $inserted) {
            return new \WP_Error('db_error', 'Could not save point type.', array('status' => 500));
        }

        $point_type_id = $wpdb->insert_id;
        $this->save_requirements($point_type_id, $params['requirements'] ?? array());

        wp_cache_delete('gameengine_point_types_list', 'gameengine_point_types');

        return new \WP_REST_Response(array('message' => 'Point Type saved.', 'id' => $point_type_id), 201);
    }

    /**
     * Update an existing point type.
     */
    public function update_item($request)
    {
        global $wpdb;
        $id     = absint($request->get_param('id'));
        $params = $request->get_json_params();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->update(
            "{$wpdb->prefix}gameengine_point_types",
            array(
                'name'        => sanitize_text_field($params['name']),
                'plural_name' => sanitize_text_field($params['plural_name']),
                'status'      => sanitize_text_field($params['status']),
            ),
            array('id' => absint($id)),
            array('%s', '%s', '%s'),
            array('%d')
        );

        $this->save_requirements($id, $params['requirements'] ?? array());

        wp_cache_delete('gameengine_point_type_full_' . $id, 'gameengine_point_types');
        return new \WP_REST_Response(array('message' => 'Updated successfully.'), 200);
    }

    /**
     * Internal helper to save point requirements.
     */
    private function save_requirements($id, $requirements)
    {
        global $wpdb;
        $table_req = "{$wpdb->prefix}gameengine_requirements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete($table_req, array('reward_type' => 'point_type', 'reward_id' => absint($id)), array('%s', '%d'));

        if (! empty($requirements) && is_array($requirements)) {
            foreach ($requirements as $req) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->insert($table_req, array(
                    'reward_type' => 'point_type',
                    'reward_id'   => absint($id),
                    'trigger_key' => sanitize_text_field($req['trigger_key']),
                    'action_type' => sanitize_text_field($req['action_type'] ?? 'award'),
                    'parameters'  => wp_json_encode($req['parameters']),
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql'),
                ));
            }
        }
    }

    /**
     * Retrieve a single point type details.
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));
        $cache_key = 'gameengine_point_type_full_' . $id;
        $point_type = wp_cache_get($cache_key, 'gameengine_point_types');

        if (false === $point_type) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $point_type = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_point_types WHERE id = %d", $id), ARRAY_A);

            if ($point_type) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'point_type' AND reward_id = %d AND is_active = 1", $id), ARRAY_A);
                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $point_type['requirements'] = $reqs;
            }
            wp_cache_set($cache_key, $point_type, 'gameengine_point_types', 300);
        }
        return new \WP_REST_Response($point_type, 200);
    }

    /**
     * Delete a point type.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_point_types", array('id' => absint($id)), array('%d'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_requirements", array('reward_type' => 'point_type', 'reward_id' => absint($id)), array('%s', '%d'));

        wp_cache_delete('gameengine_point_type_full_' . $id, 'gameengine_point_types');
        return new \WP_REST_Response(array('message' => 'Deleted successfully.'), 200);
    }

    /**
     * Get collection parameters.
     */
    public function get_collection_params()
    {
        return array(
            'page'     => array('default' => 1, 'sanitize_callback' => 'absint'),
            'per_page' => array('default' => 20, 'sanitize_callback' => 'absint'),
            'search'   => array('default' => '', 'sanitize_callback' => 'sanitize_text_field'),
            'status'   => array('default' => 'all', 'sanitize_callback' => 'sanitize_text_field'),
        );
    }
}
