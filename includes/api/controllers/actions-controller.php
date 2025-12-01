<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;
use Gamify\System\PointsManager;
use Gamify\System\Logger;

if (! defined('ABSPATH')) exit;

class ActionsController extends BaseController
{
    protected $rest_base = 'actions';

    public function register_routes()
    {
        register_rest_route($this->namespace, '/' . $this->rest_base . '/manual', [
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'manual_action'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);
    }

    public function manual_action($request)
    {
        $params = $request->get_json_params();

        // 1. Validation
        if (empty($params['user_id']) || empty($params['points'])) {
            return new \WP_Error('missing_params', 'User ID and Points are required.', ['status' => 400]);
        }

        $user_id = absint($params['user_id']);
        $points  = absint($params['points']);
        $type    = !empty($params['type']) ? sanitize_text_field($params['type']) : 'award';
        $desc    = !empty($params['description']) ? sanitize_textarea_field($params['description']) : 'Manual Action';
        $date    = !empty($params['schedule_date']) ? sanitize_text_field($params['schedule_date']) : null;

        $meta_args = [
            'description'   => $desc,
            'point_type_id' => 1
        ];

        // 2. Schedule Logic (Timezone Hard Fix)
        if ($date) {
            if (! function_exists('as_schedule_single_action')) {
                return new \WP_Error('dependency_missing', 'Action Scheduler required.', ['status' => 500]);
            }

            $gmt_offset = get_option('gmt_offset') * 3600;

            // ২. ইনপুট ডেটকে টাইমস্ট্যাম্পে কনভার্ট করা (এটি লোকাল টাইম হিসেবে আসবে)
            $local_timestamp = strtotime($date);


            $utc_timestamp = $local_timestamp - $gmt_offset;

            if ($utc_timestamp > time()) {
                as_schedule_single_action(
                    $utc_timestamp,
                    'gamify_execute_scheduled_action',
                    [$user_id, $points, $type, $meta_args],
                    'gamify-events'
                );

                Logger::log(
                    'action_scheduled',
                    "Scheduled to {$type} {$points} points on {$date}",
                    $user_id,
                    0,
                    ['scheduled_for' => $date, 'utc_timestamp' => $utc_timestamp],
                    'pending'
                );

                return new \WP_REST_Response([
                    'message' => 'Scheduled successfully.',
                    'status' => 'scheduled'
                ], 200);
            }
        }

        // 3. Immediate Execution Logic
        $manager = new PointsManager();
        $log_id  = false;

        if ($type === 'deduct') {
            $log_id = $manager->deduct($user_id, $points, 'manual_deduct', $meta_args);
        } else {
            $log_id = $manager->add($user_id, $points, 'manual_award', $meta_args);
        }

        if ($log_id) {
            return new \WP_REST_Response(['message' => 'Points updated successfully.', 'log_id' => $log_id], 200);
        }

        return new \WP_Error('action_failed', 'Failed to update points.', ['status' => 500]);
    }
}
