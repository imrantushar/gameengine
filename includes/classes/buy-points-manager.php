<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles the Buy Points feature — mapping WC/SE products to point awards and gift points.
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
    public static function save_mapping(int $product_id, int $point_type_id, int $amount, string $gift_mode = 'disabled'): void
    {
        $mappings              = self::get_mappings();
        $mappings[$product_id] = array(
            'point_type_id' => $point_type_id,
            'amount'        => $amount,
            'gift_mode'     => $gift_mode,
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
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $mappings = self::get_mappings();
        if (empty($mappings)) {
            return;
        }

        $user_id = $order->get_user_id();

        // Unique post meta is an atomic claim: the second caller gets false.
        // Claiming here rather than after the loop means an interrupted run
        // cannot be replayed into a second payout.
        if (!add_post_meta($order_id, '_gameengine_points_awarded', 1, true)) {
            return;
        }

        $awarded_items = array();
        $email_manager = new EmailManager();

        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            if (!isset($mappings[$product_id])) {
                continue;
            }

            $map           = $mappings[$product_id];
            $point_type_id = (int) ($map['point_type_id'] ?? $map[0] ?? 1);
            $mapped_amount = (int) ($map['amount'] ?? $map[1] ?? 0);
            $amount        = absint($mapped_amount) * $item->get_quantity();

            if ($amount <= 0) {
                continue;
            }

            // Get point type name for notifications/notes
            $point_type_name = __('Points', 'gameengine');
            $point_types     = (array) PointsManager::get_point_types();
            foreach ($point_types as $pt) {
                $pt_arr = (array) $pt;
                if ((int) ($pt_arr['id'] ?? 0) === $point_type_id) {
                    $point_type_name = $pt_arr['name'] ?? $point_type_name;
                    break;
                }
            }

            $is_gift = $item->get_meta('_gameengine_is_gift') === 'yes';

            if ($is_gift) {
                // Gift Points flow
                $recipient_email = sanitize_email($item->get_meta('_gameengine_gift_recipient_email'));
                $recipient_name  = sanitize_text_field($item->get_meta('_gameengine_gift_recipient_name'));
                $gift_message    = sanitize_textarea_field($item->get_meta('_gameengine_gift_message'));

                $buyer_name = trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name());
                if (empty($buyer_name) && $user_id) {
                    $buyer_user = get_userdata($user_id);
                    if ($buyer_user) {
                        $buyer_name = $buyer_user->display_name;
                    }
                }
                if (empty($buyer_name)) {
                    $buyer_name = __('A friend', 'gameengine');
                }

                $recipient_user = !empty($recipient_email) ? get_user_by('email', $recipient_email) : null;

                if ($recipient_user) {
                    // Recipient has an existing account -> award directly
                    $pm = new PointsManager();
                    $pm->add($recipient_user->ID, $amount, 'gift_points_received', array(
                        'point_type_id' => $point_type_id,
                        'description'   => sprintf(
                            /* translators: 1: Sender name, 2: Order ID */
                            __('Gift points from %1$s (Order #%2$d)', 'gameengine'),
                            $buyer_name,
                            $order_id
                        ),
                    ));

                    GiftClaimManager::create_claim(array(
                        'order_id'           => $order_id,
                        'order_item_id'      => $item->get_id(),
                        'buyer_user_id'      => $user_id,
                        'recipient_email'    => $recipient_email,
                        'recipient_name'     => $recipient_name,
                        'point_type_id'      => $point_type_id,
                        'points'             => $amount,
                        'message'            => $gift_message,
                        'status'             => 'awarded',
                        'claimed_by_user_id' => $recipient_user->ID,
                        'claimed_at'         => current_time('mysql'),
                    ));

                    $item->update_meta_data('_gameengine_gift_status', 'awarded');
                    $item->update_meta_data('_gameengine_gift_awarded_user_id', $recipient_user->ID);
                    $item->save();

                    // Send email notification to recipient
                    $email_manager->send_gift_points_received_email($recipient_email, $recipient_name, $buyer_name, $amount, $point_type_name, $gift_message);

                    $order->add_order_note(sprintf(
                        /* translators: 1: Points amount, 2: Point type name, 3: Recipient email, 4: User ID */
                        __('Gift: Awarded %1$d %2$s to registered recipient %3$s (User #%4$d).', 'gameengine'),
                        $amount,
                        $point_type_name,
                        $recipient_email,
                        $recipient_user->ID
                    ));

                    $awarded_items[] = array(
                        'point_type_id'   => $point_type_id,
                        'amount'          => $amount,
                        'is_gift'         => true,
                        'user_id'         => $recipient_user->ID,
                        'recipient_email' => $recipient_email,
                    );
                } else {
                    // Recipient does NOT have an account -> generate secure claim token & pending claim
                    $claim_token = wp_generate_password(32, false);

                    GiftClaimManager::create_claim(array(
                        'claim_token'     => $claim_token,
                        'order_id'        => $order_id,
                        'order_item_id'   => $item->get_id(),
                        'buyer_user_id'   => $user_id,
                        'recipient_email' => $recipient_email,
                        'recipient_name'  => $recipient_name,
                        'point_type_id'   => $point_type_id,
                        'points'          => $amount,
                        'message'         => $gift_message,
                        'status'          => 'pending',
                    ));

                    $item->update_meta_data('_gameengine_gift_status', 'pending');
                    $item->update_meta_data('_gameengine_gift_claim_token', $claim_token);
                    $item->save();

                    // Send claim invitation email
                    $claim_url = add_query_arg('gameengine_claim_gift', $claim_token, home_url('/'));
                    $email_manager->send_gift_points_claim_email($recipient_email, $recipient_name, $buyer_name, $amount, $point_type_name, $gift_message, $claim_url);

                    $order->add_order_note(sprintf(
                        /* translators: 1: Points amount, 2: Point type name, 3: Recipient name/email */
                        __('Gift: Created pending claim for %1$d %2$s for %3$s. Claim link emailed.', 'gameengine'),
                        $amount,
                        $point_type_name,
                        $recipient_name ? "{$recipient_name} ({$recipient_email})" : $recipient_email
                    ));

                    $awarded_items[] = array(
                        'point_type_id'   => $point_type_id,
                        'amount'          => $amount,
                        'is_gift'         => true,
                        'user_id'         => 0,
                        'recipient_email' => $recipient_email,
                        'claim_token'     => $claim_token,
                    );
                }
            } else {
                // Standard Buy Points flow (credited to buyer)
                if ($user_id > 0) {
                    $pm = new PointsManager();
                    $pm->add($user_id, $amount, 'buy_points', array(
                        'point_type_id' => $point_type_id,
                        'description'   => sprintf(
                            /* translators: %d: order ID */
                            __('Points purchased via order #%d', 'gameengine'),
                            $order_id
                        ),
                    ));

                    $awarded_items[] = array(
                        'point_type_id' => $point_type_id,
                        'amount'        => $amount,
                        'is_gift'       => false,
                        'user_id'       => $user_id,
                    );
                }
            }
        }

        // A record of what was paid, so a later refund reverses these amounts
        if (!empty($awarded_items)) {
            update_post_meta($order_id, '_gameengine_points_awarded_items', $awarded_items);
        }
    }

    /**
     * Refund points when a WooCommerce order is refunded.
     */
    public function refund_wc_order(int $order_id): void
    {
        if (!get_post_meta($order_id, '_gameengine_points_awarded', true)) {
            return;
        }

        $order   = wc_get_order($order_id);
        $user_id = $order ? $order->get_user_id() : 0;

        if (!$order) {
            return;
        }

        $awarded_items = get_post_meta($order_id, '_gameengine_points_awarded_items', true);

        if (empty($awarded_items) || !is_array($awarded_items)) {
            $awarded_items = array();
            $mappings      = self::get_mappings();
            if (!empty($mappings)) {
                foreach ($order->get_items() as $item) {
                    $product_id = $item->get_product_id();
                    if (!isset($mappings[$product_id])) {
                        continue;
                    }
                    $map             = $mappings[$product_id];
                    $pt_id           = (int) ($map['point_type_id'] ?? $map[0] ?? 1);
                    $m_amount        = (int) ($map['amount'] ?? $map[1] ?? 0);
                    $awarded_items[] = array(
                        'point_type_id' => $pt_id,
                        'amount'        => absint($m_amount) * $item->get_quantity(),
                        'user_id'       => $user_id,
                        'is_gift'       => false,
                    );
                }
            }
        }

        foreach ($awarded_items as $awarded) {
            $point_type_id  = (int) $awarded['point_type_id'];
            $amount         = absint($awarded['amount']);
            $is_gift        = !empty($awarded['is_gift']);
            $target_user_id = !empty($awarded['user_id']) ? (int) $awarded['user_id'] : ($is_gift ? 0 : $user_id);

            $pm = new PointsManager();

            if ($target_user_id > 0) {
                $total  = $pm->get_total($target_user_id, $point_type_id);
                $deduct = min($amount, $total);

                if ($deduct > 0) {
                    $context     = $is_gift ? 'gift_points_refund' : 'buy_points_refund';
                    $description = $is_gift
                        ? sprintf(__('Gift points refunded for order #%d', 'gameengine'), $order_id)
                        : sprintf(__('Points refunded for order #%d', 'gameengine'), $order_id);

                    $pm->deduct($target_user_id, $deduct, $context, array(
                        'point_type_id' => $point_type_id,
                        'description'   => $description,
                    ));
                }
            }
        }

        // Revoke all gift claims associated with this order
        global $wpdb;
        $wpdb->update(
            $wpdb->prefix . 'gameengine_gift_claims',
            array('status' => 'revoked'),
            array('order_id' => $order_id),
            array('%s'),
            array('%d')
        );

        delete_post_meta($order_id, '_gameengine_points_awarded');
        delete_post_meta($order_id, '_gameengine_points_awarded_items');
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
        if (!add_option($option_key, 1, '', false)) {
            return;
        }

        $items = is_object($order) && method_exists($order, 'get_items') ? $order->get_items() : array();

        foreach ($items as $item) {
            $product_id = is_object($item) && method_exists($item, 'get_product_id') ? $item->get_product_id() : 0;
            if (!$product_id || !isset($mappings[$product_id])) {
                continue;
            }

            $map           = $mappings[$product_id];
            $point_type_id = (int) ($map['point_type_id'] ?? $map[0] ?? 1);
            $amount        = (int) ($map['amount'] ?? $map[1] ?? 0);

            $pm  = new PointsManager();
            $pm->add($user_id, absint($amount), 'buy_points', array(
                'point_type_id' => $point_type_id,
                'description'   => sprintf(
                    /* translators: %s: order ID */
                    __('Points purchased via StoreEngine order #%s', 'gameengine'),
                    $order_id
                ),
            ));
        }
    }
}
