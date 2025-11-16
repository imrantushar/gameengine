<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\System\TriggerRegistry;

if (! defined('ABSPATH')) exit;

class TriggersController extends BaseController
{
    protected $rest_base = 'triggers';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            ['methods' => \WP_REST_Server::READABLE, 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'admin_permission_check']],
            ['methods' => \WP_REST_Server::EDITABLE, 'callback' => [$this, 'save_items'], 'permission_callback' => [$this, 'admin_permission_check']],
        ]);
    }

    public function get_items(\WP_REST_Request $request)
    {
        $available_triggers = TriggerRegistry::get_all();
        $available_labels = array_map(function ($trigger) {
            return $trigger['label'];
        }, $available_triggers);

        global $wpdb;
        $active_triggers_raw = $wpdb->get_results("SELECT trigger_key, points_to_award FROM {$wpdb->prefix}gamify_triggers WHERE is_active = 1", OBJECT_K);
        $active_triggers = array_map('intval', wp_list_pluck($active_triggers_raw, 'points_to_award'));

        return new \WP_REST_Response(['available' => $available_labels, 'active' => $active_triggers], 200);
    }

    public function save_items(\WP_REST_Request $request)
    {
        $active_hooks = $request->get_param('active_hooks');
        if (! is_array($active_hooks)) {
            return new \WP_Error('invalid_data', __('Invalid data format.', 'gamify'), ['status' => 400]);
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gamify_triggers';
        $wpdb->query("UPDATE {$table} SET is_active = 0");

        foreach ($active_hooks as $key => $points) {
            $wpdb->query($wpdb->prepare(
                "INSERT INTO {$table} (trigger_key, points_to_award, is_active) VALUES (%s, %d, 1) ON DUPLICATE KEY UPDATE points_to_award = %d, is_active = 1",
                sanitize_key($key),
                intval($points),
                intval($points)
            ));
        }

        return new \WP_REST_Response(['message' => __('Settings saved successfully.', 'gamify')], 200);
    }
}
