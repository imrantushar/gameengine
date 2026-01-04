<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\Logger;

/**
 * Handles Async/Scheduled tasks using WP Cron / Action Scheduler.
 */
class Scheduler
{
    /**
     * Initialize the Scheduler.
     * This registers the hook for Action Scheduler.
     */
    public static function init()
    {
        $self = new self();
        add_action('gamify_execute_scheduled_action', [$self, 'process_scheduled_action'], 10, 4);
    }

    /**
     * The callback function for the scheduled event.
     * 
     * @param int $user_id
     * @param int $points
     * @param string $action_type ('award' or 'deduct')
     * @param array $meta (description, point_type_id etc)
     */
    public function process_scheduled_action($user_id, $points, $action_type, $meta)
    {
        // Ensure PointsManager is loaded via Autoloader
        $points_manager = new PointsManager();

        // Ensure we have a valid description
        $description = isset($meta['description']) ? $meta['description'] : 'Scheduled Action';
        $meta['description'] = $description . ' (Executed)';

        // Execute the action
        $log_id = false;

        if ($action_type === 'deduct') {
            $log_id = $points_manager->deduct($user_id, $points, 'scheduled_execution', $meta);
        } else {
            $log_id = $points_manager->add($user_id, $points, 'scheduled_execution', $meta);
        }

        // Log the execution result explicitly
        if ($log_id) {
            $final_points = ($action_type === 'deduct') ? -$points : $points;

            Logger::log(
                'schedule_executed',
                "Successfully executed scheduled {$action_type} of {$points} points.",
                $user_id,
                $final_points, // Actual points awarded/deducted
                [
                    'scheduled_time' => current_time('mysql'),
                    'original_meta'  => $meta,
                    'log_id'         => $log_id
                ],
                'success'
            );
        } else {
            // Log failure if needed
            Logger::log(
                'schedule_failed',
                "Failed to execute scheduled action for user {$user_id}.",
                $user_id,
                0,
                $meta,
                'failed'
            );
        }
    }
}
