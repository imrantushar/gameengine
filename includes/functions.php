<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Helper function to add points.
 */
function gamify_add_points(int $user_id, int $points, string $context, array $args = [])
{
    $manager = new \Gamify\System\Points_Manager();
    return $manager->add($user_id, $points, $context, $args);
}

/**
 * Helper function to deduct points.
 */
function gamify_deduct_points(int $user_id, int $points, string $context, array $args = [])
{
    $manager = new \Gamify\System\Points_Manager();
    return $manager->deduct($user_id, $points, $context, $args);
}

/**
 * Helper function to get total points.
 */
function gamify_get_total_points(int $user_id): int
{
    $manager = new \Gamify\System\Points_Manager();
    return $manager->get_total($user_id);
}
