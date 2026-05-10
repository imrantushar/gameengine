<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\RanksManager;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for the Rank System.
 */
class RanksController extends BaseController
{

    protected $rest_base = 'ranks';

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
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
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
                    'callback'            => array($this, 'get_user_rank'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    public function get_items(\WP_REST_Request $request)
    {
        $ranks = RanksManager::get_all();
        foreach ($ranks as &$rank) {
            $rank['user_count'] = RanksManager::get_user_count((int) $rank['id']);
        }
        return new \WP_REST_Response($ranks, 200);
    }

    public function get_item(\WP_REST_Request $request)
    {
        $id   = absint($request->get_param('id'));
        $rank = RanksManager::get_by_id($id);

        if (!$rank) {
            return new \WP_Error('not_found', __('Rank not found.', 'gameengine'), array('status' => 404));
        }

        $rank['user_count'] = RanksManager::get_user_count($id);
        return new \WP_REST_Response($rank, 200);
    }

    public function create_item(\WP_REST_Request $request)
    {
        $params = $request->get_json_params();

        if (empty($params['title'])) {
            return new \WP_Error('missing_data', __('Rank title is required.', 'gameengine'), array('status' => 400));
        }

        $id = RanksManager::create($params);

        if (!$id) {
            return new \WP_Error('create_failed', __('Could not create rank.', 'gameengine'), array('status' => 500));
        }

        $rank               = RanksManager::get_by_id($id);
        $rank['user_count'] = 0;
        return new \WP_REST_Response($rank, 201);
    }

    public function update_item(\WP_REST_Request $request)
    {
        $id     = absint($request->get_param('id'));
        $params = $request->get_json_params();

        if (!RanksManager::get_by_id($id)) {
            return new \WP_Error('not_found', __('Rank not found.', 'gameengine'), array('status' => 404));
        }

        RanksManager::update($id, $params);

        $rank               = RanksManager::get_by_id($id);
        $rank['user_count'] = RanksManager::get_user_count($id);
        return new \WP_REST_Response($rank, 200);
    }

    public function delete_item(\WP_REST_Request $request)
    {
        $id = absint($request->get_param('id'));

        if (!RanksManager::get_by_id($id)) {
            return new \WP_Error('not_found', __('Rank not found.', 'gameengine'), array('status' => 404));
        }

        RanksManager::delete($id);
        return new \WP_REST_Response(array('deleted' => true, 'id' => $id), 200);
    }

    public function get_user_rank(\WP_REST_Request $request)
    {
        $user_id = absint($request->get_param('user_id'));
        $rank    = RanksManager::get_user_rank($user_id);
        return new \WP_REST_Response($rank, 200);
    }
}
