<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) exit;

class WooCommerce extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'woocommerce';
    }

    public static function get_name(): string
    {
        return __('WooCommerce', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-cart';
    }

    public static function get_triggers(): array
    {
        return [
            'woocommerce_new_purchase' => [
                'label'       => __('New Purchase', 'gameengine'),
                'hook'        => 'woocommerce_order_status_completed',
                'args_count'  => 1,
                'description' => __('New purchase successfully into your website.', 'gameengine'),
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::merge_schema([
                    ['key' => 'calc_type', 'label' => __('Points Calculation', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'options' => [['label' => 'Fixed', 'value' => 'fixed'], ['label' => 'Percent of Order Total (Pro)', 'value' => 'percent', 'is_pro' => true]]],
                    ['key' => 'min_spend', 'label' => __('Minimum Spend (Pro)', 'gameengine'), 'type' => 'number', 'width'   => '50%', 'is_pro' => true],
                    ['key' => 'first_purchase', 'label' => __('First Purchase Only Bonus (Pro)', 'gameengine'), 'type' => 'switch', 'width'   => '100%', 'is_pro' => true],
                    ['key' => 'include_products', 'label' => __('Include Specific Products (Pro)', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => ['integration' => 'woocommerce', 'query' => 'products']],
                    ['key' => 'include_categories', 'label' => __('Include Specific Categories (Pro)', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => ['integration' => 'woocommerce', 'query' => 'product_cats']],
                    ['key' => 'exclude_products', 'label' => __('Exclude Specific Products (Pro)', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => ['integration' => 'woocommerce', 'query' => 'products']],
                    ['key' => 'exclude_categories', 'label' => __('Exclude Specific Categories (Pro)', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => ['integration' => 'woocommerce', 'query' => 'product_cats']]
                ])
            ],
            'woocommerce_purchase_specific_product' => [
                'label'       => __('Purchase Specific Product', 'gameengine'),
                'hook'        => 'woocommerce_order_status_completed',
                'description' => __('Purchase product successfully into your website.', 'gameengine'),
                'args_count'  => 1,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::merge_schema([
                    ['key' => 'product_id', 'label' => __('Select Product', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'dynamic' => ['integration' => 'woocommerce', 'query' => 'products']],
                    ['key' => 'categories', 'label' => __('Select Entire Category (Pro)', 'gameengine'), 'type' => 'select', 'width'   => '100%', 'is_multi' => true, 'is_pro' => true, 'dynamic' => ['integration' => 'woocommerce', 'query' => 'product_cats']],
                    ['key' => 'qty_multiplier', 'label' => __('Quantity Based Multiplier (Pro)', 'gameengine'), 'type' => 'switch', 'width'   => '100%', 'is_pro' => true]
                ])
            ],
            'woocommerce_publish_product' => [
                'label'       => __('Publish Product', 'gameengine'),
                'hook'        => 'publish_product',
                'description' => __('Publish product successfully into your website.', 'gameengine'),
                'args_count'  => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => self::merge_schema([
                    ['key' => 'price_based', 'label' => __('Points based on Product Price (Pro)', 'gameengine'), 'type' => 'switch', 'width'   => '100%', 'is_pro' => true]
                ])
            ],
            'woocommerce_review_product' => [
                'label'       => __('Review Product', 'gameengine'),
                'hook'        => 'comment_post',
                'description' => __('Review product successfully into your website.', 'gameengine'),
                'args_count'  => 2,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    return $c ? $c->user_id : 0;
                },
                'schema' => self::merge_schema([
                    ['key' => 'media_bonus', 'label' => __('Photo/Video Review Bonus (Pro)', 'gameengine'), 'type' => 'switch', 'width'   => '100%', 'is_pro' => true]
                ])
            ],
            'woocommerce_refund_purchase' => [
                'label'       => __('Refund Order', 'gameengine'),
                'hook'        => 'woocommerce_order_status_refunded',
                'description' => __('Refund purchase successfully into your website.', 'gameengine'),
                'args_count'  => 1,
                'supports'    => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::merge_schema([
                    ['key' => 'full_reversal', 'label' => __('Full Points Reversal (Pro)', 'gameengine'), 'type' => 'switch', 'width'   => '100%', 'is_pro' => true],
                    ['key' => 'refund_reason', 'label' => __('Specific Refund Reason (Pro)', 'gameengine'), 'type' => 'text', 'width'   => '50%', 'is_pro' => true]
                ], 'deduct')
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
            },
            'product_cats' => function () {
                $terms = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => true]);
                return array_map(fn($t) => ['label' => $t->name, 'value' => $t->term_id], $terms);
            }
        ];
    }
}
