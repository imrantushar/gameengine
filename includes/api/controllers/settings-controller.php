<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (!defined('ABSPATH')) exit;

class SettingsController extends BaseController
{
    protected $rest_base = 'settings/logs';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_log_settings'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'update_log_settings'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function get_log_settings()
    {
        $defaults = [
            'display_cycle'  => 'immediate', // immediate, daily, weekly
            'retention_days' => 90,          // 30, 90, 0 (forever)
            'log_levels'     => ['success', 'error']
        ];
        $settings = get_option('gamify_log_settings', $defaults);
        return new \WP_REST_Response($settings, 200);
    }

    public function update_log_settings($request)
    {
        $params = $request->get_json_params();

        $settings = [
            'display_cycle'  => sanitize_text_field($params['display_cycle']),
            'retention_days' => absint($params['retention_days']),
            'log_levels'     => array_map('sanitize_text_field', (array)$params['log_levels'])
        ];

        update_option('gamify_log_settings', $settings);
        return new \WP_REST_Response(['message' => 'Log settings updated.'], 200);
    }
}
