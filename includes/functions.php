<?php
if (! defined('ABSPATH')) {
    exit;
}

if (! function_exists('gameengine_add_points')) {
    /**
     * Helper function to add points.
     */
    function gameengine_add_points(int $user_id, int $points, string $context, array $args = [])
    {
        $manager = new \GameEngine\Classes\PointsManager();
        return $manager->add($user_id, $points, $context, $args);
    }
}

if (! function_exists('gameengine_deduct_points')) {
    /**
     * Helper function to deduct points.
     */
    function gameengine_deduct_points(int $user_id, int $points, string $context, array $args = [])
    {
        $manager = new \GameEngine\Classes\PointsManager();
        return $manager->deduct($user_id, $points, $context, $args);
    }
}

if (! function_exists('gameengine_get_total_points')) {
    /**
     * Helper function to get total points.
     */
    function gameengine_get_total_points(int $user_id): int
    {
        $manager = new \GameEngine\Classes\PointsManager();
        return $manager->get_total($user_id);
    }
}
