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
        add_filter('gamify_available_triggers', [$self, 'register_woocommerce_triggers']);
    }

    /**
     * Register WooCommerce Triggers
     */
    public function register_woocommerce_triggers($triggers)
    {
        // 1. Make New Purchase (Any Product)
        $triggers['woocommerce_new_purchase'] = [
            'label'       => __('Make new purchase', 'gamify'),
            'description' => __('Fires when a user completes any purchase.', 'gamify'),
            'hook'        => 'woocommerce_order_status_completed',
            'args_count'  => 1,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement',],
            'get_user_id' => function ($order_id) {
                if (!function_exists('wc_get_order')) return 0;
                $order = wc_get_order($order_id);
                return $order ? $order->get_user_id() : 0;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 50, 'required' => true],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Purchase Reward', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 10, 'required' => true],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Purchase Penalty', 'gamify')],
            ]
        ];

        // 2. Purchase Specific Product
        $triggers['woocommerce_purchase_specific_product'] = [
            'label'       => __('Purchase specific product', 'gamify'),
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
                'product_id' => ['type' => 'number', 'label' => __('Product ID', 'gamify'), 'required' => true],
                'points'     => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 100, 'required' => true],
                'limit'      => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_time' => '1 Time Only'], 'default' => '1_time'],
                'label'      => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Specific Product Reward', 'gamify')],
            ],
            'deduct_fields' => [
                'product_id' => ['type' => 'number', 'label' => __('Product ID', 'gamify'), 'required' => true],
                'points'     => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 20, 'required' => true],
                'limit'      => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited'],
                'label'      => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Specific Product Penalty', 'gamify')],
            ]
        ];

        // 3. Publish New Product
        $triggers['woocommerce_publish_product'] = [
            'label'       => __('Publish new product', 'gamify'),
            'description' => __('Fires when a user publishes a new product.', 'gamify'),
            'hook'        => 'publish_product',
            'args_count'  => 2,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($post_id, $post) {
                return $post->post_author;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 20],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Product Published Reward', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 5],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Product Published Penalty', 'gamify')],
            ]
        ];

        // 4. Review a Product
        $triggers['woocommerce_review_product'] = [
            'label'       => __('Review a product', 'gamify'),
            'description' => __('Fires when a user reviews any product.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($comment_id) {
                $comment = get_comment($comment_id);
                return $comment->user_id;
            },
            'award_fields' => [
                'points' => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 10],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited', '1_per_day' => '1 Per Day'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Product Review Reward', 'gamify')],
            ],
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 5],
                'limit'  => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['unlimited' => 'Unlimited'], 'default' => 'unlimited'],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Product Review Penalty', 'gamify')],
            ]
        ];

        // 5. Review Specific Product
        $triggers['woocommerce_review_specific_product'] = [
            'label'       => __('Review specific product', 'gamify'),
            'description' => __('Fires when a user reviews a specific product.', 'gamify'),
            'hook'        => 'comment_post',
            'args_count'  => 2,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($comment_id) {
                $comment = get_comment($comment_id);
                return $comment->user_id;
            },
            'award_fields' => [
                'product_id' => ['type' => 'number', 'label' => __('Product ID', 'gamify'), 'required' => true],
                'points'     => ['type' => 'number', 'label' => __('Points', 'gamify'), 'default' => 20],
                'limit'      => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['1_time' => '1 Time Only'], 'default' => '1_time'],
                'label'      => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Specific Review Reward', 'gamify')],
            ],
            'deduct_fields' => [
                'product_id' => ['type' => 'number', 'label' => __('Product ID', 'gamify'), 'required' => true],
                'points'     => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 10],
                'limit'      => ['type' => 'select', 'label' => __('Limit', 'gamify'), 'options' => ['1_time' => '1 Time Only'], 'default' => '1_time'],
                'label'      => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Specific Review Penalty', 'gamify')],
            ]
        ];

        // 6. Refund a Purchase
        $triggers['woocommerce_refund_purchase'] = [
            'label'       => __('Refund a purchase', 'gamify'),
            'description' => __('Fires when any order is fully refunded.', 'gamify'),
            'hook'        => 'woocommerce_order_status_refunded',
            'args_count'  => 1,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement'], // Only deduct points usually
            'get_user_id' => function ($order_id) {
                if (!function_exists('wc_get_order')) return 0;
                $order = wc_get_order($order_id);
                return $order ? $order->get_user_id() : 0;
            },
            'award_fields' => [], // Refund usually doesn't award
            'deduct_fields' => [
                'points' => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 50, 'required' => true],
                'label'  => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Order Refunded', 'gamify')],
            ]
        ];

        // 7. Refund Specific Product
        $triggers['woocommerce_refund_specific_product'] = [
            'label'       => __('Refund specific product', 'gamify'),
            'description' => __('Fires when a specific product is refunded.', 'gamify'),
            'hook'        => 'woocommerce_order_status_refunded',
            'args_count'  => 1,
            'type'        => 'woocommerce',
            'category'    => 'woocommerce',
            'supports'    => ['point_type', 'achievement'],
            'get_user_id' => function ($order_id) {
                if (!function_exists('wc_get_order')) return 0;
                $order = wc_get_order($order_id);
                return $order ? $order->get_user_id() : 0;
            },
            'award_fields' => [],
            'deduct_fields' => [
                'product_id' => ['type' => 'number', 'label' => __('Product ID', 'gamify'), 'required' => true],
                'points'     => ['type' => 'number', 'label' => __('Deduct Points', 'gamify'), 'default' => 100, 'required' => true],
                'label'      => ['type' => 'text', 'label' => __('Log Description', 'gamify'), 'default' => __('Product Refunded', 'gamify')],
            ]
        ];

        return $triggers;
    }
}
