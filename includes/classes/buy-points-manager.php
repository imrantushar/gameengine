<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles the Buy Points feature — mapping WC/SE products to point awards.
 */
class BuyPointsManager
{

    private const OPTION_KEY = 'gameengine_buy_points_mappings';

    public static function init()
    {
        $self = new self();

        if (class_exists('WooCommerce')) {
            add_action('woocommerce_order_status_completed', array($self, 'process_wc_order'), 10, 1);
            add_action('woocommerce_order_status_refunded', array($self, 'refund_wc_order'), 10, 1);
        }

        if (defined('STOREENGINE_VERSION')) {
            add_action('storeengine_order_completed', array($self, 'process_se_order'), 10, 1);
        }
    }

    /**
     * Get all product-to-points mappings.
     */
    public static function get_mappings(): array
    {
        return (array) get_option(self::OPTION_KEY, array());
    }

    /**
     * Save or update a product-to-points mapping.
     */
    public static function save_mapping(int $product_id, int $point_type_id, int $amount): void
    {
        $mappings                = self::get_mappings();
        $mappings[$product_id]   = array(
            'point_type_id' => $point_type_id,
            'amount'        => $amount,
        );
        update_option(self::OPTION_KEY, $mappings);
    }

    /**
     * Remove a mapping.
     */
    public static function remove_mapping(int $product_id): void
    {
        $mappings = self::get_mappings();
        unset($mappings[$product_id]);
        update_option(self::OPTION_KEY, $mappings);
    }

    /**
     * Process a completed WooCommerce order.
     */
    public function process_wc_order(int $order_id): void
    {
        if (!function_exists('wc_get_order')) {
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        if (get_post_meta($order_id, '_gameengine_points_awarded', true)) {
            return;
        }

        $user_id  = $order->get_user_id();
        $mappings = self::get_mappings();

        if (!$user_id || empty($mappings)) {
            return;
        }

        $awarded = false;
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            if (!isset($mappings[$product_id])) {
                continue;
            }

            $map    = $mappings[$product_id];
            $amount = absint($map['amount']) * $item->get_quantity();

            $pm = new PointsManager();
            $pm->add($user_id, $amount, 'buy_points', array(
                'point_type_id' => (int) $map['point_type_id'],
                'description'   => sprintf(
                    /* translators: %d: order ID */
                    __('Points purchased via order #%d', 'gameengine'),
                    $order_id
                ),
            ));
            $awarded = true;
        }

        if ($awarded) {
            update_post_meta($order_id, '_gameengine_points_awarded', 1);
        }
    }

    /**
     * Refund points when a WooCommerce order is refunded.
     */
    public function refund_wc_order(int $order_id): void
    {
        if (!function_exists('wc_get_order')) {
            return;
        }

        if (!get_post_meta($order_id, '_gameengine_points_awarded', true)) {
            return;
        }

        $order    = wc_get_order($order_id);
        $user_id  = $order ? $order->get_user_id() : 0;
        $mappings = self::get_mappings();

        if (!$user_id || !$order || empty($mappings)) {
            return;
        }

        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            if (!isset($mappings[$product_id])) {
                continue;
            }

            $map    = $mappings[$product_id];
            $amount = absint($map['amount']) * $item->get_quantity();

            $pm    = new PointsManager();
            $total = $pm->get_total($user_id, (int) $map['point_type_id']);
            $deduct = min($amount, $total);

            if ($deduct > 0) {
                $pm->deduct($user_id, $deduct, 'buy_points_refund', array(
                    'point_type_id' => (int) $map['point_type_id'],
                    'description'   => sprintf(
                        /* translators: %d: order ID */
                        __('Points refunded for order #%d', 'gameengine'),
                        $order_id
                    ),
                ));
            }
        }

        delete_post_meta($order_id, '_gameengine_points_awarded');
    }

    /**
     * Process a completed StoreEngine order.
     */
    public function process_se_order($order_id): void
    {
        $mappings = self::get_mappings();
        if (empty($mappings)) {
            return;
        }

        $order = apply_filters('storeengine_get_order', null, $order_id);
        if (!$order) {
            return;
        }

        $user_id = is_object($order) && method_exists($order, 'get_user_id') ? $order->get_user_id() : 0;
        if (!$user_id) {
            return;
        }

        $option_key = '_gameengine_se_points_awarded_' . $order_id;
        if (get_option($option_key)) {
            return;
        }

        $items = is_object($order) && method_exists($order, 'get_items') ? $order->get_items() : array();

        foreach ($items as $item) {
            $product_id = is_object($item) && method_exists($item, 'get_product_id') ? $item->get_product_id() : 0;
            if (!$product_id || !isset($mappings[$product_id])) {
                continue;
            }

            $map = $mappings[$product_id];
            $pm  = new PointsManager();
            $pm->add($user_id, absint($map['amount']), 'buy_points', array(
                'point_type_id' => (int) $map['point_type_id'],
                'description'   => sprintf(
                    /* translators: %s: order ID */
                    __('Points purchased via StoreEngine order #%s', 'gameengine'),
                    $order_id
                ),
            ));
        }

        update_option($option_key, 1, false);
    }
}
