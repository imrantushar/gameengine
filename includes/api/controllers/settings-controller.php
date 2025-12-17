<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) exit;

/**
 * Controller for managing plugin settings.
 */
class SettingsController extends BaseController
{
    protected $rest_base = 'settings';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_settings'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'update_settings'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    /**
     * Get Settings
     */
    public function get_settings($request)
    {
        $settings = [
            // General Settings
            'general' => [
                'level_image_width'  => get_option('gamify_level_img_width', 100),
                'level_image_height' => get_option('gamify_level_img_height', 100),
            ],
            // Email Settings
            'email' => [
                'format'          => get_option('gamify_email_format', 'plain'),
                'schedule'        => get_option('gamify_email_schedule', 'immediate'),
                'from_name'       => get_option('gamify_email_from_name', get_bloginfo('name')),
                'from_address'    => get_option('gamify_email_from_email', get_option('admin_email')),
                'default_content' => get_option('gamify_email_content', ''),
            ]
        ];

        return new \WP_REST_Response($settings, 200);
    }

    /**
     * Update Settings
     */
    public function update_settings($request)
    {
        $params = $request->get_json_params();

        // Update General Settings
        if (isset($params['general'])) {
            update_option('gamify_level_img_width', absint($params['general']['level_image_width']));
            update_option('gamify_level_img_height', absint($params['general']['level_image_height']));
        }

        // Update Email Settings
        if (isset($params['email'])) {
            update_option('gamify_email_format', sanitize_text_field($params['email']['format']));
            update_option('gamify_email_schedule', sanitize_text_field($params['email']['schedule']));
            update_option('gamify_email_from_name', sanitize_text_field($params['email']['from_name']));
            update_option('gamify_email_from_email', sanitize_email($params['email']['from_address']));
            update_option('gamify_email_content', wp_kses_post($params['email']['default_content']));
        }

        return new \WP_REST_Response(['message' => __('Settings saved successfully.', 'gamify')], 200);
    }
}
