<?php

namespace Gamify\Classes;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\LevelsManager;
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
     */
    public static function init()
    {
        $self = new self();
        TriggerRegistry::init();
        $self->attach_hooks();
    }

    /**
     * Constructor to setup managers.
     */
    public function __construct()
    {
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
            if (empty($config['hook'])) {
                continue;
            }

            add_action($config['hook'], function () use ($key, $config) {
                $this->execute($key, $config, func_get_args());
            }, 10, $config['args_count']);
        }
    }

    /**
     * Execute the trigger logic.
     */
    public function execute(string $trigger_key, array $config, array $hook_args)
    {
        global $wpdb;
        $table_requirements = $wpdb->prefix . 'gamify_requirements';

        if (!is_callable($config['get_user_id'])) {
            return;
        }

        $user_id = call_user_func_array($config['get_user_id'], $hook_args);

        if (! $user_id || $user_id <= 0) {
            return;
        }

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_requirements} WHERE trigger_key = %s AND is_active = 1",
            $trigger_key
        ));

        if (empty($rules)) {
            return;
        }

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

        // Special Check: Specific Achievement Unlock
        if ($rule->trigger_key === 'unlock_specific_achievement') {
            $unlocked_id = isset($hook_args[1]) ? intval($hook_args[1]) : 0;
            $target_id = isset($params['achievement_id']) ? intval($params['achievement_id']) : 0;

            if ($unlocked_id !== $target_id) {
                return;
            }
        }

        if (! $this->check_limit_validity($user_id, $rule->id, $params)) {
            return;
        }

        $success = false;

        // Case A: Point Type Reward
        if ($rule->reward_type === 'point_type') {
            $points = isset($params['points']) ? intval($params['points']) : 0;
            $action_type = $rule->action_type ?? 'award';
            $description = isset($params['label']) && !empty($params['label']) ? $params['label'] : $config['label'];

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
        // Case B: Achievement Reward
        elseif ($rule->reward_type === 'achievement') {
            $achievement_id = $rule->reward_id;
            $success = $this->achievements_manager->award(
                $user_id,
                $achievement_id,
                $rule->trigger_key,
                ['requirement_id' => $rule->id]
            );
        }
        // Case C: Level Reward
        elseif ($rule->reward_type === 'level') {
            $levels_manager = new LevelsManager();
            $level_id = $rule->reward_id;
            $success = $levels_manager->award(
                $user_id,
                $level_id,
                $rule->trigger_key
            );
        }

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

        if ($limit_type === 'unlimited') {
            return true;
        }

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $progress = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        if ($limit_type === '1_time' && $progress) {
            return false;
        }

        if ($limit_type === '1_per_day' && $progress) {
            // FIX: Use gmdate() instead of date()
            $last_date = gmdate('Y-m-d', strtotime($progress->last_updated));
            $today_date = current_time('Y-m-d'); // WP Timezone aware date

            if ($last_date === $today_date) {
                return false;
            }
        }

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

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        if ($exists) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
            $wpdb->query($wpdb->prepare(
                "UPDATE {$table_progress} 
                 SET progress_count = progress_count + 1, last_updated = %s 
                 WHERE id = %d",
                $now,
                $exists
            ));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
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
