<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AchievementsController
 * Handles API requests for achievements with Taxonomy support.
 */
class AchievementsController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'achievements';

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
     * Retrieve achievements with resolved category names and status filtering.
     */
    public function get_items($request)
    {
        global $wpdb;

        $per_page = min(100, max(1, $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20));
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $status   = $request->get_param('status') ? sanitize_text_field($request->get_param('status')) : 'all';
        $offset   = ($page - 1) * $per_page;

        // Whitelist Status Logic to satisfy security checks.
        $allowed_statuses = array('publish', 'draft', 'pending', 'trash');
        if ($status === 'trash') {
            $status_where = "status = 'trash'";
        } elseif (in_array($status, $allowed_statuses, true)) {
            $status_where = $wpdb->prepare("status = %s", $status);
        } else {
            $status_where = "status != 'trash'";
        }

        $cache_key   = 'gameengine_ach_list_' . md5($per_page . $page . $search . $status);
        $cached_data = wp_cache_get($cache_key, 'gameengine_achievements');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, $cached_data['headers']);
        }

        $like_search = '%' . $wpdb->esc_like($search) . '%';
        $table_name  = "{$wpdb->prefix}gameengine_achievements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $total_items = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM $table_name WHERE ( %s = '' OR title LIKE %s OR plural_name LIKE %s ) AND $status_where",
            $search,
            $like_search,
            $like_search
        ));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE ( %s = '' OR title LIKE %s OR plural_name LIKE %s ) AND $status_where ORDER BY id DESC LIMIT %d OFFSET %d",
            $search,
            $like_search,
            $like_search,
            $per_page,
            $offset
        ), ARRAY_A);

        if (! empty($results)) {
            foreach ($results as &$ach) {
                $ach['unlock_with_points_enabled'] = (bool) $ach['unlock_with_points_enabled'];
                $ach['is_restricted']             = isset($ach['is_restricted']) ? (bool) $ach['is_restricted'] : false;

                // Resolve Category Name from Taxonomy.
                $term_id             = absint($ach['category']);
                $term                = get_term($term_id, 'achievement_type');
                $ach['category_id']   = $term_id;
                $ach['category_name'] = (! is_wp_error($term) && $term) ? $term->name : '';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'achievement' AND reward_id = %d AND is_active = 1", absint($ach['id'])), ARRAY_A);

                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $ach['requirements'] = $reqs;
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);
        $headers     = array(
            'X-WP-Total'      => $total_items,
            'X-WP-TotalPages' => $total_pages,
        );

        wp_cache_set($cache_key, array('results' => $results, 'headers' => $headers), 'gameengine_achievements', 60);

        return new \WP_REST_Response($results, 200, $headers);
    }

    /**
     * Create a new achievement.
     */
    public function create_item($request)
    {
        return $this->save_item($request);
    }

    /**
     * Update an existing achievement.
     */
    public function update_item($request)
    {
        return $this->save_item($request, $request->get_param('id'));
    }

    /**
     * Core logic to save or update an achievement.
     */
    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();

        if (empty($params['title'])) {
            return new \WP_Error('missing_data', __('Achievement Title is required.', 'gameengine'), array('status' => 400));
        }

        $data = array(
            'title'                      => sanitize_text_field($params['title']),
            'plural_name'                => sanitize_text_field($params['plural_name']),
            'status'                     => !empty($params['status']) ? sanitize_text_field($params['status']) : 'publish',
            'max_earnings_per_user'      => intval($params['max_earnings_per_user']),
            'unlock_with_points_enabled' => ! empty($params['unlock_with_points_enabled']) ? 1 : 0,
            'is_restricted'              => ! empty($params['is_restricted']) ? 1 : 0,
            'required_points_amount'     => intval($params['required_points_amount']),
            'category'                   => absint($params['category_id'] ?? 0),
            'required_point_type_id'     => intval($params['required_point_type_id']),
            'congratulations_message'    => wp_kses_post($params['congratulations_message']),
            'required_achievement_id'    => ! empty($params['required_achievement_id']) ? intval($params['required_achievement_id']) : null,
            'required_level_id'          => ! empty($params['required_level_id']) ? intval($params['required_level_id']) : null,
            'restriction_message'        => sanitize_text_field($params['restriction_message'] ?? ''),
            'created_at'                 => current_time('mysql'),
        );

        if ($id) {
            unset($data['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update("{$wpdb->prefix}gameengine_achievements", $data, array('id' => absint($id)));
            $achievement_id = absint($id);
            wp_cache_delete('gameengine_achievement_full_' . $achievement_id, 'gameengine_achievements');
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->insert("{$wpdb->prefix}gameengine_achievements", $data);
            $achievement_id = $wpdb->insert_id;
        }

        $this->save_requirements($achievement_id, $params['requirements'] ?? array());
        wp_cache_delete('gameengine_achievements_list', 'gameengine_achievements');

        return $this->get_full_item_response($achievement_id);
    }

    /**
     * Retrieve a single achievement with full details.
     */
    private function get_full_item_response($id)
    {
        global $wpdb;
        $id = absint($id);
        $cache_key = 'gameengine_achievement_full_' . $id;
        $item = wp_cache_get($cache_key, 'gameengine_achievements');

        if (false === $item) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", $id), ARRAY_A);

            if ($item) {
                $item['unlock_with_points_enabled'] = (bool) $item['unlock_with_points_enabled'];
                $item['is_restricted']             = (bool) $item['is_restricted'];

                // Resolve Category Name.
                $term_id                = absint($item['category']);
                $term                   = get_term($term_id, 'achievement_type');
                $item['category_id']   = $term_id;
                $item['category_name'] = (! is_wp_error($term) && $term) ? $term->name : '';

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'achievement' AND reward_id = %d", $id), ARRAY_A);
                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $item['requirements'] = $reqs;
            }
            wp_cache_set($cache_key, $item, 'gameengine_achievements', 300);
        }

        return new \WP_REST_Response($item, 200);
    }

    /**
     * Save requirements for a specific achievement.
     */
    private function save_requirements($achievement_id, $requirements)
    {
        global $wpdb;
        $table_req = "{$wpdb->prefix}gameengine_requirements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete($table_req, array('reward_type' => 'achievement', 'reward_id' => absint($achievement_id)));

        if (! empty($requirements)) {
            foreach ($requirements as $req) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->insert($table_req, array(
                    'reward_type' => 'achievement',
                    'reward_id'   => absint($achievement_id),
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
     * Get a single achievement API response.
     */
    public function get_item($request)
    {
        return $this->get_full_item_response(absint($request->get_param('id')));
    }

    /**
     * Delete an achievement and its requirements.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_achievements", array('id' => $id));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_requirements", array('reward_type' => 'achievement', 'reward_id' => $id));

        wp_cache_delete('gameengine_achievement_full_' . $id, 'gameengine_achievements');

        return new \WP_REST_Response(array('message' => 'Deleted'), 200);
    }

    /**
     * Collection parameters for achievements list.
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
