<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\TriggerRegistry;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for the Available Hooks UI.
 */
class ToolsHooksController extends BaseController
{

    protected $rest_base = 'tools/available-hooks';

    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_hooks'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    public function get_hooks(\WP_REST_Request $request)
    {
        $hooks = TriggerRegistry::get_all();
        return new \WP_REST_Response($hooks, 200);
    }
}
