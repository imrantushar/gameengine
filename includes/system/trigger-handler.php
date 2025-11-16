<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

final class TriggerHandler
{
    /**
     * Attach all WordPress hooks from the trigger registry.
     */
    public function attach_hooks()
    {
        $triggers = TriggerRegistry::get_all();

        foreach ($triggers as $key => $config) {
            add_action($config['hook'], function () use ($key, $config) {
                $this->execute($key, $config, func_get_args());
            }, 10, $config['args_count']);
        }
    }

    /**
     * The main function that executes when a hook is fired.
     *
     * @param string $key        The unique key of the trigger.
     * @param array  $config     The trigger's configuration.
     * @param array  $hook_args  The arguments passed by the WordPress hook.
     */
    public function execute(string $key, array $config, array $hook_args)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gamify_triggers';

        $rule = $wpdb->get_row($wpdb->prepare(
            "SELECT points_to_award, log_description FROM {$table} WHERE trigger_key = %s AND is_active = 1",
            $key
        ));

        if (! $rule || ! $rule->points_to_award) {
            return;
        }

        $user_id = call_user_func_array($config['get_user_id'], $hook_args);

        if (! $user_id) {
            return;
        }

        $points = (int) $rule->points_to_award;
        $description = ! empty($rule->log_description) ? $rule->log_description : $config['label'];

        // Use the Points Manager to award/deduct points
        $points_manager = new PointsManager();

        if ($points > 0) {
            $points_manager->add($user_id, $points, $key, ['description' => $description]);
        } elseif ($points < 0) {
            $points_manager->deduct($user_id, abs($points), $key, ['description' => $description]);
        }
    }
}
