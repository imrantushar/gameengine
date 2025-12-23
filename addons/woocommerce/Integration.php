<?php

namespace Gamify\Addons\Woocommerce;

use Gamify\Classes\PointsManager;
use Gamify\Classes\TriggerRegistry;
use Gamify\Classes\Triggers;

if (! defined('ABSPATH')) {
    exit;
}

class Integration
{
    public static function init()
    {
        $self = new self();

        // 1. Product Meta (Admin) - Set Points for Product
        add_action('woocommerce_product_options_general_product_data', [$self, 'add_gamify_product_fields']);
        add_action('woocommerce_process_product_meta', [$self, 'save_gamify_product_fields']);

        // 2. Reward Points on Purchase Complete
        add_action('woocommerce_order_status_completed', [$self, 'award_points_on_purchase']);

        // 3. Deduct Points on Refund (Optional)
        add_action('woocommerce_order_status_refunded', [$self, 'deduct_points_on_refund']);
    }

    /**
     * Add "Points Reward" field to Product Data > General
     */
    public function add_gamify_product_fields()
    {
        echo '<div class="options_group">';

        woocommerce_wp_text_input([
            'id'          => '_gamify_reward_points',
            'label'       => __('Reward Points', 'gamify'),
            'description' => __('Enter the number of points a user gets for purchasing this product.', 'gamify'),
            'desc_tip'    => true,
            'type'        => 'number',
        ]);

        echo '</div>';
    }

    /**
     * Save Product Fields
     */
    public function save_gamify_product_fields($post_id)
    {
        $points = isset($_POST['_gamify_reward_points']) ? absint($_POST['_gamify_reward_points']) : '';
        if ($points !== '') {
            update_post_meta($post_id, '_gamify_reward_points', $points);
        }
    }

    /**
     * Award Points when Order is Completed
     */
    public function award_points_on_purchase($order_id)
    {
        $order = wc_get_order($order_id);
        if (!$order) return;

        $user_id = $order->get_user_id();
        if (!$user_id) return; // Guest checkout, no points (unless you want to handle guests)

        $points_manager = new PointsManager();
        $total_reward = 0;

        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            $reward_points = (int) get_post_meta($product_id, '_gamify_reward_points', true);

            if ($reward_points > 0) {
                $qty = $item->get_quantity();
                $points = $reward_points * $qty;

                // Log per product or bulk? Let's do bulk for now or per item.
                // Doing per item allows better logging.
                $points_manager->add(
                    $user_id,
                    $points,
                    'woocommerce_purchase',
                    [
                        'description' => sprintf(__('Purchased %s (x%d)', 'gamify'), $item->get_name(), $qty),
                        'reference_id' => $order_id
                    ]
                );

                $total_reward += $points;
            }
        }
    }

    /**
     * Deduct Points on Refund
     */
    public function deduct_points_on_refund($order_id)
    {
        $order = wc_get_order($order_id);
        if (!$order) return;

        $user_id = $order->get_user_id();
        if (!$user_id) return;

        $points_manager = new PointsManager();

        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            $reward_points = (int) get_post_meta($product_id, '_gamify_reward_points', true);

            if ($reward_points > 0) {
                $qty = $item->get_quantity();
                $points = $reward_points * $qty;

                $points_manager->deduct(
                    $user_id,
                    $points,
                    'woocommerce_refund',
                    [
                        'description' => sprintf(__('Refunded %s (x%d)', 'gamify'), $item->get_name(), $qty),
                        'reference_id' => $order_id
                    ]
                );
            }
        }
    }
}
