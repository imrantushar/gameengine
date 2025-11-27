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
    private $points_manager;

    public function __construct()
    {
        // PointsManager লোড করে রাখা হলো
        $this->points_manager = new PointsManager();
    }

    public function attach_hooks()
    {
        $triggers = TriggerRegistry::get_all();

        foreach ($triggers as $key => $config) {
            add_action($config['hook'], function () use ($key, $config) {
                $this->execute($key, $config, func_get_args());
            }, 10, $config['args_count']);
        }
    }

    public function execute(string $trigger_key, array $config, array $hook_args)
    {
        global $wpdb;
        $table_requirements = $wpdb->prefix . 'gamify_requirements';

        // 1. Identify User
        $user_id = call_user_func_array($config['get_user_id'], $hook_args);
        if (! $user_id || $user_id <= 0) return;

        // 2. Query Active Rules
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_requirements} WHERE trigger_key = %s AND is_active = 1",
            $trigger_key
        ));

        if (empty($rules)) return;

        // 3. Process Rules
        foreach ($rules as $rule) {
            $this->process_single_rule($rule, $user_id, $config);
        }
    }

    private function process_single_rule($rule, $user_id, $config)
    {
        $params = json_decode($rule->parameters, true);

        // TODO: Check Limits (ProgressTracker) here later.

        if ($rule->reward_type === 'point_type') {

            $points = isset($params['points']) ? intval($params['points']) : 0;
            $action_type = $rule->action_type ?? 'award';

            // Description Logic
            $description = isset($params['label']) ? $params['label'] : $config['label'];

            // Arguments for PointsManager
            $args = [
                'description'    => $description,
                'requirement_id' => $rule->id,
                'point_type_id'  => $rule->reward_id // This is crucial
            ];

            if ($action_type === 'deduct') {
                $this->points_manager->deduct($user_id, $points, $rule->trigger_key, $args);
            } else {
                $this->points_manager->add($user_id, $points, $rule->trigger_key, $args);
            }
        }
    }
}
