<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\LevelsManager;
use Gamify\Classes\TriggerRegistry;

/**
 * Handles the execution of triggers and logic for rewards.
 */
class Triggers
{
    private $points_manager;
    private $achievements_manager;

    /**
     * Initialize Triggers class and hooks.
     */
    public static function init()
    {
        $self = new self();
        TriggerRegistry::init();
        $self->attach_hooks();
        $self->init_site_tracking();
    }

    /**
     * Constructor for Triggers.
     */
    public function __construct()
    {
        $this->points_manager       = new PointsManager();
        $this->achievements_manager = new AchievementsManager();
    }

    /**
     * Initialize frontend site visit tracking.
     */
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

    /**
     * Attach all registered triggers to their corresponding WordPress hooks.
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
            }, 10, (int) $config['args_count']);
        }
    }

    /**
     * Main execution logic when a trigger is fired.
     */
    public function execute($trigger_key, $config, $hook_args)
    {
        global $wpdb;

        if (!is_callable($config['get_user_id'])) {
            return;
        }

        $user_id = call_user_func_array($config['get_user_id'], $hook_args);
        $safe_user_id = absint($user_id);

        if ($safe_user_id <= 0) {
            return;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rules = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gamify_requirements WHERE trigger_key = %s AND is_active = 1",
            sanitize_key($trigger_key)
        ));

        if (empty($rules)) {
            return;
        }

        foreach ($rules as $rule) {
            $params = json_decode($rule->parameters, true);

            if (!$this->check_conditions($trigger_key, $params, $hook_args)) {
                continue;
            }

            $this->process_single_rule($rule, $safe_user_id, $config, $hook_args);
        }
    }

    /**
     * Process a single reward rule.
     */
    private function process_single_rule($rule, $user_id, $config, $hook_args)
    {
        $params = json_decode($rule->parameters, true);

        if (!$this->check_limit_validity((int) $user_id, (int) $rule->id, $params)) {
            return;
        }

        $success = false;
        $safe_user_id = absint($user_id);

        if ($rule->reward_type === 'point_type') {
            $points = isset($params['points']) ? intval($params['points']) : 0;
            $args = [
                'description'    => $params['label'] ?? $config['label'],
                'requirement_id' => $rule->id,
                'point_type_id'  => $rule->reward_id
            ];

            if ($rule->action_type === 'deduct') {
                $success = $this->points_manager->deduct($safe_user_id, $points, $rule->trigger_key, $args);
            } else {
                $success = $this->points_manager->add($safe_user_id, $points, $rule->trigger_key, $args);
            }
        } elseif ($rule->reward_type === 'achievement') {
            $success = $this->achievements_manager->award($safe_user_id, (int) $rule->reward_id, $rule->trigger_key, ['requirement_id' => $rule->id]);
        } elseif ($rule->reward_type === 'level') {
            $levels_manager = new LevelsManager();
            $success = $levels_manager->award($safe_user_id, (int) $rule->reward_id, $rule->trigger_key);
        }

        if ($success) {
            $this->update_requirement_progress($safe_user_id, (int) $rule->id);
        }
    }

    /**
     * Check conditional logic for specific triggers (e.g., WC Product ID).
     */
    private function check_conditions($key, $params, $args)
    {
        if ($key === 'unlock_specific_achievement') {
            $unlocked_id = isset($args[1]) ? intval($args[1]) : 0;
            $target_id = isset($params['achievement_id']) ? intval($params['achievement_id']) : 0;
            return $unlocked_id === $target_id;
        }

        if ($key === 'visit_specific_post') {
            $current_post_id = isset($args[1]) ? intval($args[1]) : 0;
            $target_post_id = isset($params['post_id']) ? intval($params['post_id']) : 0;
            return $current_post_id === $target_post_id;
        }

        if ($key === 'woocommerce_specific_product_purchased' || $key === 'woocommerce_refund_specific_product') {
            if (!function_exists('wc_get_order')) {
                return false;
            }
            $order = wc_get_order($args[0]);
            $target_id = isset($params['product_id']) ? intval($params['product_id']) : 0;
            if (!$order) {
                return false;
            }
            foreach ($order->get_items() as $item) {
                if ($item->get_product_id() == $target_id || $item->get_variation_id() == $target_id) {
                    return true;
                }
            }
            return false;
        }

        if ($key === 'woocommerce_review_specific_product') {
            $comment = get_comment($args[0]);
            $target_id = isset($params['product_id']) ? intval($params['product_id']) : 0;
            return $comment && $comment->comment_post_ID == $target_id;
        }

        return true;
    }

    /**
     * Check if the user has reached the earning limit for a rule.
     */
    private function check_limit_validity($user_id, $requirement_id, $params)
    {
        global $wpdb;
        $limit_type = $params['limit'] ?? 'unlimited';

        if ($limit_type === 'unlimited') {
            return true;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $progress = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gamify_requirement_progress WHERE user_id = %d AND requirement_id = %d",
            absint($user_id),
            absint($requirement_id)
        ));

        if ($limit_type === '1_time' && $progress) {
            return false;
        }

        if ($limit_type === '1_per_day' && $progress) {
            return gmdate('Y-m-d', strtotime($progress->last_updated)) !== current_time('Y-m-d');
        }

        return true;
    }

    /**
     * Update or create progress record for a user requirement.
     */
    private function update_requirement_progress($user_id, $requirement_id)
    {
        global $wpdb;
        $now = current_time('mysql');
        $safe_uid = absint($user_id);
        $safe_rid = absint($requirement_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gamify_requirement_progress WHERE user_id = %d AND requirement_id = %d",
            $safe_uid,
            $safe_rid
        ));

        if ($exists) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query($wpdb->prepare(
                "UPDATE {$wpdb->prefix}gamify_requirement_progress SET progress_count = progress_count + 1, last_updated = %s WHERE id = %d",
                $now,
                absint($exists)
            ));
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert($wpdb->prefix . 'gamify_requirement_progress', [
                'user_id'        => $safe_uid,
                'requirement_id' => $safe_rid,
                'progress_count' => 1,
                'last_updated'   => $now
            ], ['%d', '%d', '%d', '%s']);
        }
    }
}
