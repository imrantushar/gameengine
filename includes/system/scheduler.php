<?php

namespace Gamify\System;

if (! defined('ABSPATH')) exit;

/**
 * Handles Async/Scheduled tasks using WP Cron.
 */
class Scheduler
{
    public function __construct()
    {
        // Register the hook that WP Cron will fire
        add_action('gamify_execute_scheduled_action', [$this, 'process_scheduled_action'], 10, 4);
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

        // FIX: Log the execution result explicitly
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
