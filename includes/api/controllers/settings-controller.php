<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SettingsController
 * Handles both Free settings and Pro placeholders for the UI.
 */
class SettingsController extends BaseController
{
    protected $rest_base = 'settings';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
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
        ));
    }

    /**
     * Returns grouped settings for the UI.
     */
    public function get_settings()
    {
        // 1. Logs Settings (Free)
        $log_defaults = array(
            'display_cycle'  => 'immediate',
            'retention_days' => '0',
            'log_levels'     => array('success', 'error'),
        );

        // 2. Economy Settings (Pro Placeholder)
        $economy_defaults = array(
            'enable_gateway'         => false,
            'enable_partial_payment' => false,
            'conversion_rate'        => 100,
            'allowed_roles'          => array('administrator'),
        );

        $all_settings = array(
            'logs'    => get_option('gameengine_log_settings', $log_defaults),
            'economy' => get_option('gameengine_pro_economy_settings', $economy_defaults),
            'config'  => array(
                'is_pro' => class_exists('\GameEngine\Pro\Pro_Init'), // Check if Pro is active
            )
        );

        return new \WP_REST_Response($all_settings, 200);
    }

    /**
     * Updates settings. Free fields are saved directly, Pro fields via hook.
     */
    public function update_settings($request)
    {
        $params = $request->get_json_params();

        // Save Free Settings: Logs
        if (isset($params['logs'])) {
            $log_data = $params['logs'];
            $settings = array(
                'display_cycle'  => sanitize_text_field($log_data['display_cycle']),
                'retention_days' => sanitize_text_field($log_data['retention_days']),
                'log_levels'     => array_map('sanitize_text_field', (array) $log_data['log_levels']),
            );
            update_option('gameengine_log_settings', $settings);
        }

        /**
         * ACTION HOOK: gameengine_save_pro_settings
         * This allows the Pro version to intercept the request and save its own settings.
         */
        do_action('gameengine_save_pro_settings', $params);

        return new \WP_REST_Response(
            array(
                'message'  => __('Settings saved successfully.', 'gameengine'),
                'settings' => $this->get_settings()->get_data(),
            ),
            200
        );
    }
}
