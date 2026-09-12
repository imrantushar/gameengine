<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\BadgeManager;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for Badge Editor (ge_badge custom post type).
 */
class BadgesController extends BaseController
{

    protected $rest_base = 'badges';

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
    }

    public function get_items(\WP_REST_Request $request)
    {
        $per_page = min(100, max(1, absint($request->get_param('per_page') ?: 50)));
        $page     = max(1, absint($request->get_param('page') ?: 1));
        $badges   = BadgeManager::get_all($per_page, $page);
        $total    = BadgeManager::get_count();

        $response = new \WP_REST_Response($badges, 200);
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', (int) ceil($total / $per_page));
        return $response;
    }

    public function get_item(\WP_REST_Request $request)
    {
        $id    = absint($request->get_param('id'));
        $badge = BadgeManager::get_by_id($id);

        if (!$badge) {
            return new \WP_Error('not_found', __('Badge not found.', 'gameengine'), array('status' => 404));
        }

        return new \WP_REST_Response($badge, 200);
    }

    public function create_item(\WP_REST_Request $request)
    {
        $params = $request->get_json_params();

        if (empty($params['title'])) {
            return new \WP_Error('missing_data', __('Badge title is required.', 'gameengine'), array('status' => 400));
        }

        $id = BadgeManager::create($params);

        if (!$id) {
            return new \WP_Error('create_failed', __('Could not create badge.', 'gameengine'), array('status' => 500));
        }

        return new \WP_REST_Response(BadgeManager::get_by_id($id), 201);
    }

    public function update_item(\WP_REST_Request $request)
    {
        $id     = absint($request->get_param('id'));
        $params = $request->get_json_params();

        if (!BadgeManager::get_by_id($id)) {
            return new \WP_Error('not_found', __('Badge not found.', 'gameengine'), array('status' => 404));
        }

        BadgeManager::update($id, $params);

        return new \WP_REST_Response(BadgeManager::get_by_id($id), 200);
    }

    public function delete_item(\WP_REST_Request $request)
    {
        $id = absint($request->get_param('id'));

        if (!BadgeManager::get_by_id($id)) {
            return new \WP_Error('not_found', __('Badge not found.', 'gameengine'), array('status' => 404));
        }

        BadgeManager::delete($id);

        return new \WP_REST_Response(array('deleted' => true, 'id' => $id), 200);
    }
}
