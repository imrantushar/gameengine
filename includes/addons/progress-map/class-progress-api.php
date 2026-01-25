<?php

namespace GameEngine\Addons\ProgressMap;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Progress_API
 * Handles REST API requests for fetching user journey and roadmap data.
 */
class Progress_API extends BaseController
{

    /**
     * REST route base for progress data.
     *
     * @var string
     */
    protected $rest_base = 'user-progress';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<user_id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_user_journey'),
                    'permission_callback' => array($this, 'admin_permission_check'), // Ensure only authorized users access this
                ),
            )
        );
    }

    /**
     * Callback to retrieve a specific user's progress roadmap.
     * 
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_user_journey($request)
    {
        $user_id = absint($request->get_param('user_id'));

        if (empty($user_id)) {
            return new \WP_Error('invalid_user', 'A valid User ID is required.', array('status' => 400));
        }

        // Use the Logic class we created earlier to calculate the journey data
        if (class_exists(__NAMESPACE__ . '\Progress_Map_Logic')) {
            $journey_data = Progress_Map_Logic::get_progress_data($user_id);

            return new \WP_REST_Response(
                array(
                    'success' => true,
                    'user_id' => $user_id,
                    'journey' => $journey_data,
                ),
                200
            );
        }

        return new \WP_Error('logic_missing', 'Progress logic class not found.', array('status' => 500));
    }
}
