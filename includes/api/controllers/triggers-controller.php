<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\Classes\TriggerRegistry;

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
                'args'                => [
                    'scope' => [
                        'required' => false,
                        'type'     => 'string',
                        'description' => 'Filter triggers by scope (point_type or achievement)',
                    ]
                ]
            ],
        ]);
    }

    public function get_items($request)
    {
        // Get the scope from the request (?scope=achievement)
        $scope = $request->get_param('scope');

        // Pass the scope to the Registry
        $triggers = TriggerRegistry::get_all($scope);

        $formatted = [];

        foreach ($triggers as $key => $config) {
            $formatted[] = [
                'id'            => $key,
                'label'         => $config['label'],
                'category'       => isset($config['category']) ? $config['category'] : 'general',
                'subTitle'      => isset($config['description']) ? $config['description'] : '',
                'type'          => isset($config['type']) ? $config['type'] : 'wordpress',
                'award_fields'  => isset($config['award_fields']) ? $config['award_fields'] : [],
                'deduct_fields' => isset($config['deduct_fields']) ? $config['deduct_fields'] : [],
                'supports'       => $config['supports'] ?? [],
            ];
        }

        // Reset array keys to ensure JSON array, not object
        return new \WP_REST_Response(array_values($formatted), 200);
    }
}
