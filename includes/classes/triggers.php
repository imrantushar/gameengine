<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

use GameEngine\Classes\PointsManager;
use GameEngine\Classes\AchievementsManager;
use GameEngine\Classes\LevelsManager;
use GameEngine\Classes\TriggerRegistry;

/**
 * Handles the execution of triggers and reward logic.
 * Connects WordPress/Addon hooks to the GameEngine engine.
 */
class Triggers
{
    private $points_manager;
    private $achievements_manager;

    /**
     * Initialize the Trigger Engine and register hooks.
     */
    public static function init()
    {
        $self = new self();
        TriggerRegistry::init();
        $self->attach_hooks();
        $self->init_site_tracking();
    }

    /**
     * Constructor: Initialize necessary managers.
     */
    public function __construct()
    {
        $this->points_manager = new PointsManager();
        $this->achievements_manager = new AchievementsManager();
    }

    /**
     * Injects tracking code to detect site visits.
     */
    public function init_site_tracking()
    {
        add_action('wp_head', function () {
            if (is_user_logged_in()) {
                global $post;
                $post_id = $post ? $post->ID : 0;
                do_action('gameengine_site_visit', get_current_user_id(), $post_id);
            }
        });
    }

    /**
     * Dynamically attaches all registered triggers to their WordPress hooks.
     */
    public function attach_hooks()
    {
        $triggers = TriggerRegistry::get_all_triggers();

        foreach ($triggers as $key => $config) {
            if (empty($config['hook']))
                continue;

            $args_count = isset($config['args_count']) ? (int) $config['args_count'] : 1;

            add_action($config['hook'], function () use ($key, $config) {
                $this->execute($key, $config, func_get_args());
            }, 10, $args_count);
        }
    }

    /**
     * Main execution flow when a hook is fired.
     */
    public function execute($trigger_key, $config, $hook_args)
    {
        global $wpdb;

        // Fallback to fetch config from registry if not provided
        if (empty($config) || !isset($config['get_user_id'])) {
            $config = TriggerRegistry::get($trigger_key);
        }

        if (!$config || !is_callable($config['get_user_id'])) {
            return;
        }

        // Identify the user associated with this hook
        $user_id = call_user_func_array($config['get_user_id'], $hook_args);
        $safe_user_id = absint($user_id);

        if ($safe_user_id <= 0) {
            return;
        }

        // Fetch all active requirements (rules) for this specific trigger
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_requirements WHERE trigger_key = %s AND is_active = 1 ORDER BY priority ASC, id ASC",
            sanitize_key($trigger_key)
        ));

        if (empty($rules)) {
            return;
        }

        $total_points_awarded = 0;
        $first_rule_processed = false;

        foreach ($rules as $rule) {
            $params = json_decode($rule->parameters, true);

            // Validate Time-Based restrictions (Pro Logic)
            if (!$this->check_timing_validity($params)) {
                continue;
            }

            // Validate Conditional Logic (Specific Post IDs, Products, or Roles)
            if (!$this->check_conditions($trigger_key, $params, $hook_args)) {
                continue;
            }

            // Calculate potential points if it's a point type reward
            $potential_points = 0;
            if ($rule->reward_type === 'point_type' && $rule->action_type === 'award') {
                $base_points = isset($params['points']) ? intval($params['points']) : 0;
                $potential_points = apply_filters('gameengine_pro_point_amount', $base_points, $rule, $params, $hook_args);
            }

            // Process the actual Reward or Deduction
            // We pass the potentially capped points to the processor via a temporary filter or modified params
            if ($potential_points > 0 || $rule->reward_type !== 'point_type' || $rule->action_type === 'deduct') {
                $rule_success = $this->process_single_rule($rule, $safe_user_id, $config, $hook_args, $potential_points);
                if ($rule_success) {
                    $first_rule_processed = true;
                    if ($rule->reward_type === 'point_type' && $rule->action_type === 'award') {
                        $total_points_awarded += $potential_points;
                    }
                }
            }
        }
    }

    /**
     * Validates if the action is occurring within allowed hours or days.
     */
    private function check_timing_validity($params)
    {
        return apply_filters('gameengine_check_timing_validity', true, $params);
    }

    /**
     * Handles the rewarding or revoking logic for a single rule.
     * Updated to support Pro features via filters.
     * 
     * @return bool Success status
     */
    private function process_single_rule($rule, $user_id, $config, $hook_args, $points_override = null)
    {
        $params = json_decode($rule->parameters, true);

        $can_unlock = apply_filters('gameengine_can_user_unlock_reward', true, $user_id, $rule);

        if (!$can_unlock) {
            return false;
        }

        //  Validate Pro Conditional Logic (Word Count, Min Spend, etc.)
        // This filter allows the Pro folder to stop the process if conditions aren't met.
        if (!apply_filters('gameengine_validate_pro_logic', true, $rule->trigger_key, $params, $hook_args)) {
            return false;
        }

        //  Check frequency limits (Daily, Weekly, Monthly, etc.)
        if (!$this->check_limit_validity((int) $user_id, (int) $rule->id, $params)) {
            return false;
        }

        $success = false;
        $safe_user_id = absint($user_id);

        // A. Handle Point-based rewards/penalties
        if ($rule->reward_type === 'point_type') {
            $points = ($points_override !== null) ? $points_override : (isset($params['points']) ? intval($params['points']) : 0);

            // Only apply filters if no override was provided (override already includes filtered/capped points)
            if ($points_override === null) {
                $points = apply_filters('gameengine_pro_point_amount', $points, $rule, $params, $hook_args);
            }

            $args = [
                'description' => $params['log_label'] ?? ($params['label'] ?? $config['label']),
                'requirement_id' => $rule->id,
                'point_type_id' => $rule->reward_id
            ];

            if ($rule->action_type === 'deduct') {
                $success = $this->points_manager->deduct($safe_user_id, $points, $rule->trigger_key, $args);
            } else {
                $success = $this->points_manager->add($safe_user_id, $points, $rule->trigger_key, $args);
            }
        }
        //  Handle Achievement-based rewards/penalties
        elseif ($rule->reward_type === 'achievement') {
            if ($rule->action_type === 'deduct') {
                $success = $this->achievements_manager->revoke($safe_user_id, (int) $rule->reward_id);
            } else {
                $success = $this->achievements_manager->award($safe_user_id, (int) $rule->reward_id, $rule->trigger_key, ['requirement_id' => $rule->id]);
            }
        }
        // Handle Level-based rewards
        elseif ($rule->reward_type === 'level') {
            $levels_manager = new LevelsManager();
            $success = $levels_manager->award($safe_user_id, (int) $rule->reward_id, $rule->trigger_key);
        }

        // If the transaction was successful, update the user progress record
        if ($success) {
            $this->update_requirement_progress($safe_user_id, (int) $rule->id);
        }

        return (bool) $success;
    }

    /**
     * Validates specific conditions like Target Roles, Post IDs, or WooCommerce Product IDs.
     */
    private function check_conditions($key, $params, $args)
    {
        // WordPress: Role Change Check
        if ($key === 'user_role_change') {
            $new_role = isset($args[1]) ? $args[1] : '';
            $target_role = isset($params['target_role']) ? $params['target_role'] : '';
            return (!empty($new_role) && $new_role === $target_role);
        }

        // Interaction: Specific Post Visit Check
        if ($key === 'visit_specific_post') {
            $current_post_id = isset($args[1]) ? (int) $args[1] : 0;
            $target_post_id = isset($params['post_id']) ? (int) $params['post_id'] : 0;
            $target_categories = isset($params['categories']) ? (array) $params['categories'] : [];

            // 1. Check for specific post match
            if ($target_post_id > 0 && $current_post_id === $target_post_id) {
                return true;
            }

            // 2. Check for category match if no specific post match was found
            if (!empty($target_categories)) {
                $post_categories = wp_get_post_categories($current_post_id);
                foreach ($target_categories as $cat_id) {
                    if (in_array((int) $cat_id, $post_categories)) {
                        return true;
                    }
                }
            }

            return false;
        }

        // GameEngine: Specific Achievement Unlock Event
        if ($key === 'unlock_specific_achievement') {
            $unlocked_id = isset($args[1]) ? (int) $args[1] : 0;
            $target_id = isset($params['achievement_id']) ? (int) $params['achievement_id'] : 0;
            return ($unlocked_id > 0 && $unlocked_id === $target_id);
        }

        // WooCommerce: Specific Product Purchased or Refunded
        if ($key === 'woocommerce_purchase_specific_product' || $key === 'woocommerce_refund_specific_product') {
            if (!function_exists('wc_get_order'))
                return false;
            $order = wc_get_order($args[0]);
            $target_id = isset($params['product_id']) ? (int) $params['product_id'] : 0;
            if (!$order || $target_id <= 0)
                return false;
            foreach ($order->get_items() as $item) {
                if ((int) $item->get_product_id() === $target_id || (int) $item->get_variation_id() === $target_id)
                    return true;
            }
            return false;
        }

        // WooCommerce: Specific Product Review Check
        if ($key === 'woocommerce_review_specific_product') {
            $comment = get_comment($args[0]);
            $target_id = isset($params['product_id']) ? (int) $params['product_id'] : 0;
            return ($comment && (int) $comment->comment_post_ID === $target_id);
        }

        //  Academy LMS: Course ID Check (Completed or Enrolled)
        if ($key === 'academy_course_completed' || $key === 'academy_new_enrollment') {
            $current_course_id = isset($args[0]) ? absint($args[0]) : 0;
            $target_course_id = isset($params['course_id']) ? absint($params['course_id']) : 0;
            return (0 === $target_course_id || $current_course_id === $target_course_id);
        }

        //  Academy LMS: Lesson ID Check
        if ($key === 'academy_lesson_completed') {
            $current_lesson_id = isset($args[2]) ? absint($args[2]) : 0;
            $target_lesson_id = isset($params['topic_id']) ? absint($params['topic_id']) : 0;
            return (0 === $target_lesson_id || $current_lesson_id === $target_lesson_id);
        }

        //  Academy LMS: Quiz ID Check
        if ($key === 'academy_quiz_passed') {
            $attempt_data = $args[0];
            $current_quiz_id = isset($attempt_data->quiz_id) ? absint($attempt_data->quiz_id) : 0;
            $target_quiz_id = isset($params['quiz_id']) ? absint($params['quiz_id']) : 0;
            return (0 === $target_quiz_id || $current_quiz_id === $target_quiz_id);
        }

        // ── StoreEngine ───────────────────────────────────────────────────────

        // StoreEngine: Purchase Specific Product
        // Hook args: ($order, $payload) — $args[0] is the SE Order object.
        // SE Order::get_items() returns objects with a public $product_id property.
        // Leaving product_id blank (0) makes the trigger fire for any product.
        if ($key === 'storeengine_purchase_specific_product') {
            $order = isset($args[0]) ? $args[0] : null;
            $target_id = isset($params['product_id']) ? absint($params['product_id']) : 0;

            if (!$order || !method_exists($order, 'get_items')) {
                return false;
            }

            // No product restriction configured — always pass.
            if ($target_id <= 0) {
                return true;
            }

            foreach ($order->get_items() as $item) {
                if (absint($item->product_id) === $target_id) {
                    return true;
                }
            }

            return false;
        }

        // StoreEngine: Product Review on Specific Product
        // Hook args: ($comment_id, $comment_post_ID, $rating) — $args[1] is the product post ID.
        // Leaving product_id blank (0) makes the trigger fire for reviews on any SE product.
        if ($key === 'storeengine_product_review') {
            $target_id = isset($params['product_id']) ? absint($params['product_id']) : 0;
            $reviewed_product_id = isset($args[1]) ? absint($args[1]) : 0;

            return (0 === $target_id || $reviewed_product_id === $target_id);
        }



        return true;
    }

    /**
     * Validates if the user is allowed to earn rewards based on frequency limits.
     */
    private function check_limit_validity($user_id, $requirement_id, $params)
    {
        global $wpdb;
        $limit_type = $params['limit'] ?? 'unlimited';

        if ($limit_type === 'unlimited')
            return true;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $progress = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_requirement_progress WHERE user_id = %d AND requirement_id = %d",
            absint($user_id),
            absint($requirement_id)
        ));

        if (!$progress)
            return true;
        if ($limit_type === '1_time')
            return false;

        $last_update_time = strtotime($progress->last_updated);
        $current_time = current_time('timestamp');

        // Check different time boundaries
        if ($limit_type === '1_per_day')
            return gmdate('Y-m-d', $last_update_time) !== gmdate('Y-m-d', $current_time);
        if ($limit_type === '1_per_week')
            return gmdate('W-Y', $last_update_time) !== gmdate('W-Y', $current_time);
        if ($limit_type === '1_per_month')
            return gmdate('m-Y', $last_update_time) !== gmdate('m-Y', $current_time);


        return true;
    }

    /**
     * Updates or creates the progress record for a specific requirement.
     */
    private function update_requirement_progress($user_id, $requirement_id)
    {
        global $wpdb;
        $now = current_time('mysql');
        $safe_uid = absint($user_id);
        $safe_rid = absint($requirement_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gameengine_requirement_progress WHERE user_id = %d AND requirement_id = %d",
            $safe_uid,
            $safe_rid
        ));

        if ($exists) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query($wpdb->prepare(
                "UPDATE {$wpdb->prefix}gameengine_requirement_progress SET progress_count = progress_count + 1, last_updated = %s WHERE id = %d",
                $now,
                absint($exists)
            ));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->insert($wpdb->prefix . 'gameengine_requirement_progress', [
                'user_id' => $safe_uid,
                'requirement_id' => $safe_rid,
                'progress_count' => 1,
                'last_updated' => $now
            ], ['%d', '%d', '%d', '%s']);
        }
    }
}
