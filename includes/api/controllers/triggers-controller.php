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

    /**
     * Retrieve integration triggers and dynamically adjust field widths.
     */
    public function get_items($request)
    {
        $scope = $request->get_param('scope');
        $file  = GAMEENGINE_PATH . 'assets/json/integrations.json';
        $data  = [];

        if (file_exists($file)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            $manifest = json_decode(file_get_contents($file), true);
            $data = $manifest['integrations'] ?? [];
        } else {
            $data = \GameEngine\Classes\TriggerRegistry::get_all_integrations();
        }

        if (! empty($scope)) {
            $filtered_data = [];
            foreach ($data as $slug => $integration) {
                if (isset($integration['triggers']) && is_array($integration['triggers'])) {

                    // Filter triggers while preserving their original keys.
                    $filtered_triggers = array_filter($integration['triggers'], function ($trigger) use ($scope) {
                        $supports = isset($trigger['supports']) ? (array) $trigger['supports'] : ['point_type'];
                        return in_array($scope, $supports);
                    });

                    if (! empty($filtered_triggers)) {

                        /**
                         * Iterate through filtered triggers to adjust field widths.
                         * We use '&' to modify the original array item.
                         */
                        foreach ($filtered_triggers as $t_key => &$trigger_item) {
                            if (isset($trigger_item['schema']) && is_array($trigger_item['schema'])) {

                                $is_points_visible = false;

                                // 1. Determine if the 'points' field is visible in the current scope.
                                foreach ($trigger_item['schema'] as $field) {
                                    if ($field['key'] === 'points') {
                                        $f_scope = isset($field['scope']) ? (array) $field['scope'] : [];
                                        if (in_array($scope, $f_scope)) {
                                            $is_points_visible = true;
                                        }
                                        break;
                                    }
                                }

                                // 2. If 'points' is hidden, find 'log_label' and set its width to 100%.
                                if (! $is_points_visible) {
                                    foreach ($trigger_item['schema'] as &$field_obj) {
                                        if ($field_obj['key'] === 'log_label') {
                                            $field_obj['width'] = '100%';
                                        }
                                    }
                                }
                            }
                        }

                        // Assign back without using array_values to keep original trigger keys.
                        $integration['triggers'] = $filtered_triggers;
                        $filtered_data[$slug]    = $integration;
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
            'academylms'  => \GameEngine\Integrations\AcademyLMS::class,
            'gameengine'  => \GameEngine\Integrations\GameEngine::class,
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
