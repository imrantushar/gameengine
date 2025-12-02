<?php

namespace Gamify\Classes;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\TriggerRegistry;

/**
 * Main Triggers service class.
 * Initializes the trigger system, registers hooks, and executes logic.
 */
class Triggers
{
    /**
     * @var PointsManager
     */
    private $points_manager;

    /**
     * @var AchievementsManager
     */
    private $achievements_manager;

    /**
     * Initialize the Trigger system.
     * This is the entry point called from the main plugin file.
     */
    public static function init()
    {
        $self = new self();

        // 1. Initialize Registry
        TriggerRegistry::init();

        // 2. Attach Hooks
        $self->attach_hooks();
    }

    /**
     * Constructor to setup managers.
     */
    public function __construct()
    {
        // Load Managers via Autoloader
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
            // Safety check for hook existence
            if (empty($config['hook'])) continue;

            add_action($config['hook'], function () use ($key, $config) {
                // Pass dynamic arguments from the hook to execute method
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
        if (!is_callable($config['get_user_id'])) return;

        $user_id = call_user_func_array($config['get_user_id'], $hook_args);

        if (! $user_id || $user_id <= 0) return;

        // 2. Query Active Rules for this trigger
        // (Optimization Idea: Cache these rules in a transient later)
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
     */
    private function process_single_rule($rule, $user_id, $config, $hook_args)
    {
        $params = json_decode($rule->parameters, true);

        // --- STEP 1: Check Limits (Progress Tracking) ---
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

            $args = [
                'description'    => $description,
                'requirement_id' => $rule->id,
                'point_type_id'  => $rule->reward_id
            ];

            if ($action_type === 'deduct') {
                $success = $this->points_manager->deduct($user_id, $points, $rule->trigger_key, $args);
            } else {
                $success = $this->points_manager->add($user_id, $points, $rule->trigger_key, $args);
            }
        }

        // --- CASE B: ACHIEVEMENT REWARD ---
        elseif ($rule->reward_type === 'achievement') {
            $achievement_id = $rule->reward_id;

            $success = $this->achievements_manager->award(
                $user_id,
                $achievement_id,
                $rule->trigger_key,
                ['requirement_id' => $rule->id]
            );
        }

        // --- STEP 2: Update Progress Tracking ---
        if ($success) {
            $this->update_requirement_progress($user_id, $rule->id);
        }
    }

    /**
     * Checks if the user is eligible based on limits.
     */
    private function check_limit_validity($user_id, $requirement_id, $params)
    {
        global $wpdb;
        $table_progress = $wpdb->prefix . 'gamify_requirement_progress';

        $limit_type = isset($params['limit']) ? $params['limit'] : 'unlimited';

        if ($limit_type === 'unlimited') return true;

        $progress = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        // One Time Only
        if ($limit_type === '1_time' && $progress) {
            return false;
        }

        // One Per Day
        if ($limit_type === '1_per_day' && $progress) {
            $last_date = date('Y-m-d', strtotime($progress->last_updated));
            $today_date = current_time('Y-m-d');

            if ($last_date === $today_date) {
                return false;
            }
        }

        // Limited Times
        if ($limit_type === 'limited') {
            $max_times = isset($params['times']) ? intval($params['times']) : 1;
            if ($progress && $progress->progress_count >= $max_times) {
                return false;
            }
        }

        return true;
    }

    /**
     * Updates progress table.
     */
    private function update_requirement_progress($user_id, $requirement_id)
    {
        global $wpdb;
        $table_progress = $wpdb->prefix . 'gamify_requirement_progress';
        $now = current_time('mysql');

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        if ($exists) {
            $wpdb->query($wpdb->prepare(
                "UPDATE {$table_progress} 
                 SET progress_count = progress_count + 1, last_updated = %s 
                 WHERE id = %d",
                $now,
                $exists
            ));
        } else {
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
