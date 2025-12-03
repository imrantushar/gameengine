<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) exit;

class LevelsController extends BaseController
{
    protected $rest_base = 'levels';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            ['methods' => \WP_REST_Server::READABLE, 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'admin_permission_check']],
            ['methods' => \WP_REST_Server::CREATABLE, 'callback' => [$this, 'create_item'], 'permission_callback' => [$this, 'admin_permission_check']],
        ]);

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            ['methods' => \WP_REST_Server::READABLE, 'callback' => [$this, 'get_item'], 'permission_callback' => [$this, 'admin_permission_check']],
            ['methods' => \WP_REST_Server::EDITABLE, 'callback' => [$this, 'update_item'], 'permission_callback' => [$this, 'admin_permission_check']],
            ['methods' => \WP_REST_Server::DELETABLE, 'callback' => [$this, 'delete_item'], 'permission_callback' => [$this, 'admin_permission_check']],
        ]);
    }

    public function get_items($request)
    {
        global $wpdb;
        $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC, min_points ASC", ARRAY_A);
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

    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'gamify_levels';

        $data = [
            'title'                      => sanitize_text_field($params['title']),
            'plural_name'                => sanitize_text_field($params['plural_name']),
            'icon'                       => sanitize_text_field($params['icon']), // Image URL
            'congratulations_message'    => wp_kses_post($params['congratulations_message']),

            // Logic
            'unlock_with_points_enabled' => !empty($params['unlock_with_points_enabled']) ? 1 : 0,
            'point_type_id'              => intval($params['point_type_id']),
            'min_points'                 => intval($params['min_points']),
            'max_points'                 => intval($params['max_points']),
            'priority'                   => intval($params['priority']),

            'created_at'                 => current_time('mysql'),
        ];

        if ($id) {
            unset($data['created_at']);
            $wpdb->update($table, $data, ['id' => $id]);
            $level_id = $id;
        } else {
            $wpdb->insert($table, $data);
            $level_id = $wpdb->insert_id;
        }

        // Save Requirements (If Unlock with points is FALSE)
        if (empty($data['unlock_with_points_enabled'])) {
            $this->save_requirements($level_id, $params['requirements'] ?? []);
        }

        return new \WP_REST_Response(['id' => $level_id, 'message' => 'Saved successfully'], 200);
    }

    private function save_requirements($level_id, $requirements)
    {
        global $wpdb;
        $table_req = $wpdb->prefix . 'gamify_requirements';
        $wpdb->delete($table_req, ['reward_type' => 'level', 'reward_id' => $level_id]);

        if (!empty($requirements)) {
            foreach ($requirements as $req) {
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

    public function get_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gamify_levels WHERE id = %d", $id), ARRAY_A);

        if (!$item) return new \WP_Error('not_found', 'Level not found', ['status' => 404]);

        $reqs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE reward_type = 'level' AND reward_id = %d",
            $id
        ), ARRAY_A);

        foreach ($reqs as &$r) {
            $r['parameters'] = json_decode($r['parameters'], true);
        }
        $item['requirements'] = $reqs;

        return new \WP_REST_Response($item, 200);
    }

    public function delete_item($request)
    {
        global $wpdb;
        $id = $request->get_param('id');
        $wpdb->delete($wpdb->prefix . 'gamify_levels', ['id' => $id]);
        $wpdb->delete($wpdb->prefix . 'gamify_requirements', ['reward_type' => 'level', 'reward_id' => $id]);
        return new \WP_REST_Response(['message' => 'Deleted'], 200);
    }
}
