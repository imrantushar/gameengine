<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Helper function to add points.
 */
function gameengine_add_points(int $user_id, int $points, string $context, array $args = [])
{
    $manager = new \GameEngine\Classes\PointsManager();
    return $manager->add($user_id, $points, $context, $args);
}

/**
 * Helper function to deduct points.
 */
function gameengine_deduct_points(int $user_id, int $points, string $context, array $args = [])
{
    $manager = new \GameEngine\Classes\PointsManager();
    return $manager->deduct($user_id, $points, $context, $args);
}

/**
 * Helper function to get total points.
 */
function gameengine_get_total_points(int $user_id, int $point_type_id = 1): int
{
    $manager = new \GameEngine\Classes\PointsManager();
    return $manager->get_total($user_id, $point_type_id);
}
