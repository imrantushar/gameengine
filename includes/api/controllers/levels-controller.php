<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class LevelsController
 * Handles API requests for levels with Taxonomy support.
 */
class LevelsController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'levels';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
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
        ));

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
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
        ));
    }

    /**
     * Retrieve a list of levels with status and search filtering.
     */
    public function get_items($request)
    {
        global $wpdb;

        $per_page = min(100, max(1, $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20));
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $status   = $request->get_param('status') ? sanitize_text_field($request->get_param('status')) : 'all';
        $offset   = ($page - 1) * $per_page;

        // Build Status Filter with Whitelist to satisfy security checks.
        $allowed_statuses = array('publish', 'draft', 'pending', 'trash');
        if ($status === 'trash') {
            $status_where = "status = 'trash'";
        } elseif (in_array($status, $allowed_statuses, true)) {
            $status_where = $wpdb->prepare("status = %s", $status);
        } else {
            $status_where = "status != 'trash'";
        }

        $cache_key   = 'gameengine_lvl_list_' . md5($per_page . $page . $search . $status);
        $cached_data = wp_cache_get($cache_key, 'gameengine_levels');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, $cached_data['headers']);
        }

        $like_search = '%' . $wpdb->esc_like($search) . '%';
        $table_name  = $wpdb->prefix . 'gameengine_levels';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $total_items = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM $table_name WHERE ( %s = '' OR title LIKE %s ) AND $status_where", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is built from $wpdb->prefix and $status_where is prepared above; user input uses placeholders.
            $search,
            $like_search
        ));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE ( %s = '' OR title LIKE %s ) AND $status_where ORDER BY id DESC LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is built from $wpdb->prefix and $status_where is prepared above; user input uses placeholders.
            $search,
            $like_search,
            $per_page,
            $offset
        ), ARRAY_A);

        if (! empty($results)) {
            foreach ($results as &$lvl) {
                $lvl['unlock_with_points_enabled'] = (bool) $lvl['unlock_with_points_enabled'];
                $lvl['is_restricted']             = (bool) ($lvl['is_restricted'] ?? false);

                // Resolve Category Name.
                $term_id            = absint($lvl['category']);
                $term               = get_term($term_id, 'level_type');
                $lvl['category_id']   = $term_id;
                $lvl['category_name'] = (! is_wp_error($term) && $term) ? $term->name : '';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'level' AND reward_id = %d AND is_active = 1", absint($lvl['id'])), ARRAY_A);
                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $lvl['requirements'] = $reqs;
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);
        $headers     = array('X-WP-Total' => $total_items, 'X-WP-TotalPages' => $total_pages);

        wp_cache_set($cache_key, array('results' => $results, 'headers' => $headers), 'gameengine_levels', 60);

        return new \WP_REST_Response($results, 200, $headers);
    }

    /**
     * Create a new level.
     */
    public function create_item($request)
    {
        return $this->save_item($request);
    }

    /**
     * Update an existing level.
     */
    public function update_item($request)
    {
        return $this->save_item($request, $request->get_param('id'));
    }

    /**
     * Core logic to save or update a level.
     */
    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();
        if (empty($params['title'])) {
            return new \WP_Error('missing_data', __('Level Name is required.', 'gameengine'), array('status' => 400));
        }

        $data = array(
            'title'                      => sanitize_text_field($params['title']),
            'plural_name'                => sanitize_text_field($params['plural_name']),
            'description'                => wp_kses_post($params['description'] ?? ''),
            'status'                     => !empty($params['status']) ? sanitize_text_field($params['status']) : 'publish',
            'icon'                       => sanitize_text_field($params['icon']),
            'category'                   => absint($params['category_id'] ?? 0),
            'congratulations_message'    => wp_kses_post($params['congratulations_message']),
            'unlock_with_points_enabled' => ! empty($params['unlock_with_points_enabled']) ? 1 : 0,
            'is_restricted'              => ! empty($params['is_restricted']) ? 1 : 0,
            'point_type_id'              => intval($params['point_type_id']),
            'min_points'                 => intval($params['min_points']),
            'max_points'                 => intval($params['max_points']),
            'priority'                   => intval($params['priority']),
            'required_achievement_id'    => ! empty($params['required_achievement_id']) ? intval($params['required_achievement_id']) : null,
            'required_level_id'          => ! empty($params['required_level_id']) ? intval($params['required_level_id']) : null,
            'restriction_message'        => sanitize_text_field($params['restriction_message'] ?? ''),
            'created_at'                 => current_time('mysql'),
        );

        if ($id) {
            unset($data['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update("{$wpdb->prefix}gameengine_levels", $data, array('id' => absint($id)));
            $level_id = absint($id);
            wp_cache_delete('gameengine_level_full_' . $level_id, 'gameengine_levels');
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->insert("{$wpdb->prefix}gameengine_levels", $data);
            $level_id = $wpdb->insert_id;
        }

        if (empty($data['unlock_with_points_enabled'])) {
            $this->save_requirements($level_id, $params['requirements'] ?? array());
        }

        wp_cache_delete('gameengine_levels_list', 'gameengine_levels');

        return $this->get_full_item_response($level_id);
    }

    /**
     * Retrieve a single level with full details including requirements.
     */
    private function get_full_item_response($id)
    {
        global $wpdb;
        $id = absint($id);
        $cache_key = 'gameengine_level_full_' . $id;
        $item = wp_cache_get($cache_key, 'gameengine_levels');

        if (false === $item) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", $id), ARRAY_A);

            if ($item) {
                $item['unlock_with_points_enabled'] = (bool) $item['unlock_with_points_enabled'];
                $item['is_restricted'] = (bool) $item['is_restricted'];

                $term_id = absint($item['category']);
                $term = get_term($term_id, 'level_type');
                $item['category_id'] = $term_id;
                $item['category_name'] = (! is_wp_error($term) && $term) ? $term->name : '';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'level' AND reward_id = %d", $id), ARRAY_A);
                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $item['requirements'] = $reqs;
            }
            wp_cache_set($cache_key, $item, 'gameengine_levels', 300);
        }

        return new \WP_REST_Response($item, 200);
    }

    /**
     * Save requirements for a specific level.
     */
    private function save_requirements($level_id, $requirements)
    {
        global $wpdb;
        $table_req = "{$wpdb->prefix}gameengine_requirements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete($table_req, array('reward_type' => 'level', 'reward_id' => absint($level_id)));

        if (! empty($requirements)) {
            foreach ($requirements as $req) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->insert($table_req, array(
                    'reward_type' => 'level',
                    'reward_id'   => absint($level_id),
                    'trigger_key' => sanitize_text_field($req['trigger_key']),
                    'action_type' => 'award',
                    'parameters'  => wp_json_encode($req['parameters']),
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql')
                ));
            }
        }
    }

    /**
     * Get a single level API response.
     */
    public function get_item($request)
    {
        return $this->get_full_item_response(absint($request->get_param('id')));
    }

    /**
     * Delete a level and its associated requirements.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_levels", array('id' => $id));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_requirements", array('reward_type' => 'level', 'reward_id' => $id));

        wp_cache_delete('gameengine_level_full_' . $id, 'gameengine_levels');

        return new \WP_REST_Response(array('message' => 'Deleted'), 200);
    }

    /**
     * Collection parameters for levels list.
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
