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
            'general' => get_option('gameengine_general_settings', array(
                'social_sharing' => true,
            )),
            'notifications' => get_option('gameengine_notification_settings', array(
                'enabled'              => true,
                'notify_points_added'  => true,
                'notify_points_deducted' => true,
                'notify_achievement'   => true,
                'notify_level_up'      => true,
                'notify_rank'          => true,
                'retention_days'       => 30,
            )),
            'buy_points' => array(
                'mappings' => get_option('gameengine_buy_points_mappings', array()),
            ),
            'config' => array(
                'is_pro' => false, // Default is false
            )
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

        if (isset($params['general'])) {
            $general = (array) $params['general'];
            update_option('gameengine_general_settings', array(
                'social_sharing' => ! empty($general['social_sharing']),
            ));
        }

        if (isset($params['notifications'])) {
            $notif = (array) $params['notifications'];
            $sanitized = array(
                'enabled'               => ! empty($notif['enabled']),
                'notify_points_added'   => ! empty($notif['notify_points_added']),
                'notify_points_deducted'=> ! empty($notif['notify_points_deducted']),
                'notify_achievement'    => ! empty($notif['notify_achievement']),
                'notify_level_up'       => ! empty($notif['notify_level_up']),
                'notify_rank'           => ! empty($notif['notify_rank']),
                'retention_days'        => absint($notif['retention_days'] ?? 30),
            );
            update_option('gameengine_notification_settings', $sanitized);
        }

        if (isset($params['buy_points']['mappings'])) {
            $mappings = array();
            foreach ((array) $params['buy_points']['mappings'] as $row) {
                $product_id    = absint($row['product_id'] ?? 0);
                $point_type_id = absint($row['point_type_id'] ?? 0);
                $amount        = absint($row['amount'] ?? 0);
                if ($product_id && $point_type_id && $amount) {
                    $mappings[$product_id] = array($point_type_id, $amount);
                }
            }
            update_option('gameengine_buy_points_mappings', $mappings);
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
