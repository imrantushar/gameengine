<?php

namespace GameEngine\Addons\RewardsStore;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Rewards_Manager
 * Handles the redemption logic for the Rewards Store addon:
 * validates a user's balance/stock/per-user limit, spends the user's
 * points via the shared points engine, and records the redemption.
 */
class Rewards_Manager
{

    /**
     * Attempt to redeem a reward on behalf of a user.
     *
     * @param int $user_id
     * @param int $reward_id
     * @return array{success:bool, message:string, code:string, reward?:array}
     */
    public function redeem(int $user_id, int $reward_id): array
    {
        global $wpdb;

        $reward = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_rewards WHERE id = %d", $reward_id),
            ARRAY_A
        );

        if (! $reward) {
            return array('success' => false, 'code' => 'not_found', 'message' => __('Reward not found.', 'gameengine'));
        }

        if ('publish' !== $reward['status']) {
            return array('success' => false, 'code' => 'unavailable', 'message' => __('This reward is not currently available.', 'gameengine'));
        }

        $stock = (int) $reward['stock'];
        if (0 === $stock) {
            return array('success' => false, 'code' => 'out_of_stock', 'message' => __('This reward is out of stock.', 'gameengine'));
        }

        $limit_per_user = (int) $reward['limit_per_user'];
        if ($limit_per_user > 0) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $redeemed_count = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(id) FROM {$wpdb->prefix}gameengine_reward_redemptions WHERE user_id = %d AND reward_id = %d AND status = 'completed'",
                $user_id,
                $reward_id
            ));

            if ($redeemed_count >= $limit_per_user) {
                return array('success' => false, 'code' => 'limit_reached', 'message' => __('You have already redeemed this reward the maximum number of times.', 'gameengine'));
            }
        }

        $point_type_id = (int) $reward['point_type_id'] ?: 1;
        $cost_points   = (int) $reward['cost_points'];

        $balance = gameengine_get_total_points($user_id, $point_type_id);
        if ($balance < $cost_points) {
            return array('success' => false, 'code' => 'insufficient_points', 'message' => __('You do not have enough points to redeem this reward.', 'gameengine'));
        }

        $log_id = gameengine_deduct_points($user_id, $cost_points, 'reward_redeem', array(
            'point_type_id' => $point_type_id,
            'description'   => sprintf(__('Redeemed reward: %s', 'gameengine'), $reward['title']),
        ));

        if (! $log_id) {
            return array('success' => false, 'code' => 'deduction_failed', 'message' => __('Could not deduct points for this redemption. Please try again.', 'gameengine'));
        }

        if ($stock > 0) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->query($wpdb->prepare(
                "UPDATE {$wpdb->prefix}gameengine_rewards SET stock = stock - 1 WHERE id = %d",
                $reward_id
            ));
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->insert(
            "{$wpdb->prefix}gameengine_reward_redemptions",
            array(
                'user_id'      => $user_id,
                'reward_id'    => $reward_id,
                'points_spent' => $cost_points,
                'status'       => 'completed',
                'created_at'   => current_time('mysql'),
            )
        );

        wp_cache_delete('gameengine_rewards_list', 'gameengine_rewards');

        do_action('gameengine_reward_redeemed', $user_id, $reward_id, $cost_points);

        return array(
            'success'          => true,
            'code'             => 'redeemed',
            'message'          => sprintf(__('You redeemed "%s" for %d points.', 'gameengine'), $reward['title'], $cost_points),
            'remaining_points' => gameengine_get_total_points($user_id, $point_type_id),
            'remaining_stock'  => $stock > 0 ? $stock - 1 : $stock,
        );
    }
}
