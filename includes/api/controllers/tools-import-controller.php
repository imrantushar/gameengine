<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\ImportManager;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for data import (multipart file upload).
 */
class ToolsImportController extends BaseController
{

    protected $rest_base = 'tools/import';

    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'import'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    public function import(\WP_REST_Request $request)
    {
        $files = $request->get_file_params();

        if (empty($files['file']['tmp_name'])) {
            return new \WP_Error('missing_file', __('No file uploaded.', 'gameengine'), array('status' => 400));
        }

        $type      = sanitize_key($request->get_param('type') ?: 'achievements');
        $overwrite = (bool) $request->get_param('overwrite');
        $file_path = $files['file']['tmp_name'];
        $file_name = $files['file']['name'] ?? '';
        $ext       = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        if (!in_array($ext, array('csv', 'json'), true)) {
            return new \WP_Error('invalid_format', __('Only CSV and JSON files are supported.', 'gameengine'), array('status' => 400));
        }

        $result = ImportManager::import($type, $file_path, $overwrite);

        return new \WP_REST_Response($result, 200);
    }
}
