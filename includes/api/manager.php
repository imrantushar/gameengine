<?php

namespace GameEngine\API;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

use GameEngine\API\Controllers\LogsController;
use GameEngine\API\Controllers\PointTypesController;
use GameEngine\API\Controllers\TriggersController;
use GameEngine\API\Controllers\AchievementsController;
use GameEngine\API\Controllers\ActionsController;
use GameEngine\API\Controllers\LevelsController;
use GameEngine\API\Controllers\DashboardController;
use GameEngine\API\Controllers\LeaderboardController;
use GameEngine\API\Controllers\SettingsController;
use GameEngine\API\Controllers\AddonsController;
use GameEngine\API\Controllers\TaxonomyController;
use GameEngine\API\Controllers\ToolsController;
use GameEngine\API\Controllers\SetupController;

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
            LeaderboardController::class,
            SettingsController::class,
            AddonsController::class,
            TaxonomyController::class,
            ToolsController::class,
            SetupController::class,
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
