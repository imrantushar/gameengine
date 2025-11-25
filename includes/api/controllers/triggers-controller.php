<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\System\TriggerRegistry;

if (! defined('ABSPATH')) exit;

class TriggersController extends BaseController
{
    protected $rest_base = 'triggers';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function get_items($request)
    {
        $triggers = TriggerRegistry::get_all();
        $formatted = [];

        foreach ($triggers as $key => $config) {
            $formatted[] = [
                'id'          => $key,
                'label'       => $config['label'],
                'subTitle'    => isset($config['description']) ? $config['description'] : '',
                'type'        => isset($config['type']) ? $config['type'] : 'wordpress',
            ];
        }

        return new \WP_REST_Response($formatted, 200);
    }
}
