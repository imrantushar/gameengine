<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\Classes\PointsManager;
use Gamify\Classes\Logger;

if (! defined('ABSPATH')) {
    exit;
}


/**
 * Class ActionsController
 * Handles manual point adjustments and scheduling via REST API.
 */
class ActionsController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'actions';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/manual',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'manual_action'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Process manual point adjustment or schedule it for later.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function manual_action($request)
    {
        $params = $request->get_json_params();

        // 1. Validation (Using the updated frontend field names).
        if (empty($params['user_id']) || ! isset($params['points_awarded'])) {
            return new \WP_Error('missing_params', 'User ID and Points are required.', array('status' => 400));
        }

        $user_id     = absint($params['user_id']);
        $points      = absint($params['points_awarded']); // absolute value for manager.
        $type        = ! empty($params['type']) ? sanitize_text_field($params['type']) : 'award';
        $trigger_key = ! empty($params['trigger_key']) ? sanitize_key($params['trigger_key']) : 'manual_adjustment';
        $message     = ! empty($params['message']) ? sanitize_textarea_field($params['message']) : 'Manual Action';
        $date        = ! empty($params['schedule_date']) ? sanitize_text_field($params['schedule_date']) : null;

        $meta_args = array(
            'description'   => $message,
            'point_type_id' => 1,
        );

        // 2. Schedule Logic (using Action Scheduler).
        if ($date) {
            if (! function_exists('as_schedule_single_action')) {
                return new \WP_Error('dependency_missing', 'Action Scheduler required for scheduling.', array('status' => 500));
            }

            $gmt_offset      = get_option('gmt_offset') * HOUR_IN_SECONDS;
            $local_timestamp = strtotime($date);
            $utc_timestamp   = $local_timestamp - $gmt_offset;

            if ($utc_timestamp > time()) {
                as_schedule_single_action(
                    $utc_timestamp,
                    'gamify_execute_scheduled_action',
                    array($user_id, $points, $type, $meta_args),
                    'gamify-events'
                );

                Logger::log(
                    'action_scheduled',
                    sprintf('Scheduled to %s %d points on %s', $type, $points, $date),
                    $user_id,
                    0,
                    array(
                        'scheduled_for' => $date,
                        'utc_timestamp' => $utc_timestamp,
                    ),
                    'pending'
                );

                return new \WP_REST_Response(
                    array(
                        'message' => __('Action scheduled successfully.', 'gamify'),
                        'status'  => 'scheduled',
                    ),
                    200
                );
            }
        }

        // 3. Immediate Execution Logic.
        $manager = new PointsManager();
        $log_id  = false;

        if ('deduct' === $type) {
            $log_id = $manager->deduct($user_id, $points, $trigger_key, $meta_args);
        } else {
            $log_id = $manager->add($user_id, $points, $trigger_key, $meta_args);
        }

        if ($log_id) {
            // Clear frontend logs cache.
            wp_cache_delete('gamify_logs_list', 'gamify_logs');

            return new \WP_REST_Response(
                array(
                    'message' => 'Points updated successfully.',
                    'log_id'  => $log_id,
                ),
                200
            );
        }

        return new \WP_Error('action_failed', 'Failed to update points.', array('status' => 500));
    }
}
