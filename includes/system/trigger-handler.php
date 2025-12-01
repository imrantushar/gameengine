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
    private $achievements_manager;

    public function __construct()
    {
        // Load Managers
        $this->points_manager = new PointsManager();
        $this->achievements_manager = new AchievementsManager();
    }

    /**
     * Attach all registered triggers to their respective WordPress hooks.
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
     * Execute the trigger logic.
     *
     * @param string $trigger_key The unique key of the trigger.
     * @param array  $config      The trigger configuration.
     * @param array  $hook_args   Arguments passed from the WordPress hook.
     */
    public function execute(string $trigger_key, array $config, array $hook_args)
    {
        global $wpdb;
        $table_requirements = $wpdb->prefix . 'gamify_requirements';

        // 1. Identify User
        $user_id = call_user_func_array($config['get_user_id'], $hook_args);
        if (! $user_id || $user_id <= 0) return;

        // 2. Query Active Rules for this trigger
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_requirements} WHERE trigger_key = %s AND is_active = 1",
            $trigger_key
        ));

        if (empty($rules)) return;

        // 3. Process Rules
        foreach ($rules as $rule) {
            $this->process_single_rule($rule, $user_id, $config, $hook_args);
        }
    }

    /**
     * Process a single requirement rule.
     *
     * @param object $rule      The rule object from the database.
     * @param int    $user_id   The user ID.
     * @param array  $config    The trigger configuration.
     * @param array  $hook_args Arguments passed from the hook (for advanced checks).
     */
    private function process_single_rule($rule, $user_id, $config, $hook_args)
    {
        $params = json_decode($rule->parameters, true);

        // --- STEP 1: Check Limits (Progress Tracking) ---
        // If the limit conditions are not met, stop execution here.
        if (! $this->check_limit_validity($user_id, $rule->id, $params)) {
            return;
        }

        $success = false;

        // --- CASE A: POINT TYPE REWARD ---
        if ($rule->reward_type === 'point_type') {

            $points = isset($params['points']) ? intval($params['points']) : 0;
            $action_type = $rule->action_type ?? 'award';

            // Determine Label/Description
            $description = isset($params['label']) && !empty($params['label'])
                ? $params['label']
                : $config['label'];

            // Arguments for PointsManager
            $args = [
                'description'    => $description,
                'requirement_id' => $rule->id,
                'point_type_id'  => $rule->reward_id
            ];

            // Award or Deduct Points
            if ($action_type === 'deduct') {
                $success = $this->points_manager->deduct($user_id, $points, $rule->trigger_key, $args);
            } else {
                $success = $this->points_manager->add($user_id, $points, $rule->trigger_key, $args);
            }
        }

        // --- CASE B: ACHIEVEMENT REWARD ---
        elseif ($rule->reward_type === 'achievement') {
            $achievement_id = $rule->reward_id;

            // Note: Achievements are usually 'awarded', revocation is typically manual or penalty-based.
            // We pass the context (trigger key) and requirement ID for logging.
            $success = $this->achievements_manager->award(
                $user_id,
                $achievement_id,
                $rule->trigger_key,
                ['requirement_id' => $rule->id]
            );
        }

        // --- STEP 2: Update Progress Tracking ---
        // If the transaction (Point or Achievement) was successful, update the progress table.
        if ($success) {
            $this->update_requirement_progress($user_id, $rule->id);
        }
    }

    /**
     * Checks if the user is eligible for the reward based on the configured limit.
     *
     * @param int   $user_id        The user ID.
     * @param int   $requirement_id The requirement/rule ID.
     * @param array $params         The parameters containing the limit settings.
     * @return bool True if eligible, False if limit reached.
     */
    private function check_limit_validity($user_id, $requirement_id, $params)
    {
        global $wpdb;
        $table_progress = $wpdb->prefix . 'gamify_requirement_progress';

        $limit_type = isset($params['limit']) ? $params['limit'] : 'unlimited';

        // 1. Unlimited: No checks needed.
        if ($limit_type === 'unlimited') {
            return true;
        }

        // Fetch current progress from database
        $progress = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        // 2. One Time Only
        if ($limit_type === '1_time') {
            if ($progress) {
                return false; // User has already received this reward.
            }
        }

        // 3. One Per Day
        if ($limit_type === '1_per_day') {
            if ($progress) {
                $last_date = date('Y-m-d', strtotime($progress->last_updated));
                $today_date = current_time('Y-m-d'); // Use WordPress timezone

                if ($last_date === $today_date) {
                    return false; // Already received today.
                }
            }
        }

        // 4. Limited (Specific number of times)
        if ($limit_type === 'limited') {
            $max_times = isset($params['times']) ? intval($params['times']) : 1;
            if ($progress && $progress->progress_count >= $max_times) {
                return false; // Max limit reached.
            }
        }

        return true; // Limit valid, proceed.
    }

    /**
     * Updates or creates a record in the progress table after a successful transaction.
     *
     * @param int $user_id        The user ID.
     * @param int $requirement_id The requirement/rule ID.
     */
    private function update_requirement_progress($user_id, $requirement_id)
    {
        global $wpdb;
        $table_progress = $wpdb->prefix . 'gamify_requirement_progress';
        $now = current_time('mysql');

        // Check if record exists
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        if ($exists) {
            // Update Existing: Increment count and update timestamp
            $wpdb->query($wpdb->prepare(
                "UPDATE {$table_progress} 
                 SET progress_count = progress_count + 1, last_updated = %s 
                 WHERE id = %d",
                $now,
                $exists
            ));
        } else {
            // Insert New: Create initial record
            $wpdb->insert(
                $table_progress,
                [
                    'user_id'        => $user_id,
                    'requirement_id' => $requirement_id,
                    'progress_count' => 1,
                    'last_updated'   => $now
                ],
                ['%d', '%d', '%d', '%s']
            );
        }
    }
}
