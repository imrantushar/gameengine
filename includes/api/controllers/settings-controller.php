<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SettingsController
 * Unified endpoint for plugin settings.
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
     * Returns all settings. Pro data is injected via filter if active.
     */
    public function get_settings()
    {
        // Default Free Settings: Logs & Emails
        $all_settings = array(
            'logs' => get_option('gameengine_log_settings', array(
                'display_cycle'  => 'immediate',
                'retention_days' => '0',
                'log_levels'     => array('success', 'error'),
            )),
            'email_templates' => get_option('gameengine_email_templates', array(
                'milestone_subject' => '',
                'milestone_body'    => '',
                'level_subject'     => '',
                'level_body'        => '',
                'achievement_subject' => '',
                'achievement_body'  => '',
                'inactivity_days'   => '7',
                'inactivity_subject'=> '',
                'inactivity_body'   => '',
            )),
            'config' => array()
        );

        /**
         * Filter: gameengine_settings_data
         * Allows Pro version to inject economy, marketplace, and payout data.
         */
        $all_settings = apply_filters('gameengine_settings_data', $all_settings);

        return new \WP_REST_Response($all_settings, 200);
    }

    /**
     * Updates settings.
     */
    public function update_settings($request)
    {
        $params = $request->get_json_params();

        if (isset($params['logs'])) {
            update_option('gameengine_log_settings', array_map('sanitize_text_field', (array) $params['logs']));
        }

        if (isset($params['email_templates'])) {
            $email_settings = array();
            foreach((array) $params['email_templates'] as $key => $val) {
                if (strpos($key, '_body') !== false) {
                    $email_settings[$key] = wp_kses_post($val);
                } else {
                    $email_settings[$key] = sanitize_text_field($val);
                }
            }
            update_option('gameengine_email_templates', $email_settings);
        }

        /**
         * Action: gameengine_save_pro_settings
         * Triggers the Pro version to save its respective settings.
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
