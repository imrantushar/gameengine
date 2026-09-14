<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH'))
    exit;

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
                'label' => __('New Purchase', 'gameengine'),
                'hook' => 'woocommerce_order_status_completed',
                'args_count' => 1,
                'description' => __('New purchase successfully into your website.', 'gameengine'),
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::merge_schema([])
            ],
            'woocommerce_purchase_specific_product' => [
                'label' => __('Purchase Specific Product', 'gameengine'),
                'hook' => 'woocommerce_order_status_completed',
                'description' => __('Purchase product successfully into your website.', 'gameengine'),
                'args_count' => 1,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::merge_schema([
                    ['key' => 'product_id', 'label' => __('Select Product', 'gameengine'), 'type' => 'select', 'width' => '50%', 'dynamic' => ['integration' => 'woocommerce', 'query' => 'products'], 'placeholder' => __('Any product', 'gameengine'), 'clearable' => true],
                ])
            ],
            'woocommerce_publish_product' => [
                'label' => __('Publish Product', 'gameengine'),
                'hook' => 'publish_product',
                'description' => __('Publish product successfully into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id, $post) {
                    return $post->post_author;
                },
                'schema' => self::merge_schema([])
            ],
            'woocommerce_review_product' => [
                'label' => __('Review Product', 'gameengine'),
                'hook' => 'comment_post',
                'description' => __('Review product successfully into your website.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($id) {
                    $c = get_comment($id);
                    return $c ? $c->user_id : 0;
                },
                'schema' => self::merge_schema([])
            ],
            'woocommerce_refund_purchase' => [
                'label' => __('Refund Order', 'gameengine'),
                'hook' => 'woocommerce_order_status_refunded',
                'description' => __('Deducts points when a completed order is refunded.', 'gameengine'),
                'args_count' => 1,
                // A refund only ever takes points away, so the editor offers it
                // under Deductions alone.
                'actions' => ['deduct'],
                'supports' => ['point_type'],
                'get_user_id' => function ($id) {
                    $o = wc_get_order($id);
                    return $o ? $o->get_user_id() : 0;
                },
                'schema' => self::merge_schema([], 'deduct')
            ]
        ];
    }

    public static function get_dynamic_queries(): array
    {
        return [
            'products' => function () {
                // Every published product, by name. The newest twenty left most
                // of a real catalogue impossible to choose.
                $posts = get_posts([
                    'post_type' => 'product',
                    'post_status' => 'publish',
                    'posts_per_page' => -1,
                    'orderby' => 'title',
                    'order' => 'ASC',
                    'no_found_rows' => true,
                    'update_post_meta_cache' => false,
                    'update_post_term_cache' => false,
                ]);
                return array_map(fn($p) => ['label' => $p->post_title, 'value' => $p->ID], $posts);
            },
            'product_cats' => function () {
                $terms = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => true]);
                if (is_wp_error($terms)) {
                    return [];
                }
                return array_map(fn($t) => ['label' => $t->name, 'value' => $t->term_id], $terms);
            }
        ];
    }
}
