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

        // Prepare arguments for PointsManager
        $args = [
            'point_type_id' => isset($meta['point_type_id']) ? $meta['point_type_id'] : 1,
            'description'   => isset($meta['description']) ? $meta['description'] . ' (Scheduled)' : 'Scheduled Action',
        ];

        // Execute the action
        if ($action_type === 'deduct') {
            $points_manager->deduct($user_id, $points, 'scheduled_action', $args);
        } else {
            $points_manager->add($user_id, $points, 'scheduled_action', $args);
        }

        // Optional: Log that the schedule executed successfully
        Logger::log(
            'schedule_executed',
            "Processed scheduled {$action_type} of {$points} points.",
            $user_id,
            ['scheduled_time' => current_time('mysql')]
        );
    }
}
