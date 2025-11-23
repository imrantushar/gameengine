<?php

namespace Gamify\System;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles the execution of triggers when WordPress hooks are fired.
 */
final class TriggerHandler
{
    /**
     * Attach listeners to all registered WordPress hooks.
     */
    public function attach_hooks()
    {
        $triggers = TriggerRegistry::get_all();

        foreach ($triggers as $key => $config) {
            // Dynamically add action for each registered trigger
            add_action($config['hook'], function () use ($key, $config) {
                // Pass all arguments from the hook to the execute method
                $this->execute($key, $config, func_get_args());
            }, 10, $config['args_count']);
        }
    }

    /**
     * Executes the logic when a hook fires.
     * Checks for active requirements and processes rewards.
     *
     * @param string $trigger_key The unique key of the trigger (e.g., 'wp_login').
     * @param array  $config      The trigger configuration from registry.
     * @param array  $hook_args   Arguments passed by the WordPress hook.
     */
    public function execute(string $trigger_key, array $config, array $hook_args)
    {
        global $wpdb;

        // Updated table name as per new schema
        $table_requirements = $wpdb->prefix . 'gamify_requirements';

        // 1. Identify the user ID from the hook arguments
        $user_id = call_user_func_array($config['get_user_id'], $hook_args);

        if (! $user_id || $user_id <= 0) {
            return; // Invalid user, stop execution.
        }

        // 2. Query for all ACTIVE requirements associated with this trigger key
        // We fetch all rules because one trigger (e.g., login) might be used for
        // multiple rewards (e.g., Points AND an Achievement).
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_requirements} WHERE trigger_key = %s AND is_active = 1",
            $trigger_key
        ));

        if (empty($rules)) {
            return; // No active rules found for this trigger.
        }

        // 3. Process each rule found
        foreach ($rules as $rule) {
            $this->process_single_rule($rule, $user_id, $config);
        }
    }

    /**
     * Process a single requirement rule.
     *
     * @param object $rule    The rule object from the database.
     * @param int    $user_id The user ID.
     * @param array  $config  Trigger config for label/description.
     */
    private function process_single_rule($rule, $user_id, $config)
    {
        // Decode parameters (stored as JSON)
        $params = json_decode($rule->parameters, true);

        // Example logic for Points Reward
        if ($rule->reward_type === 'point_type') {

            // TODO: Add logic here to check 'Requirement Progress' (limits, daily counts)
            // For now, we assume direct award for simplicity

            $points = isset($params['points']) ? intval($params['points']) : 0;
            $action_type = $rule->action_type ?? 'award'; // 'award' or 'deduct'

            $points_manager = new PointsManager();

            // Construct a log description
            $description = isset($params['label']) ? $params['label'] : $config['label'];

            if ($action_type === 'deduct') {
                $points_manager->deduct($user_id, $points, $rule->trigger_key, [
                    'description'    => $description,
                    'requirement_id' => $rule->id,
                    'point_type_id'  => $rule->reward_id
                ]);
            } else {
                $points_manager->add($user_id, $points, $rule->trigger_key, [
                    'description'    => $description,
                    'requirement_id' => $rule->id,
                    'point_type_id'  => $rule->reward_id
                ]);
            }
        }

        // Logic for Achievements and Levels would go here...
    }
}
