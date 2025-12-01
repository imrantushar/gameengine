<?php

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


// add_action('init', function () {
//     if (class_exists('Gamify\System\Scheduler')) {
//         error_log('✅ Gamify Scheduler Loaded Successfully');
//     } else {
//         error_log('❌ Gamify Scheduler NOT Loaded');
//     }
// });



add_action('init', function () {
    if (isset($_GET['test_gamify_cron'])) {
        $scheduler = new \Gamify\System\Scheduler();
        // Fake ID 1, 10 Points, 'award'
        $scheduler->process_scheduled_action(1, 10, 'award', ['description' => 'Test Run']);
        echo 'Test Run Executed. Check Logs.';
        exit;
    }
});

// Force WP Cron on every page load (Only for Localhost Development)
if (defined('WP_DEBUG') && WP_DEBUG) {
    add_action('init', function () {
        if (!defined('DOING_CRON')) {
            wp_schedule_single_event(time(), 'gamify_dev_force_cron_check');
            spawn_cron(); // This forces WP to check for scheduled tasks immediately
        }
    });
}
