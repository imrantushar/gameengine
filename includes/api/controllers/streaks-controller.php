<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\StreaksManager;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for the Streak System.
 */
class StreaksController extends BaseController
{

    protected $rest_base = 'streaks';

    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'create_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'delete_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/user/(?P<user_id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_user_streaks'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    public function get_items(\WP_REST_Request $request)
    {
        return new \WP_REST_Response(StreaksManager::get_all(), 200);
    }

    public function create_item(\WP_REST_Request $request)
    {
        $params = $request->get_json_params();

        if (empty($params['title'])) {
            return new \WP_Error('missing_data', __('Streak title is required.', 'gameengine'), array('status' => 400));
        }
        if (empty($params['trigger_hook'])) {
            return new \WP_Error('missing_data', __('Trigger hook is required.', 'gameengine'), array('status' => 400));
        }

        $id = StreaksManager::create($params);
        if (!$id) {
            return new \WP_Error('create_failed', __('Could not create streak.', 'gameengine'), array('status' => 500));
        }

        return new \WP_REST_Response(StreaksManager::get_by_id($id), 201);
    }

    public function update_item(\WP_REST_Request $request)
    {
        $id     = absint($request->get_param('id'));
        $params = $request->get_json_params();

        StreaksManager::update($id, $params);
        return new \WP_REST_Response(StreaksManager::get_by_id($id), 200);
    }

    public function delete_item(\WP_REST_Request $request)
    {
        $id = absint($request->get_param('id'));
        StreaksManager::delete($id);
        return new \WP_REST_Response(array('deleted' => true, 'id' => $id), 200);
    }

    public function get_user_streaks(\WP_REST_Request $request)
    {
        $user_id = absint($request->get_param('user_id'));
        return new \WP_REST_Response(StreaksManager::get_user_streaks($user_id), 200);
    }
}
