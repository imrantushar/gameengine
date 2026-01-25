<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SettingsController
 * Unified endpoint for all plugin settings.
 */
class SettingsController extends BaseController
{

    /**
     * REST route base changed to 'settings'
     *
     * @var string
     */
    protected $rest_base = 'settings';

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
                    'callback'            => array($this, 'get_settings'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'update_settings'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Returns all plugin settings in a grouped format.
     *
     * @return \WP_REST_Response
     */
    public function get_settings()
    {
        // Log Settings Defaults
        $log_defaults = array(
            'display_cycle'  => 'immediate',
            'retention_days' => '0',
            'log_levels'     => array('success', 'error'),
        );

        // Combine all settings into one response
        $all_settings = array(
            'logs' => get_option('gamify_log_settings', $log_defaults),
        );

        return new \WP_REST_Response($all_settings, 200);
    }

    /**
     * Updates plugin settings.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function update_settings($request)
    {
        $params = $request->get_json_params();

        // 1. Update Log Settings if provided
        if (isset($params['logs'])) {
            $log_data = $params['logs'];
            $settings = array(
                'display_cycle'  => sanitize_text_field($log_data['display_cycle']),
                'retention_days' => sanitize_text_field($log_data['retention_days']),
                'log_levels'     => array_map('sanitize_text_field', (array) $log_data['log_levels']),
            );
            update_option('gamify_log_settings', $settings);
        }

        return new \WP_REST_Response(
            array(
                'message'  => __('Settings saved successfully.', 'gamify'),
                'settings' => $this->get_settings()->get_data(), // Return latest data
            ),
            200
        );
    }
}
