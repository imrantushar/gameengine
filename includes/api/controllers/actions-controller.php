<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\PointsManager;
use GameEngine\Classes\Logger;
use GameEngine\Classes\TriggerRegistry;

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

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/users',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_users_list'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                    'args'                => array(
                        'search' => array(
                            'required'          => false,
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                    ),
                ),
            )
        );
    }

    /**
     * Returns a filtered list of users for dropdown selection.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
     */
    public function get_users_list($request)
    {
        // Extract sanitized search parameter
        $search = $request->get_param('search');

        $query_args = array(
            'fields' => array('ID', 'display_name', 'user_email'),
            'number' => 20, // Limit results for performance
        );

        // Apply search filters if the parameter is provided
        if (! empty($search)) {
            $query_args['search']         = '*' . $wpdb->esc_like($search) . '*';
            $query_args['search_columns'] = array('user_login', 'display_name', 'user_email');
        }

        $users = get_users($query_args);

        $response = array();
        foreach ($users as $user) {
            $response[] = array(
                // Format label as "Name (Email)" to help Admins identify users
                'label' => sprintf('%s (%s)', $user->display_name, $user->user_email),
                'value' => $user->ID,
            );
        }

        return new \WP_REST_Response($response, 200);
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

        //  Validation (Using the updated frontend field names).
        if (empty($params['user_id']) || ! isset($params['points_awarded'])) {
            return new \WP_Error('missing_params', 'User ID and Points are required.', array('status' => 400));
        }

        $user_id     = absint($params['user_id']);
        $points      = absint($params['points_awarded']);
        $type        = ! empty($params['type']) ? sanitize_text_field($params['type']) : 'award';
        $trigger_key = ! empty($params['trigger_key']) ? sanitize_key($params['trigger_key']) : 'manual_adjustment';
        $message     = ! empty($params['message']) ? sanitize_textarea_field($params['message']) : 'Manual Action';
        $date        = ! empty($params['schedule_date']) ? sanitize_text_field($params['schedule_date']) : null;

        $meta_args = array(
            'description'   => $message,
            'point_type_id' => 1,
        );

        // Schedule Logic (using Action Scheduler).
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
                    'gameengine_execute_scheduled_action',
                    array($user_id, $points, $type, $meta_args),
                    'gameengine-events'
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
                        'message' => __('Action scheduled successfully.', 'gameengine'),
                        'status'  => 'scheduled',
                    ),
                    200
                );
            }
        }

        //  Immediate Execution Logic.
        $manager       = new PointsManager();
        $points_log_id = false;

        if ('deduct' === $type) {
            $points_log_id = $manager->deduct($user_id, $points, $trigger_key, $meta_args);
        } else {
            $points_log_id = $manager->add($user_id, $points, $trigger_key, $meta_args);
        }

        if ($points_log_id) {
            // Clear frontend logs cache.
            wp_cache_delete('gameengine_logs_list', 'gameengine_logs');

            /**
             * Fetch the newly created log entry details to return in response.
             * We search in the gameengine_logs table for the record associated with this points transaction.
             */
            return $this->get_detailed_manual_log($points_log_id);
        }

        return new \WP_Error('action_failed', 'Failed to update points.', array('status' => 500));
    }

    /**
     * Fetches full log data with user and event details for the API response.
     *
     * @param int $points_log_id The ID returned by the PointsManager.
     * @return \WP_REST_Response
     */
    private function get_detailed_manual_log($points_log_id)
    {
        global $wpdb;

        // Fetch from the activity logs table joining with users.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $log_data = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT l.*, u.display_name as user_name, u.user_email 
                FROM {$wpdb->prefix}gameengine_logs l 
                LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID 
                WHERE l.meta LIKE %s ORDER BY l.id DESC LIMIT 1",
                '%' . $wpdb->esc_like((string) $points_log_id) . '%'
            ),
            ARRAY_A
        );

        if ($log_data) {
            // Format Meta.
            $log_data['meta'] = ! empty($log_data['meta']) ? json_decode($log_data['meta'], true) : array();

            // Resolve Trigger Label using Registry.
            $event_label = ucwords(str_replace(array('_', '-'), ' ', $log_data['trigger_key']));
            if (class_exists('\GameEngine\Classes\TriggerRegistry')) {
                $trigger_config = \GameEngine\Classes\TriggerRegistry::get($log_data['trigger_key']);
                if ($trigger_config && isset($trigger_config['label'])) {
                    $event_label = $trigger_config['label'];
                }
            }
            $log_data['event_name'] = $event_label;
        }

        return new \WP_REST_Response($log_data, 200);
    }
}
