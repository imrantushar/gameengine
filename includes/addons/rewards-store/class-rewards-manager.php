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
     * The point type a reward is priced in.
     *
     * The reward form has no point type field, and the API used to store 1 for
     * every reward — an id that only exists on a site whose first points system
     * was never deleted. A stored type that is not a published point type
     * therefore falls back to the first one that is. Returns 0 when the site has
     * no points system at all.
     *
     * @param int $point_type_id Stored point type id, or 0 for the default.
     * @return int
     */
    public static function resolve_point_type_id(int $point_type_id): int
    {
        $published = array_map('intval', array_column(\GameEngine\Classes\PointsManager::get_point_types(), 'id'));

        if ($point_type_id > 0 && in_array($point_type_id, $published, true)) {
            return $point_type_id;
        }

        return $published[0] ?? 0;
    }

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

        $point_type_id = self::resolve_point_type_id((int) $reward['point_type_id']);
        $cost_points   = (int) $reward['cost_points'];

        if (! $point_type_id) {
            return array('success' => false, 'code' => 'no_point_type', 'message' => __('Rewards cannot be redeemed until a points system is set up.', 'gameengine'));
        }

        $balance = gameengine_get_total_points($user_id, $point_type_id);
        if ($balance < $cost_points) {
            return array('success' => false, 'code' => 'insufficient_points', 'message' => __('You do not have enough points to redeem this reward.', 'gameengine'));
        }

        $log_id = gameengine_deduct_points($user_id, $cost_points, 'reward_redeem', array(
            'point_type_id' => $point_type_id,
            'description'   => sprintf(/* translators: %s: the reward's title. */ __('Redeemed reward: %s', 'gameengine'), $reward['title']),
        ));

        if (! $log_id) {
            return array('success' => false, 'code' => 'deduction_failed', 'message' => __('Could not deduct points for this redemption. Please try again.', 'gameengine'));
        }

        // Record the redemption before touching stock, and give the points back
        // if it cannot be recorded: a failed write used to keep the member's
        // points and leave nothing to show for them.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $recorded = $wpdb->insert(
            "{$wpdb->prefix}gameengine_reward_redemptions",
            array(
                'user_id'      => $user_id,
                'reward_id'    => $reward_id,
                'points_spent' => $cost_points,
                'status'       => 'completed',
                'created_at'   => current_time('mysql'),
            )
        );

        if (false === $recorded) {
            gameengine_add_points($user_id, $cost_points, 'reward_refund', array(
                'point_type_id' => $point_type_id,
                'description'   => sprintf(/* translators: %s: the reward's title. */ __('Refund for reward: %s', 'gameengine'), $reward['title']),
            ));

            return array('success' => false, 'code' => 'save_failed', 'message' => __('Could not record this redemption, so your points were returned. Please try again.', 'gameengine'));
        }

        if ($stock > 0) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->query($wpdb->prepare(
                "UPDATE {$wpdb->prefix}gameengine_rewards SET stock = stock - 1 WHERE id = %d",
                $reward_id
            ));
        }

        wp_cache_delete('gameengine_rewards_list', 'gameengine_rewards');

        do_action('gameengine_reward_redeemed', $user_id, $reward_id, $cost_points);

        return array(
            'success'          => true,
            'code'             => 'redeemed',
            'message'          => sprintf(/* translators: 1: the reward's title, 2: points spent. */ __('You redeemed "%1$s" for %2$d points.', 'gameengine'), $reward['title'], $cost_points),
            'remaining_points' => gameengine_get_total_points($user_id, $point_type_id),
            'remaining_stock'  => $stock > 0 ? $stock - 1 : $stock,
        );
    }
}
