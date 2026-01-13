<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AchievementsController
 * Handles API requests for achievements.
 */
class AchievementsController extends BaseController
{
    /**
     * @var string
     */
    protected $rest_base = 'achievements';

    /**
     * Register REST API routes.
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
        $total_items = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$wpdb->prefix}gamify_achievements WHERE ( %s = '' OR title LIKE %s OR description LIKE %s )",
            $search,
            $like_search,
            $like_search
        ));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gamify_achievements 
            WHERE ( %s = '' OR title LIKE %s OR description LIKE %s ) 
            ORDER BY id DESC LIMIT %d OFFSET %d",
            $search,
            $like_search,
            $like_search,
            $per_page,
            $offset
        ), ARRAY_A);

        if (! empty($results)) {
            foreach ($results as &$ach) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $reqs = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE reward_type = 'achievement' AND reward_id = %d AND is_active = 1",
                    absint($ach['id'])
                ), ARRAY_A);

                foreach ($reqs as &$r) {
                    $r['parameters'] = json_decode($r['parameters'], true);
                }
                $ach['requirements'] = $reqs;
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);
        $headers = ['X-WP-Total' => $total_items, 'X-WP-TotalPages' => $total_pages];

        wp_cache_set($cache_key, ['results' => $results, 'headers' => $headers], 'gamify_achievements', 60);

        return new \WP_REST_Response($results, 200, $headers);
    }

    public function create_item($request)
    {
        return $this->save_item($request);
    }

    public function update_item($request)
    {
        return $this->save_item($request, $request->get_param('id'));
    }

    /**
     * Save (Create/Update) an achievement.
     */
    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'gamify_achievements';

        $data = [
            'title'                      => sanitize_text_field($params['title']),
            'description'                => sanitize_textarea_field($params['description']),
            'max_earnings_per_user'      => intval($params['max_earnings_per_user']),
            'unlock_with_points_enabled' => !empty($params['unlock_with_points_enabled']) ? 1 : 0,
            'required_points_amount'     => intval($params['required_points_amount']),
            'category'                   => sanitize_text_field($params['category']),
            'required_point_type_id'     => intval($params['required_point_type_id']),
            'congratulations_message'    => wp_kses_post($params['congratulations_message']),
            'created_at'                 => current_time('mysql'),
        ];

        if ($id) {
            unset($data['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->update($table, $data, ['id' => $id]);
            $achievement_id = $id;

            // Clear single item cache
            delete_transient('gamify_achievement_' . $id);
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->insert($table, $data);
            $achievement_id = $wpdb->insert_id;
        }

        // Save Requirements (Triggers)
        $this->save_requirements($achievement_id, $params['requirements'] ?? []);

        // Clear list cache
        delete_transient('gamify_achievements_list');

        return new \WP_REST_Response(['id' => $achievement_id, 'message' => 'Saved successfully'], 200);
    }

    private function save_requirements($achievement_id, $requirements)
    {
        global $wpdb;
        $table_req = $wpdb->prefix . 'gamify_requirements';

        // Clear old requirements
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($table_req, ['reward_type' => 'achievement', 'reward_id' => $achievement_id]);

        if (!empty($requirements)) {
            foreach ($requirements as $req) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->insert($table_req, [
                    'reward_type' => 'achievement',
                    'reward_id'   => $achievement_id,
                    'trigger_key' => sanitize_text_field($req['trigger_key']),
                    'action_type' => 'award',
                    'parameters'  => json_encode($req['parameters']),
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql')
                ]);
            }
        }
    }

    /**
     * Retrieve a single achievement.
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');

        $cache_key = 'gamify_achievement_' . $id;
        $item = get_transient($cache_key);

        if (false === $item) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gamify_achievements WHERE id = %d", $id), ARRAY_A);

            if (!$item) {
                return new \WP_Error('not_found', 'Achievement not found', ['status' => 404]);
            }

            // Fetch requirements
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $reqs = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE reward_type = 'achievement' AND reward_id = %d",
                $id
            ), ARRAY_A);

            foreach ($reqs as &$r) {
                $r['parameters'] = json_decode($r['parameters'], true);
            }
            $item['requirements'] = $reqs;

            set_transient($cache_key, $item, 60);
        }

        return new \WP_REST_Response($item, 200);
    }

    /**
     * Delete an achievement.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($wpdb->prefix . 'gamify_achievements', ['id' => $id]);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($wpdb->prefix . 'gamify_requirements', ['reward_type' => 'achievement', 'reward_id' => $id]);

        // Clear Caches
        delete_transient('gamify_achievements_list');
        delete_transient('gamify_achievement_' . $id);

        return new \WP_REST_Response(['message' => 'Deleted'], 200);
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
