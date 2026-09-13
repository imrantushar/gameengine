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
     * A member's points in one point type.
     *
     * The point type is optional, so a one-argument call still reads point
     * type 1 as it did in 1.3.2. The Rewards Store passes the reward's own.
     */
    function gameengine_get_total_points(int $user_id, int $point_type_id = 1): int
    {
        $manager = new \GameEngine\Classes\PointsManager();
        return $manager->get_total($user_id, $point_type_id);
    }
}
