<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH'))
    exit;

/**
 * Class StoreEngine
 * Handles all StoreEngine-specific triggers for GameEngine.
 */
class StoreEngine extends BaseIntegration
{
    public static function get_slug(): string
    {
        return 'storeengine';
    }

    public static function get_name(): string
    {
        return __('StoreEngine', 'gameengine');
    }

    public static function get_icon(): string
    {
        return 'dashicons-store';
    }

    public static function get_triggers(): array
    {
        return array(

            // ─── ORDER TRIGGERS ──────────────────────────────────────────────

            // Any new purchase at checkout
            'storeengine_new_purchase' => array(
                'label' => __('New Purchase (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/checkout/after_place_order',
                'args_count' => 2,
                'description' => __('Awarded when a customer completes a new purchase via StoreEngine checkout.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($order, $payload) {
                    return method_exists($order, 'get_user_id') ? $order->get_user_id() : 0;
                },
                'schema' => self::merge_schema(array()),
            ),

            // First purchase only.
            //    storeengine_total_orders meta is written AFTER this hook fires, so we
            //    count directly from {prefix}storeengine_orders, excluding the current order.
            //    Paid statuses: 'processing' and 'completed'.
            'storeengine_first_purchase' => array(
                'label' => __('First Purchase (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/checkout/after_place_order',
                'args_count' => 2,
                'description' => __('Awarded once when a customer completes their very first StoreEngine order.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($order, $payload) {
                    global $wpdb;
                    if (!method_exists($order, 'get_user_id') || !method_exists($order, 'get_id')) {
                        return 0;
                    }
                    $user_id = absint($order->get_user_id());
                    $current_order_id = absint($order->get_id());
                    if ($user_id <= 0 || $current_order_id <= 0) {
                        return 0;
                    }
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                    $prior_paid = (int) $wpdb->get_var(
                        $wpdb->prepare(
                            "SELECT COUNT(*)
                             FROM   {$wpdb->prefix}storeengine_orders
                             WHERE  customer_id = %d
                               AND  status      IN ('processing', 'completed')
                               AND  id          != %d",
                            $user_id,
                            $current_order_id
                        )
                    );
                    return ($prior_paid === 0) ? $user_id : 0;
                },
                'schema' => self::merge_schema(array()),
            ),

            //  Purchase a specific product.
            //    Product match is handled in Triggers::check_conditions() via $order->get_items().
            'storeengine_purchase_specific_product' => array(
                'label' => __('Purchase Specific Product (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/checkout/after_place_order',
                'args_count' => 2,
                'description' => __('Awarded when a customer purchases a specific StoreEngine product.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($order, $payload) {
                    return method_exists($order, 'get_user_id') ? $order->get_user_id() : 0;
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'product_id',
                        'label' => __('Select Product', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'storeengine', 'query' => 'products'),
                    ),
                )),
            ),

            // Order status reaches 'completed'.
            //    Hook: storeengine/order/status_completed — args: ($order_id, $old_status, $order)
            'storeengine_order_completed' => array(
                'label' => __('Order Completed (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/order/status_completed',
                'args_count' => 3,
                'description' => __('Awarded when a StoreEngine order status changes to Completed.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($order_id, $old_status, $order) {
                    return method_exists($order, 'get_user_id') ? absint($order->get_user_id()) : 0;
                },
                'schema' => self::merge_schema(array()),
            ),

            //  Pay for a previously failed or pending order.
            //    Hook: storeengine/checkout/after_pay_order — args: ($order)
            'storeengine_pay_order' => array(
                'label' => __('Order Paid Re-attempt (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/checkout/after_pay_order',
                'args_count' => 1,
                'description' => __('Awarded when a user successfully pays for a previously failed or pending StoreEngine order.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($order) {
                    return method_exists($order, 'get_user_id') ? $order->get_user_id() : 0;
                },
                'schema' => self::merge_schema(array()),
            ),

            // Order refunded — deducts points.
            //    Hook: storeengine/order/order_refunded — args: ($order_id, $refund_id)
            //    Uses SE's Helper::get_order() instead of wc_get_order().
            'storeengine_refund' => array(
                'label' => __('Order Refunded (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/order/order_refunded',
                'args_count' => 2,
                'description' => __('Deducts points when a StoreEngine order is refunded.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($order_id, $refund_id) {
                    $order = \StoreEngine\Utils\Helper::get_order(absint($order_id));
                    return (!is_wp_error($order) && method_exists($order, 'get_user_id'))
                        ? absint($order->get_user_id())
                        : 0;
                },
                'schema' => self::merge_schema(array(), 'deduct'),
            ),

            // ─── CUSTOMER TRIGGERS ───────────────────────────────────────────

            // New customer account created at checkout.
            //    Hook: storeengine/checkout/customer_created — args: ($user_id, $userdata)
            'storeengine_customer_registered' => array(
                'label' => __('New Customer Registered (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/checkout/customer_created',
                'args_count' => 2,
                'description' => __('Awarded when a new customer account is created during StoreEngine checkout.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($user_id, $userdata) {
                    return absint($user_id);
                },
                'schema' => self::merge_schema(array()),
            ),

            // Customer logs in via the StoreEngine login shortcode.
            //    Hook: storeengine/shortcode/after_customer_signon — args: none
            //    SE calls wp_set_current_user() before this hook, so get_current_user_id() is reliable.
            'storeengine_customer_login' => array(
                'label' => __('Customer Login (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/shortcode/after_customer_signon',
                'args_count' => 0,
                'description' => __('Awarded when a customer logs in via the StoreEngine login form.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function () {
                    return get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),

            // ─── PRODUCT REVIEW TRIGGER ──────────────────────────────────────

            // Product review submitted.
            //    Hook: storeengine/frontend/after_product_rating
            //    Args: ($comment_id, $comment_post_ID, $storeengine_rating)
            //    Optional product_id filter handled in Triggers::check_conditions().
            'storeengine_product_review' => array(
                'label' => __('Product Review Submitted (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/frontend/after_product_rating',
                'args_count' => 3,
                'description' => __('Awarded when a customer submits a product review on a StoreEngine product.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($comment_id, $comment_post_id, $rating) {
                    $comment = get_comment($comment_id);
                    return ($comment && $comment->user_id) ? absint($comment->user_id) : 0;
                },
                'schema' => self::merge_schema(array(
                    array(
                        'key' => 'product_id',
                        'label' => __('Specific Product (optional)', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'dynamic' => array('integration' => 'storeengine', 'query' => 'products'),
                    ),
                )),
            ),

            // ─── COUPON TRIGGER ──────────────────────────────────────────────

            //  Coupon applied to cart.
            //     Hook: storeengine/applied_coupon — args: none
            //     The request has an authenticated user at this point; get_current_user_id() is safe.
            'storeengine_coupon_applied' => array(
                'label' => __('Coupon Applied (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/applied_coupon',
                'args_count' => 0,
                'description' => __('Awarded when a customer successfully applies a coupon to their StoreEngine cart.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function () {
                    return get_current_user_id();
                },
                'schema' => self::merge_schema(array()),
            ),

            //  Subscription changed (cancelled / upgraded / downgraded).
            //  Hook: storeengine/frontend/subscription/after_change_subscription
            //  Args: ($data, $order_id) — load order via SE Helper to get user_id.
            'storeengine_subscription_changed' => array(
                'label' => __('Subscription Changed (StoreEngine)', 'gameengine'),
                'hook' => 'storeengine/frontend/subscription/after_change_subscription',
                'args_count' => 2,
                'description' => __('Fired when a customer cancels, upgrades, or downgrades a StoreEngine subscription.', 'gameengine'),
                'supports' => array('point_type', 'achievement', 'level'),
                'get_user_id' => function ($data, $order_id) {
                    $order = \StoreEngine\Utils\Helper::get_order(absint($order_id));
                    return (!is_wp_error($order) && method_exists($order, 'get_user_id'))
                        ? absint($order->get_user_id())
                        : 0;
                },
                'schema' => self::merge_schema(array()),
            ),
        );
    }

    /**
     * Dynamic queries for schema select dropdowns.
     * Uses 'storeengine_products' — SE's own CPT, not WooCommerce's 'product'.
     */
    public static function get_dynamic_queries(): array
    {
        return array(
            'products' => function () {
                $posts = get_posts(array(
                    'post_type' => 'storeengine_product',
                    'post_status' => 'publish',
                    'posts_per_page' => 50,
                    'orderby' => 'title',
                    'order' => 'ASC',
                ));
                return array_map(
                    fn($p) => array('label' => $p->post_title, 'value' => $p->ID),
                    $posts
                );
            },
            'product_cats' => function () {
                $terms = get_terms(array('taxonomy' => 'storeengine_product_category', 'hide_empty' => false));
                if (is_wp_error($terms)) {
                    return array();
                }
                return array_map(
                    fn($t) => array('label' => $t->name, 'value' => $t->term_id),
                    $terms
                );
            },
        );
    }
}
