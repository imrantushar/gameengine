<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\ExportManager;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST controller for data export.
 */
class ToolsExportController extends BaseController
{

    protected $rest_base = 'tools/export';

    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'export'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    public function export(\WP_REST_Request $request)
    {
        $type   = sanitize_key($request->get_param('type') ?: 'achievements');
        $format = sanitize_key($request->get_param('format') ?: 'csv');

        if (!in_array($format, array('csv', 'json'), true)) {
            $format = 'csv';
        }

        $result = ExportManager::export($type, $format);

        if (empty($result['data'])) {
            return new \WP_REST_Response(array('message' => __('No data to export.', 'gameengine')), 200);
        }

        $mime     = $format === 'json' ? 'application/json' : 'text/csv';
        $filename = 'gameengine-' . $type . '-' . gmdate('Ymd') . '.' . $format;

        $response = new \WP_REST_Response($result['data'], 200);
        $response->header('Content-Type', $mime);
        $response->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        $response->header('X-GE-Rows', $result['rows']);
        $response->header('X-GE-Truncated', $result['truncated'] ? '1' : '0');

        return $response;
    }
}
