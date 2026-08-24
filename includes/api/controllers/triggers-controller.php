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
     * Retrieve and filter integration triggers based on scope and dynamic UI logic.
     */
    public function get_items($request)
    {
        $scope = $request->get_param('scope');

        // The registry decides which integrations are live: it only returns those
        // whose addon is active and whose host plugin is present. It is always the
        // authority on the key set, so nothing can be dropped here.
        $data = \GameEngine\Classes\TriggerRegistry::get_all_integrations();

        // assets/json/integrations.json is a build artifact used during development
        // and is not part of the release build. When it is present, overlay its
        // definitions onto the live set; entries it does not know about are kept.
        $file = GAMEENGINE_PATH . 'assets/json/integrations.json';

        if (file_exists($file)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local build artifact, not a remote request.
            $manifest = json_decode(file_get_contents($file), true);
            $cached   = isset($manifest['integrations']) && is_array($manifest['integrations'])
                ? $manifest['integrations']
                : array();

            $data = array_replace($data, array_intersect_key($cached, $data));
        }

        if (! empty($scope)) {
            $filtered_data = [];
            foreach ($data as $slug => $integration) {
                if (isset($integration['triggers']) && is_array($integration['triggers'])) {

                    // Filter triggers that support the current scope.
                    $filtered_triggers = array_filter($integration['triggers'], function ($trigger) use ($scope) {
                        $supports = isset($trigger['supports']) ? (array) $trigger['supports'] : ['point_type'];
                        return in_array($scope, $supports);
                    });

                    if (! empty($filtered_triggers)) {

                        foreach ($filtered_triggers as $t_key => &$trigger_item) {
                            if (isset($trigger_item['schema']) && is_array($trigger_item['schema'])) {

                                $final_schema     = [];
                                $is_points_active = false;

                                // 1. Filter fields based on current scope.
                                foreach ($trigger_item['schema'] as $field) {
                                    $field_scopes = isset($field['scope']) ? (array) $field['scope'] : ['point_type'];

                                    if (in_array($scope, $field_scopes)) {
                                        if ($field['key'] === 'points') {
                                            $is_points_active = true;
                                        }
                                        $final_schema[] = $field;
                                    }
                                }

                                // 2. Design Adjustment: If points field is hidden, make log_label 100% width.
                                if (! $is_points_active) {
                                    foreach ($final_schema as &$f_obj) {
                                        if ($f_obj['key'] === 'log_label') {
                                            $f_obj['width'] = '100%';
                                        }
                                    }
                                }

                                // Update the schema with scope-specific fields.
                                $trigger_item['schema'] = $final_schema;
                            }
                        }

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
            'tutorlms'    => \GameEngine\Integrations\TutorLMS::class,
            'gameengine'  => \GameEngine\Integrations\GameEngine::class,
            'storeengine' => \GameEngine\Integrations\StoreEngine::class,
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
