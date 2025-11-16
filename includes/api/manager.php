<?php

namespace Gamify\API;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

use Gamify\API\Controllers\LogsController;
use Gamify\API\Controllers\PointTypesController;
use Gamify\API\Controllers\TriggersController;

final class Manager
{
    public function __construct()
    {
        $this->register_controllers();
    }

    protected function get_controllers()
    {
        return [
            LogsController::class,
            PointTypesController::class,
            TriggersController::class,
        ];
    }

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
