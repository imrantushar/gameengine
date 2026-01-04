<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class LevelsController
 * Handles API requests for gamification levels.
 */
class LevelsController extends BaseController
{
    /**
     * @var string
     */
    protected $rest_base = 'levels';

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
     * Retrieve all levels.
     */
    public function get_items($request)
    {
        // Cache Strategy (60 Seconds)
        $cache_key = 'gamify_levels_list';
        $results = get_transient($cache_key);

        if (false === $results) {
            global $wpdb;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC, min_points ASC", ARRAY_A);

            set_transient($cache_key, $results, 60);
        }

        return new \WP_REST_Response($results, 200);
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
     * Save (Create/Update) a level.
     */
    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'gamify_levels';

        $data = [
            'title'                      => sanitize_text_field($params['title']),
            'plural_name'                => sanitize_text_field($params['plural_name']),
            'icon'                       => sanitize_text_field($params['icon']),
            'category'                   => sanitize_text_field($params['category']),
            'congratulations_message'    => wp_kses_post($params['congratulations_message']),
            'unlock_with_points_enabled' => !empty($params['unlock_with_points_enabled']) ? 1 : 0,
            'point_type_id'              => intval($params['point_type_id']),
            'min_points'                 => intval($params['min_points']),
            'max_points'                 => intval($params['max_points']),
            'priority'                   => intval($params['priority']),
            'created_at'                 => current_time('mysql'),
        ];

        if ($id) {
            unset($data['created_at']);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->update($table, $data, ['id' => $id]);
            $level_id = $id;

            // Clear single item cache
            delete_transient('gamify_level_' . $id);
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->insert($table, $data);
            $level_id = $wpdb->insert_id;
        }

        // Save Requirements
        if (empty($data['unlock_with_points_enabled'])) {
            $this->save_requirements($level_id, $params['requirements'] ?? []);
        }

        // Clear list cache
        delete_transient('gamify_levels_list');

        return new \WP_REST_Response(['id' => $level_id, 'message' => 'Saved successfully'], 200);
    }

    private function save_requirements($level_id, $requirements)
    {
        global $wpdb;
        $table_req = $wpdb->prefix . 'gamify_requirements';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($table_req, ['reward_type' => 'level', 'reward_id' => $level_id]);

        if (!empty($requirements)) {
            foreach ($requirements as $req) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->insert($table_req, [
                    'reward_type' => 'level',
                    'reward_id'   => $level_id,
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
     * Retrieve a single level.
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');

        $cache_key = 'gamify_level_' . $id;
        $item = get_transient($cache_key);

        if (false === $item) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gamify_levels WHERE id = %d", $id), ARRAY_A);

            if (!$item) {
                return new \WP_Error('not_found', 'Level not found', ['status' => 404]);
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $reqs = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE reward_type = 'level' AND reward_id = %d",
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
     * Delete a level.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($wpdb->prefix . 'gamify_levels', ['id' => $id]);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete($wpdb->prefix . 'gamify_requirements', ['reward_type' => 'level', 'reward_id' => $id]);

        // Clear Caches
        delete_transient('gamify_levels_list');
        delete_transient('gamify_level_' . $id);

        return new \WP_REST_Response(['message' => 'Deleted'], 200);
    }
}
