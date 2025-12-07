<?php

namespace Gamify\API;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

use Gamify\API\Controllers\LogsController;
use Gamify\API\Controllers\PointTypesController;
use Gamify\API\Controllers\TriggersController;
use Gamify\API\Controllers\AchievementsController;
use Gamify\API\Controllers\ActionsController;
use Gamify\API\Controllers\LevelsController;
use Gamify\API\Controllers\DashboardController;

final class Manager
{
    /**
     * Initialize the API Manager.
     * This registers the REST API routes when WordPress is ready.
     */
    public static function init()
    {
        $self = new self();
        add_action('rest_api_init', [$self, 'register_controllers']);
    }

    /**
     * Get list of controller classes.
     */
    protected function get_controllers()
    {
        return [

            LogsController::class,
            PointTypesController::class,
            TriggersController::class,
            AchievementsController::class,
            ActionsController::class,
            LevelsController::class,
            DashboardController::class,
        ];
    }

    /**
     * Register routes for all controllers.
     * Triggered by 'rest_api_init'.
     */
    public function register_controllers()
    {
        $controllers = $this->get_controllers();

        foreach ($controllers as $class) {
            // Ensure the class exists before trying to instantiate it
            if (class_exists($class)) {
                $controller = new $class();
                $controller->register_routes();
            }
        }
    }
}
