<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

class AddonsController extends BaseController
{
    protected $rest_base = 'addons';

    public function register_routes()
    {
        // GET Active Addons
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_addons'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
            // UPDATE Addon Status
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'update_addons'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function get_addons()
    {
        $active_addons = get_option('gamify_active_addons', []);
        return new \WP_REST_Response($active_addons, 200);
    }

    public function update_addons($request)
    {
        $params = $request->get_json_params();
        $addon_name = sanitize_text_field($params['addon']);
        $status = (bool) $params['status'];

        $active_addons = get_option('gamify_active_addons', []);

        if ($status) {
            // Activate
            if (!in_array($addon_name, $active_addons)) {
                $active_addons[] = $addon_name;
            }
        } else {
            // Deactivate
            $active_addons = array_diff($active_addons, [$addon_name]);
        }

        update_option('gamify_active_addons', array_values($active_addons));

        return new \WP_REST_Response(['message' => 'Addon status updated.', 'active_addons' => $active_addons], 200);
    }
}
