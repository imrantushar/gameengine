<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\LevelsManager;
use Gamify\Classes\TriggerRegistry;

class Triggers
{
    private $points_manager;
    private $achievements_manager;

    public static function init()
    {
        $self = new self();
        TriggerRegistry::init();
        $self->attach_hooks();
        $self->init_site_tracking();
    }

    public function __construct()
    {
        $this->points_manager = new PointsManager();
        $this->achievements_manager = new AchievementsManager();
    }

    public function init_site_tracking()
    {
        add_action('wp_head', function () {
            if (is_user_logged_in()) {
                global $post;
                $post_id = $post ? $post->ID : 0;
                do_action('gamify_site_visit', get_current_user_id(), $post_id);
            }
        });
    }

    public function attach_hooks()
    {
        $triggers = TriggerRegistry::get_all();
        foreach ($triggers as $key => $config) {
            if (empty($config['hook'])) continue;

            add_action($config['hook'], function () use ($key, $config) {
                $this->execute($key, $config, func_get_args());
            }, 10, $config['args_count']);
        }
    }

    public function execute($trigger_key, $config, $hook_args)
    {
        global $wpdb;
        $table_requirements = $wpdb->prefix . 'gamify_requirements';

        if (!is_callable($config['get_user_id'])) return;

        $user_id = call_user_func_array($config['get_user_id'], $hook_args);

        if (!$user_id || $user_id <= 0) return;

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table_requirements} WHERE trigger_key = %s AND is_active = 1",
            $trigger_key
        ));

        if (empty($rules)) return;

        foreach ($rules as $rule) {
            $params = json_decode($rule->parameters, true);

            // 🔥 FIX: Call check_conditions here before processing
            if (!$this->check_conditions($trigger_key, $params, $hook_args)) {
                continue; // Skip if condition not met (e.g. wrong product purchased)
            }

            $this->process_single_rule($rule, $user_id, $config, $hook_args);
        }
    }

    private function process_single_rule($rule, $user_id, $config, $hook_args)
    {
        $params = json_decode($rule->parameters, true);

        // Limit Check
        if (!$this->check_limit_validity($user_id, $rule->id, $params)) {
            return;
        }

        $success = false;

        // Reward Logic
        if ($rule->reward_type === 'point_type') {
            $points = isset($params['points']) ? intval($params['points']) : 0;
            $args = [
                'description'    => $params['label'] ?? $config['label'],
                'requirement_id' => $rule->id,
                'point_type_id'  => $rule->reward_id
            ];

            if ($rule->action_type === 'deduct') {
                $success = $this->points_manager->deduct($user_id, $points, $rule->trigger_key, $args);
            } else {
                $success = $this->points_manager->add($user_id, $points, $rule->trigger_key, $args);
            }
        } elseif ($rule->reward_type === 'achievement') {
            $success = $this->achievements_manager->award($user_id, $rule->reward_id, $rule->trigger_key, ['requirement_id' => $rule->id]);
        } elseif ($rule->reward_type === 'level') {
            $levels_manager = new LevelsManager();
            $success = $levels_manager->award($user_id, $rule->reward_id, $rule->trigger_key);
        }

        if ($success) {
            $this->update_requirement_progress($user_id, $rule->id);
        }
    }

    private function check_conditions($key, $params, $args)
    {
        // 1. Gamify: Specific Achievement Unlock
        if ($key === 'unlock_specific_achievement') {
            $unlocked_id = isset($args[1]) ? intval($args[1]) : 0;
            $target_id = isset($params['achievement_id']) ? intval($params['achievement_id']) : 0;
            return $unlocked_id === $target_id;
        }

        // 2. Interaction: Visit Specific Post
        if ($key === 'visit_specific_post') {
            $current_post_id = isset($args[1]) ? intval($args[1]) : 0;
            $target_post_id = isset($params['post_id']) ? intval($params['post_id']) : 0;
            return $current_post_id === $target_post_id;
        }

        // 3. WooCommerce: Specific Product Purchased
        if ($key === 'woocommerce_specific_product_purchased') {
            if (!function_exists('wc_get_order')) return false;

            $order_id = $args[0];
            $target_product_id = intval($params['product_id']);
            $order = wc_get_order($order_id);

            if (!$order) return false;

            foreach ($order->get_items() as $item) {
                if ($item->get_product_id() === $target_product_id || $item->get_variation_id() === $target_product_id) {
                    return true;
                }
            }
            return false;
        }

        // 4. Earn/Expend Points Amount Check
        if ($key === 'earn_amount_points' || $key === 'expend_amount_points') {
            $amount = isset($args[1]) ? intval($args[1]) : 0;
            $required = intval($params['amount']);
            return $amount >= $required;
        }

        return true; // Default true for unconditional triggers (like login)
    }

    private function check_limit_validity($user_id, $requirement_id, $params)
    {
        global $wpdb;
        $table_progress = $wpdb->prefix . 'gamify_requirement_progress';
        $limit_type = $params['limit'] ?? 'unlimited';

        if ($limit_type === 'unlimited') return true;

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery
        $progress = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_progress} WHERE user_id = %d AND requirement_id = %d",
            $user_id,
            $requirement_id
        ));

        if ($limit_type === '1_time' && $progress) return false;

        if ($limit_type === '1_per_day' && $progress) {
            $last_date = gmdate('Y-m-d', strtotime($progress->last_updated));
            if ($last_date === current_time('Y-m-d')) return false;
        }

        return true;
    }

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
                "UPDATE {$table_progress} SET progress_count = progress_count + 1, last_updated = %s WHERE id = %d",
                $now,
                $exists
            ));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->insert($table_progress, ['user_id' => $user_id, 'requirement_id' => $requirement_id, 'progress_count' => 1, 'last_updated' => $now]);
        }
    }
}
