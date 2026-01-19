<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AchievementsController
 * Handles API requests for achievements including restrictions and full data returns.
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
     * Retrieve achievements with pagination and search.
     */
    public function get_items($request)
    {
        global $wpdb;

        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $offset   = ($page - 1) * $per_page;

        $cache_key   = 'gamify_ach_list_' . md5($per_page . $page . $search);
        $cached_data = wp_cache_get($cache_key, 'gamify_achievements');

        if (false !== $cached_data) {
            return new \WP_REST_Response($cached_data['results'], 200, $cached_data['headers']);
        }

        $like_search = '%' . $wpdb->esc_like($search) . '%';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total_items = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_achievements WHERE ( %s = '' OR title LIKE %s OR plural_name LIKE %s )",
                $search,
                $like_search,
                $like_search
            )
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gamify_achievements 
                WHERE ( %s = '' OR title LIKE %s OR plural_name LIKE %s ) 
                ORDER BY id DESC LIMIT %d OFFSET %d",
                $search,
                $like_search,
                $like_search,
                $per_page,
                $offset
            ),
            ARRAY_A
        );

        if (! empty($results)) {
            foreach ($results as &$ach) {
                $ach['unlock_with_points_enabled'] = (bool) $ach['unlock_with_points_enabled'];
                $ach['is_restricted']             = isset($ach['is_restricted']) ? (bool) $ach['is_restricted'] : false;

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE reward_type = 'achievement' AND reward_id = %d AND is_active = 1",
                        absint($ach['id'])
                    ),
                    ARRAY_A
                );

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

        wp_cache_set($cache_key, array('results' => $results, 'headers' => $headers), 'gamify_achievements', 60);

        return new \WP_REST_Response($results, 200, $headers);
    }

    /**
     * Create Item.
     */
    public function create_item($request)
    {
        return $this->save_item($request);
    }

    /**
     * Update Item.
     */
    public function update_item($request)
    {
        return $this->save_item($request, $request->get_param('id'));
    }

    /**
     * Save (Create/Update) achievement and return full updated data.
     */
    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();
        $table  = "{$wpdb->prefix}gamify_achievements";

        $data = array(
            'title'                      => sanitize_text_field($params['title']),
            'plural_name'                => sanitize_text_field($params['plural_name']),
            'max_earnings_per_user'      => intval($params['max_earnings_per_user']),
            'unlock_with_points_enabled' => ! empty($params['unlock_with_points_enabled']) ? 1 : 0,
            'is_restricted'              => ! empty($params['is_restricted']) ? 1 : 0, // 
            'required_points_amount'     => intval($params['required_points_amount']),
            'category'                   => sanitize_text_field($params['category']),
            'required_point_type_id'     => intval($params['required_point_type_id']),
            'congratulations_message'    => wp_kses_post($params['congratulations_message']),
            'required_achievement_id'    => ! empty($params['required_achievement_id']) ? intval($params['required_achievement_id']) : null,
            'required_level_id'          => ! empty($params['required_level_id']) ? intval($params['required_level_id']) : null,
            'restriction_message'        => sanitize_text_field($params['restriction_message'] ?? ''),
            'created_at'                 => current_time('mysql'),
        );

        if ($id) {
            unset($data['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->update($table, $data, array('id' => absint($id)));
            $achievement_id = absint($id);
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert($table, $data);
            $achievement_id = $wpdb->insert_id;
        }

        // Save Triggers/Requirements.
        $this->save_requirements($achievement_id, $params['requirements'] ?? array());

        // Clear Caches.
        delete_transient('gamify_achievements_list');
        wp_cache_delete('gamify_ach_list_', 'gamify_achievements');

        //  Return full data instead of just the ID.
        return $this->get_full_item_response($achievement_id);
    }

    /**
     * Helper to fetch full achievement details for the response.
     */
    private function get_full_item_response($id)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gamify_achievements WHERE id = %d", $id), ARRAY_A);

        if ($item) {
            $item['unlock_with_points_enabled'] = (bool) $item['unlock_with_points_enabled'];
            $item['is_restricted']             = (bool) $item['is_restricted'];

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $reqs = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE reward_type = 'achievement' AND reward_id = %d",
                    $id
                ),
                ARRAY_A
            );

            foreach ($reqs as &$r) {
                $r['parameters'] = json_decode($r['parameters'], true);
            }
            $item['requirements'] = $reqs;
        }

        return new \WP_REST_Response($item, 200);
    }

    /**
     * Save requirements helper.
     */
    private function save_requirements($achievement_id, $requirements)
    {
        global $wpdb;
        $table_req = "{$wpdb->prefix}gamify_requirements";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->delete($table_req, array('reward_type' => 'achievement', 'reward_id' => $achievement_id));

        if (! empty($requirements)) {
            foreach ($requirements as $req) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->insert(
                    $table_req,
                    array(
                        'reward_type' => 'achievement',
                        'reward_id'   => $achievement_id,
                        'trigger_key' => sanitize_text_field($req['trigger_key']),
                        'action_type' => 'award',
                        'parameters'  => wp_json_encode($req['parameters']),
                        'is_active'   => 1,
                        'created_at'  => current_time('mysql'),
                    )
                );
            }
        }
    }

    /**
     * Retrieve a single achievement.
     */
    public function get_item($request)
    {
        return $this->get_full_item_response(absint($request->get_param('id')));
    }

    /**
     * Delete an achievement.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->delete("{$wpdb->prefix}gamify_achievements", array('id' => $id));
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->delete("{$wpdb->prefix}gamify_requirements", array('reward_type' => 'achievement', 'reward_id' => $id));

        return new \WP_REST_Response(array('message' => 'Deleted'), 200);
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
        );
    }
}
