<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

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
        // GET Addons status (Key-Value format)
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

        // UPDATE Addon Status
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
     * Returns all addons with their active/inactive status as a boolean object.
     * Format: { "email": true, "woocommerce": false }
     *
     * @return \WP_REST_Response
     */
    public function get_addons()
    {
        return new \WP_REST_Response($this->get_addons_status_mapped(), 200);
    }

    /**
     * Updates the status of a specific addon.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_addons($request)
    {
        $params     = $request->get_json_params();
        $addon_name = isset($params['addon']) ? sanitize_key($params['addon']) : '';
        $status     = isset($params['status']) ? (bool) $params['status'] : false;

        if (empty($addon_name)) {
            return new \WP_Error('missing_data', 'Addon name is required.', array('status' => 400));
        }

        $active_addons = get_option('gamify_active_addons', array());

        if ($status) {
            // Activate Addon
            if (! in_array($addon_name, $active_addons, true)) {
                $active_addons[] = $addon_name;
            }
        } else {
            // Deactivate Addon
            $active_addons = array_diff($active_addons, array($addon_name));
        }

        // Save updated list back to options
        update_option('gamify_active_addons', array_values($active_addons));

        // Reset Registry and Force JSON Regeneration
        if (class_exists('\Gamify\Classes\TriggerRegistry')) {
            \Gamify\Classes\TriggerRegistry::reset();
        }

        if (class_exists('\Gamify\Classes\JsonGenerator')) {
            \Gamify\Classes\JsonGenerator::generate();
        }

        return new \WP_REST_Response(
            array(
                'message'       => 'Addon status updated.',
                'active_addons' => $this->get_addons_status_mapped(), // Return mapped format
            ),
            200
        );
    }

    /**
     * Helper to map active addons to a Key-Value pair boolean object.
     *
     * @return array
     */
    private function get_addons_status_mapped()
    {
        $active_addons = get_option('gamify_active_addons', array());
        $all_addons    = array('email', 'woocommerce', 'storeengine');

        $mapped = array();
        foreach ($all_addons as $slug) {
            $mapped[$slug] = in_array($slug, $active_addons, true);
        }

        return $mapped;
    }
}
