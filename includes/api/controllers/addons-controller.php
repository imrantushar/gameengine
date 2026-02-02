<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AddonsController
 * Handles API requests for fetching and toggling addon statuses.
 */
class AddonsController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'addons';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        // Route to get active status map: { "email": true, ... }
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_addons'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        // NEW Route to get detailed list for UI cards
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/list',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_detailed_addons_list'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        // Route to update/toggle addon status
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'update_addons'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Returns current status of all addons as a boolean map.
     *
     * @return \WP_REST_Response
     */
    public function get_addons()
    {
        return new \WP_REST_Response($this->get_addons_status_mapped(), 200);
    }

    /**
     * Returns detailed list of addons with metadata for frontend UI.
     *
     * @return \WP_REST_Response
     */
    public function get_detailed_addons_list()
    {
        $active_addons = get_option('gameengine_active_addons', array());

        $addons = array(
            array(
                'slug'   => 'academylms',
                'name'   => __('Academy LMS', 'gameengine'),
                'desc'   => __('Reward users for course completions and quiz attempts.', 'gameengine'),
                'icon'   => 'dashicons-welcome-learn-more',
                'active' => in_array('academylms', $active_addons, true),
            ),
            array(
                'slug'   => 'woocommerce',
                'name'   => __('WooCommerce', 'gameengine'),
                'desc'   => __('Integrate gamification with your e-commerce store activities.', 'gameengine'),
                'icon'   => 'dashicons-cart',
                'active' => in_array('woocommerce', $active_addons, true),
            ),
            array(
                'slug'   => 'storeengine',
                'name'   => __('StoreEngine', 'gameengine'),
                'desc'   => __('Advanced WooCommerce features and rewards integration.', 'gameengine'),
                'icon'   => 'dashicons-store',
                'active' => in_array('storeengine', $active_addons, true),
            ),
            array(
                'slug'   => 'restrict_unlock',
                'name'   => __('Restrict Unlock', 'gameengine'),
                'desc'   => __('Set dependencies between achievements and levels.', 'gameengine'),
                'icon'   => 'dashicons-lock',
                'active' => in_array('restrict_unlock', $active_addons, true),
            ),
            array(
                'slug'   => 'progress_map',
                'name'   => __('Progress Map', 'gameengine'),
                'desc'   => __('Display a visual roadmap of user progress on frontend.', 'gameengine'),
                'icon'   => 'dashicons-location-alt',
                'active' => in_array('progress_map', $active_addons, true),
            ),
            array(
                'slug'   => 'restrict_content',
                'name'   => __('Restrict Content', 'gameengine'),
                'desc'   => __('Lock specific posts, pages, images or links based on points and badges.', 'gameengine'),
                'icon'   => 'dashicons-visibility',
                'active' => in_array('restrict_content', $active_addons, true),
            ),
        );

        return new \WP_REST_Response($addons, 200);
    }

    /**
     * Updates the status of a specific addon.
     */
    public function update_addons($request)
    {
        $params     = $request->get_json_params();
        $addon_name = isset($params['addon']) ? sanitize_key($params['addon']) : '';
        $status     = isset($params['status']) ? (bool) $params['status'] : false;

        if (empty($addon_name)) {
            return new \WP_Error('missing_data', 'Addon name is required.', array('status' => 400));
        }

        if (true === $status) {
            if ('academylms' === $addon_name && ! \GameEngine\Helper::is_plugin_active('Academy\Academy')) {
                return new \WP_Error('dependency_missing', 'Academy LMS is required.', array('status' => 424));
            }

            if ('woocommerce' === $addon_name && ! \GameEngine\Helper::is_plugin_active('WooCommerce')) {
                return new \WP_Error('dependency_missing', 'WooCommerce is required.', array('status' => 424));
            }
        }

        $active_addons = get_option('gameengine_active_addons', array());

        if ($status) {
            if (! in_array($addon_name, $active_addons, true)) {
                $active_addons[] = $addon_name;
            }
        } else {
            $active_addons = array_diff($active_addons, array($addon_name));
        }

        update_option('gameengine_active_addons', array_values($active_addons));

        // Reset Triggers and Regenerate JSON
        if (class_exists('\GameEngine\Classes\TriggerRegistry')) {
            \GameEngine\Classes\TriggerRegistry::reset();
        }

        if (class_exists('\GameEngine\Classes\JsonGenerator')) {
            \GameEngine\Classes\JsonGenerator::generate();
        }

        return new \WP_REST_Response(
            array(
                'message'       => 'Addon status updated.',
                'active_addons' => $this->get_addons_status_mapped(),
            ),
            200
        );
    }

    /**
     * Helper to map active addons to a Key-Value pair boolean object.
     */
    private function get_addons_status_mapped()
    {
        $active_addons = get_option('gameengine_active_addons', array());
        $all_addons    = array('academylms', 'woocommerce', 'storeengine', 'restrict_unlock', 'restrict_content', 'progress_map');

        $mapped = array();
        foreach ($all_addons as $slug) {
            $mapped[$slug] = in_array($slug, $active_addons, true);
        }

        return $mapped;
    }
}
