<?php

namespace Gamify\Integrations;

class WooCommerce extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'woocommerce';
    }
    public static function get_name(): string
    {
        return __('WooCommerce', 'gamify');
    }
    public static function get_icon(): string
    {
        return 'dashicons-cart';
    }

    public static function get_triggers(): array
    {
        return [
            'woocommerce_new_purchase' => [
                'label' => __('New Purchase', 'gamify'),
                'hook' => 'woocommerce_order_status_completed',
                'args_count' => 1,
                'description' => __('New purchase successfully  into your website.', 'gamify'),
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => array_merge([
                    ['key' => 'min_spend', 'label' => __('Minimum Spend (Pro)', 'gamify'), 'type' => 'number', 'is_pro' => true],
                    ['key' => 'calc_type', 'label' => __('Points Calculation (Pro)', 'gamify'), 'type' => 'select', 'is_pro' => true, 'options' => [['label' => 'Fixed', 'value' => 'fixed'], ['label' => 'Percent of Total', 'value' => 'percent']]]
                ], self::get_standard_schema())
            ],
            'woocommerce_purchase_specific_product' => [
                'label' => __('Purchase Specific Product', 'gamify'),
                'hook' => 'woocommerce_order_status_completed',
                'description' => __('Purchase product successfully  into your website.', 'gamify'),
                'args_count' => 1,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => array_merge([
                    ['key' => 'product_id', 'label' => __('Select Product', 'gamify'), 'type' => 'select', 'dynamic' => ['integration' => 'woocommerce', 'query' => 'products']],
                    ['key' => 'qty_multiplier', 'label' => __('Quantity Multiplier (Pro)', 'gamify'), 'type' => 'switch', 'is_pro' => true]
                ], self::get_standard_schema())
            ],
            'woocommerce_publish_product' => [
                'label' => __('Publish Product', 'gamify'),
                'hook' => 'publish_product',
                'description' => __('Publish product successfully  into your website.', 'gamify'),
                'args_count' => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => self::get_standard_schema()
            ],
            'woocommerce_review_product' => [
                'label' => __('Review Product', 'gamify'),
                'hook' => 'comment_post',
                'description' => __('Review product successfully  into your website.', 'gamify'),
                'args_count' => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    return $c ? $c->user_id : 0;
                },
                'schema' => array_merge([
                    ['key' => 'media_bonus', 'label' => __('Photo/Video Review Bonus (Pro)', 'gamify'), 'type' => 'switch', 'is_pro' => true]
                ], self::get_standard_schema())
            ],
            'woocommerce_refund_purchase' => [
                'label' => __('Refund Order', 'gamify'),
                'hook' => 'woocommerce_order_status_refunded',
                'description' => __('Refund purchase successfully  into your website.', 'gamify'),
                'args_count' => 1,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::get_standard_schema('deduct')
            ]
        ];
    }
    public static function get_dynamic_queries(): array
    {
        return [
            'products' => function () {
                if (!function_exists('wc_get_products')) return [];
                $products = wc_get_products(['limit' => 20]);
                return array_map(fn($p) => ['label' => $p->get_name(), 'value' => $p->get_id()], $products);
            }
        ];
    }
}
