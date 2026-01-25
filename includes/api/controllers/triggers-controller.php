<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\TriggerRegistry;

if (!defined('ABSPATH')) exit;

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


        register_rest_route($this->namespace, '/dynamic', [
            [
                'methods'             => \WP_REST_Server::CREATABLE, // POST
                'callback'            => [$this, 'get_dynamic_options'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function get_items($request)
    {
        $scope = $request->get_param('scope');
        $file  = GAMEENGINE_PATH . 'assets/json/integrations.json';
        $data  = [];

        if (file_exists($file)) {
            $manifest = json_decode(file_get_contents($file), true);
            $data = $manifest['integrations'] ?? [];
        } else {
            $data = \GameEngine\Classes\TriggerRegistry::get_all_integrations();
        }

        if (!empty($scope)) {
            $filtered_data = [];
            foreach ($data as $slug => $integration) {
                if (isset($integration['triggers']) && is_array($integration['triggers'])) {


                    $filtered_triggers = array_filter($integration['triggers'], function ($trigger) use ($scope) {
                        $supports = isset($trigger['supports']) ? (array) $trigger['supports'] : ['point_type'];
                        return in_array($scope, $supports);
                    });


                    if (!empty($filtered_triggers)) {
                        $integration['triggers'] = $filtered_triggers;
                        $filtered_data[$slug] = $integration;
                    }
                }
            }
            $data = $filtered_data;
        }

        return new \WP_REST_Response($data, 200);
    }

    public function get_dynamic_options($request)
    {
        $params     = $request->get_json_params();
        $integration = isset($params['integration']) ? sanitize_text_field($params['integration']) : '';
        $query_key   = isset($params['query']) ? sanitize_text_field($params['query']) : '';

        $map = [
            'wordpress'   => \GameEngine\Integrations\WordPress::class,
            'woocommerce' => \GameEngine\Integrations\WooCommerce::class,
        ];

        if (isset($map[$integration])) {
            $class = $map[$integration];

            $queries = $class::get_dynamic_queries();

            if (isset($queries[$query_key]) && is_callable($queries[$query_key])) {
                $data = call_user_func($queries[$query_key]);
                return new \WP_REST_Response($data, 200);
            }
        }

        return new \WP_REST_Response([], 200);
    }
}
