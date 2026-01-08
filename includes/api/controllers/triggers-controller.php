<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\Classes\TriggerRegistry;

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
        $file = GAMIFY_PATH . 'assets/json/integrations.json';

        if (file_exists($file)) {
            $json_data = file_get_contents($file);
            $manifest = json_decode($json_data, true);

            if (isset($manifest['integrations'])) {
                return new \WP_REST_Response($manifest['integrations'], 200);
            }
        }

        return new \WP_REST_Response(\Gamify\Classes\TriggerRegistry::get_all_integrations(), 200);
    }

    public function get_dynamic_options($request)
    {
        $params     = $request->get_json_params();
        $integration = isset($params['integration']) ? sanitize_text_field($params['integration']) : '';
        $query_key   = isset($params['query']) ? sanitize_text_field($params['query']) : '';

        $map = [
            'wordpress'   => \Gamify\Integrations\WordPress::class,
            'woocommerce' => \Gamify\Integrations\WooCommerce::class,
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
