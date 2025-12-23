<?php

namespace Gamify\Addons\Woocommerce;

if (! defined('ABSPATH')) {
    exit;
}

class Integration
{
    public static function init()
    {
        $self = new self();
        // Priority 10 is default, but ensure it runs when TriggerRegistry fires apply_filters
        add_filter('gamify_available_triggers', [$self, 'register_woocommerce_triggers']);
    }

    /**
     * Register WooCommerce Triggers
     */
    public function register_woocommerce_triggers($triggers)
    {
        // 1. Product Purchased
        $triggers['woocommerce_product_purchased'] = [
            'label'       => __('Product Purchased', 'gamify'),
            'description' => __('Fires when a user purchases any product.', 'gamify'),
            'hook'        => 'woocommerce_order_status_completed',
            'args_count'  => 1,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement', 'level'],
            'get_user_id' => function ($order_id) {
                if (!function_exists('wc_get_order')) return 0;
                $order = wc_get_order($order_id);
                return $order ? $order->get_user_id() : 0;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 50, 'scope' => ['point_type']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'], 'default' => 'unlimited'],
            ]
        ];

        // 2. Specific Product Purchased
        $triggers['woocommerce_specific_product_purchased'] = [
            'label'       => __('Specific Product Purchased', 'gamify'),
            'description' => __('Fires when a specific product is purchased.', 'gamify'),
            'hook'        => 'woocommerce_order_status_completed',
            'args_count'  => 1,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($order_id) {
                if (!function_exists('wc_get_order')) return 0;
                $order = wc_get_order($order_id);
                return $order ? $order->get_user_id() : 0;
            },
            'award_fields' => [
                'product_id' => [
                    'type'     => 'number',
                    'label'    => __('Product ID', 'gamify'),
                    'required' => true
                ],
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 100, 'scope' => ['point_type']],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'], 'default' => '1_time'],
            ]
        ];

        return $triggers;
    }
}
