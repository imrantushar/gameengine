<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles WooCommerce frontend product page gift options, cart & checkout data, and admin order views.
 */
class GiftPointsProduct
{
    public static function init()
    {
        $self = new self();

        if (class_exists('WooCommerce')) {
            // Frontend Product Page
            add_action('woocommerce_before_add_to_cart_button', array($self, 'render_product_gift_fields'), 25);
            add_filter('woocommerce_add_to_cart_validation', array($self, 'validate_gift_fields'), 10, 3);
            add_filter('woocommerce_add_cart_item_data', array($self, 'add_cart_item_data'), 10, 3);
            add_filter('woocommerce_get_item_data', array($self, 'display_cart_item_data'), 10, 2);
            add_action('woocommerce_checkout_create_order_line_item', array($self, 'save_order_line_item_meta'), 10, 4);

            // Admin Order View & Actions
            add_action('woocommerce_after_order_itemmeta', array($self, 'render_admin_order_item_gift_meta'), 10, 3);
            add_action('wp_ajax_gameengine_resend_gift_email', array($self, 'ajax_resend_gift_email'));
        }
    }

    /**
     * Get gift configuration for a product.
     *
     * @param int $product_id
     * @return array|null Returns mapping array if mapped and gifting enabled, otherwise null.
     */
    public static function get_product_gift_config(int $product_id): ?array
    {
        $mappings = BuyPointsManager::get_mappings();
        if (!isset($mappings[$product_id])) {
            return null;
        }

        $map = $mappings[$product_id];
        $gift_mode = 'disabled';

        if (is_array($map)) {
            $gift_mode = $map['gift_mode'] ?? $map[2] ?? 'disabled';
        }

        if (!in_array($gift_mode, array('optional', 'gift_only'), true)) {
            return null;
        }

        $point_type_id = (int) ($map['point_type_id'] ?? $map[0] ?? 1);
        $amount        = (int) ($map['amount'] ?? $map[1] ?? 0);

        return array(
            'gift_mode'     => $gift_mode,
            'point_type_id' => $point_type_id,
            'amount'        => $amount,
        );
    }

    /**
     * Render the gift fields on the single product page.
     */
    public function render_product_gift_fields()
    {
        global $product;
        if (!$product) {
            return;
        }

        $config = self::get_product_gift_config($product->get_id());
        if (!$config) {
            return;
        }

        $gift_mode = $config['gift_mode'];
        $amount    = $config['amount'];

        // Get point type name
        $point_type_name = __('Points', 'gameengine');
        $point_types     = (array) PointsManager::get_point_types();
        foreach ($point_types as $pt) {
            $pt_arr = (array) $pt;
            if ((int) ($pt_arr['id'] ?? 0) === $config['point_type_id']) {
                $point_type_name = $pt_arr['name'] ?? $point_type_name;
                break;
            }
        }

        $uid = wp_unique_id('ge-gift-');
        ?>
        <div class="gameengine-product-gift-wrapper" style="margin: 16px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
            <style>
                .gameengine-product-gift-wrapper .ge-gift-field { margin-bottom: 12px; }
                .gameengine-product-gift-wrapper .ge-gift-field:last-child { margin-bottom: 0; }
                .gameengine-product-gift-wrapper label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #1e293b; }
                .gameengine-product-gift-wrapper input[type="text"],
                .gameengine-product-gift-wrapper input[type="email"],
                .gameengine-product-gift-wrapper textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; font-size: 14px; box-sizing: border-box; }
                .gameengine-product-gift-wrapper textarea { resize: vertical; }
                .gameengine-gift-header { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; color: #334155; margin-bottom: 8px; }
                .gameengine-gift-toggle-label { cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; user-select: none; }
                .gameengine-gift-badge { background: #ede9fe; color: #6d28d9; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 10px; }
            </style>

            <?php if ($gift_mode === 'optional') : ?>
                <div class="gameengine-gift-header">
                    <label class="gameengine-gift-toggle-label" for="<?php echo esc_attr($uid . '-toggle'); ?>">
                        <input type="checkbox" name="gameengine_is_gift" id="<?php echo esc_attr($uid . '-toggle'); ?>" value="1" style="width:18px;height:18px;cursor:pointer;">
                        <span>🎁 <?php esc_html_e('Send this as a gift to someone else', 'gameengine'); ?></span>
                    </label>
                </div>
            <?php else : ?>
                <input type="hidden" name="gameengine_is_gift" value="1">
                <div class="gameengine-gift-badge">
                    🎁 <?php esc_html_e('Gift Points Product', 'gameengine'); ?>
                </div>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">
                    <?php
                    printf(
                        /* translators: 1: Points amount, 2: Point type name */
                        esc_html__('This product will deliver %1$s %2$s directly to your recipient as a gift!', 'gameengine'),
                        '<strong>' . esc_html(number_format_i18n($amount)) . '</strong>',
                        '<strong>' . esc_html($point_type_name) . '</strong>'
                    );
                    ?>
                </p>
            <?php endif; ?>

            <div id="<?php echo esc_attr($uid . '-container'); ?>" class="gameengine-gift-fields" style="<?php echo ($gift_mode === 'optional') ? 'display: none;' : ''; ?>">
                <div class="ge-gift-field">
                    <label for="<?php echo esc_attr($uid . '-email'); ?>">
                        <?php esc_html_e('Recipient Email', 'gameengine'); ?> <span style="color: #ef4444;">*</span>
                    </label>
                    <input type="email" name="gameengine_gift_recipient_email" id="<?php echo esc_attr($uid . '-email'); ?>" placeholder="recipient@example.com" autocomplete="off" <?php echo ($gift_mode === 'gift_only') ? 'required' : ''; ?>>
                </div>

                <div class="ge-gift-field">
                    <label for="<?php echo esc_attr($uid . '-name'); ?>">
                        <?php esc_html_e('Recipient Name (Optional)', 'gameengine'); ?>
                    </label>
                    <input type="text" name="gameengine_gift_recipient_name" id="<?php echo esc_attr($uid . '-name'); ?>" placeholder="<?php esc_attr_e('e.g. John Doe', 'gameengine'); ?>">
                </div>

                <div class="ge-gift-field">
                    <label for="<?php echo esc_attr($uid . '-msg'); ?>">
                        <?php esc_html_e('Gift Message (Optional)', 'gameengine'); ?>
                    </label>
                    <textarea name="gameengine_gift_message" id="<?php echo esc_attr($uid . '-msg'); ?>" rows="3" maxlength="500" placeholder="<?php esc_attr_e('Add a personal message for the recipient…', 'gameengine'); ?>"></textarea>
                </div>
            </div>

            <?php if ($gift_mode === 'optional') : ?>
                <script>
                    (function() {
                        var toggle = document.getElementById('<?php echo esc_js($uid . '-toggle'); ?>');
                        var container = document.getElementById('<?php echo esc_js($uid . '-container'); ?>');
                        var emailInput = document.getElementById('<?php echo esc_js($uid . '-email'); ?>');
                        if (toggle && container) {
                            toggle.addEventListener('change', function() {
                                if (this.checked) {
                                    container.style.display = 'block';
                                    if (emailInput) emailInput.required = true;
                                } else {
                                    container.style.display = 'none';
                                    if (emailInput) emailInput.required = false;
                                }
                            });
                        }
                    })();
                </script>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Validate gift fields when adding to cart.
     */
    public function validate_gift_fields(bool $passed, int $product_id, int $quantity): bool
    {
        $config = self::get_product_gift_config($product_id);
        if (!$config) {
            return $passed;
        }

        $is_gift = !empty($_POST['gameengine_is_gift']) || $config['gift_mode'] === 'gift_only';

        if ($is_gift) {
            $email = isset($_POST['gameengine_gift_recipient_email']) ? sanitize_email(wp_unslash($_POST['gameengine_gift_recipient_email'])) : '';

            if (empty($email) || !is_email($email)) {
                if (function_exists('wc_add_notice')) {
                    wc_add_notice(__('Please enter a valid recipient email address for your gift.', 'gameengine'), 'error');
                }
                return false;
            }

            // Prevent gifting to one's own email if logged in
            if (is_user_logged_in()) {
                $current_user = wp_get_current_user();
                if (strtolower($current_user->user_email) === strtolower($email)) {
                    if (function_exists('wc_add_notice')) {
                        wc_add_notice(__('You entered your own email address as recipient. To purchase points for yourself, please uncheck the gift option.', 'gameengine'), 'error');
                    }
                    return false;
                }
            }
        }

        return $passed;
    }

    /**
     * Add gift data to WooCommerce cart item data.
     */
    public function add_cart_item_data(array $cart_item_data, int $product_id, int $variation_id): array
    {
        $config = self::get_product_gift_config($product_id);
        if (!$config) {
            return $cart_item_data;
        }

        $is_gift = !empty($_POST['gameengine_is_gift']) || $config['gift_mode'] === 'gift_only';

        if ($is_gift) {
            $email   = isset($_POST['gameengine_gift_recipient_email']) ? sanitize_email(wp_unslash($_POST['gameengine_gift_recipient_email'])) : '';
            $name    = isset($_POST['gameengine_gift_recipient_name']) ? sanitize_text_field(wp_unslash($_POST['gameengine_gift_recipient_name'])) : '';
            $message = isset($_POST['gameengine_gift_message']) ? sanitize_textarea_field(wp_unslash($_POST['gameengine_gift_message'])) : '';

            $cart_item_data['gameengine_is_gift']                = true;
            $cart_item_data['gameengine_gift_recipient_email']   = $email;
            $cart_item_data['gameengine_gift_recipient_name']    = $name;
            $cart_item_data['gameengine_gift_message']           = $message;
            $cart_item_data['gameengine_gift_unique_key']        = md5($email . microtime() . wp_rand());
        }

        return $cart_item_data;
    }

    /**
     * Display gift metadata in WooCommerce Cart & Checkout.
     */
    public function display_cart_item_data(array $item_data, array $cart_item): array
    {
        if (!empty($cart_item['gameengine_is_gift'])) {
            $recipient_label = $cart_item['gameengine_gift_recipient_name']
                ? sprintf('%s (%s)', $cart_item['gameengine_gift_recipient_name'], $cart_item['gameengine_gift_recipient_email'])
                : $cart_item['gameengine_gift_recipient_email'];

            $item_data[] = array(
                'key'     => __('🎁 Gift Recipient', 'gameengine'),
                'value'   => esc_html($recipient_label),
                'display' => '',
            );

            if (!empty($cart_item['gameengine_gift_message'])) {
                $item_data[] = array(
                    'key'     => __('Message', 'gameengine'),
                    'value'   => esc_html($cart_item['gameengine_gift_message']),
                    'display' => '',
                );
            }
        }

        return $item_data;
    }

    /**
     * Save gift metadata to WooCommerce order line item.
     */
    public function save_order_line_item_meta($item, string $cart_item_key, array $values, $order)
    {
        if (!empty($values['gameengine_is_gift'])) {
            $item->add_meta_data('_gameengine_is_gift', 'yes', true);
            $item->add_meta_data('_gameengine_gift_recipient_email', $values['gameengine_gift_recipient_email'], true);
            $item->add_meta_data('_gameengine_gift_recipient_name', $values['gameengine_gift_recipient_name'], true);
            $item->add_meta_data('_gameengine_gift_message', $values['gameengine_gift_message'], true);
            $item->add_meta_data('_gameengine_gift_status', 'pending', true);

            $recipient_label = $values['gameengine_gift_recipient_name']
                ? sprintf('%s (%s)', $values['gameengine_gift_recipient_name'], $values['gameengine_gift_recipient_email'])
                : $values['gameengine_gift_recipient_email'];

            $item->add_meta_data(__('Gift Recipient', 'gameengine'), $recipient_label);

            if (!empty($values['gameengine_gift_message'])) {
                $item->add_meta_data(__('Gift Message', 'gameengine'), $values['gameengine_gift_message']);
            }
        }
    }

    /**
     * Render gift details and actions in WooCommerce admin order items table.
     */
    public function render_admin_order_item_gift_meta(int $item_id, $item, $product)
    {
        if (!is_object($item) || $item->get_meta('_gameengine_is_gift') !== 'yes') {
            return;
        }

        $email       = $item->get_meta('_gameengine_gift_recipient_email');
        $name        = $item->get_meta('_gameengine_gift_recipient_name');
        $message     = $item->get_meta('_gameengine_gift_message');
        $status      = $item->get_meta('_gameengine_gift_status') ?: 'pending';
        $user_id     = (int) $item->get_meta('_gameengine_gift_awarded_user_id');
        $claim_token = $item->get_meta('_gameengine_gift_claim_token');

        $order_id    = $item->get_order_id();
        $nonce       = wp_create_nonce('gameengine_resend_gift_' . $item_id);

        $status_labels = array(
            'awarded' => array('label' => __('Delivered & Claimed', 'gameengine'), 'color' => '#10b981', 'bg' => '#d1fae5'),
            'pending' => array('label' => __('Pending Recipient Claim', 'gameengine'), 'color' => '#d97706', 'bg' => '#fef3c7'),
            'revoked' => array('label' => __('Revoked / Refunded', 'gameengine'), 'color' => '#ef4444', 'bg' => '#fee2e2'),
        );
        $badge = $status_labels[$status] ?? array('label' => ucfirst($status), 'color' => '#64748b', 'bg' => '#f1f5f9');
        ?>
        <div style="margin-top: 8px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 600; color: #334155;">🎁 <?php esc_html_e('GameEngine Gift Item', 'gameengine'); ?></span>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: <?php echo esc_attr($badge['color']); ?>; background: <?php echo esc_attr($badge['bg']); ?>;">
                    <?php echo esc_html($badge['label']); ?>
                </span>
            </div>

            <div style="color: #475569; font-size: 12px; line-height: 1.5;">
                <div><strong><?php esc_html_e('Recipient:', 'gameengine'); ?></strong> <?php echo esc_html($name ? "{$name} ({$email})" : $email); ?></div>
                <?php if ($message) : ?>
                    <div><strong><?php esc_html_e('Note:', 'gameengine'); ?></strong> <em>"<?php echo esc_html($message); ?>"</em></div>
                <?php endif; ?>
                <?php if ($user_id > 0) : ?>
                    <div><strong><?php esc_html_e('Credited User ID:', 'gameengine'); ?></strong> #<?php echo esc_html($user_id); ?></div>
                <?php elseif ($claim_token) : ?>
                    <div><strong><?php esc_html_e('Claim Token:', 'gameengine'); ?></strong> <code><?php echo esc_html(substr($claim_token, 0, 10) . '…'); ?></code></div>
                <?php endif; ?>
            </div>

            <?php if ($status !== 'revoked') : ?>
                <div style="margin-top: 8px;">
                    <button type="button" class="button button-small ge-resend-gift-btn" data-item-id="<?php echo esc_attr($item_id); ?>" data-order-id="<?php echo esc_attr($order_id); ?>" data-nonce="<?php echo esc_attr($nonce); ?>">
                        <?php esc_html_e('Resend Gift Notification Email', 'gameengine'); ?>
                    </button>
                    <span class="ge-resend-feedback" style="margin-left: 8px; font-size: 12px; display: none;"></span>
                </div>
            <?php endif; ?>
        </div>

        <script>
            (function() {
                var buttons = document.querySelectorAll('.ge-resend-gift-btn');
                buttons.forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        var self = this;
                        var itemId = self.getAttribute('data-item-id');
                        var orderId = self.getAttribute('data-order-id');
                        var nonce = self.getAttribute('data-nonce');
                        var feedback = self.parentElement.querySelector('.ge-resend-feedback');

                        self.disabled = true;
                        self.textContent = '<?php echo esc_js(__('Sending…', 'gameengine')); ?>';

                        var data = new FormData();
                        data.append('action', 'gameengine_resend_gift_email');
                        data.append('item_id', itemId);
                        data.append('order_id', orderId);
                        data.append('nonce', nonce);

                        fetch(ajaxurl, {
                            method: 'POST',
                            body: data
                        })
                        .then(function(res) { return res.json(); })
                        .then(function(res) {
                            self.disabled = false;
                            self.textContent = '<?php echo esc_js(__('Resend Gift Notification Email', 'gameengine')); ?>';
                            if (feedback) {
                                feedback.style.display = 'inline';
                                feedback.style.color = res.success ? '#10b981' : '#ef4444';
                                feedback.textContent = res.data ? res.data.message : (res.success ? 'Sent!' : 'Failed');
                            }
                        })
                        .catch(function() {
                            self.disabled = false;
                            self.textContent = '<?php echo esc_js(__('Resend Gift Notification Email', 'gameengine')); ?>';
                            if (feedback) {
                                feedback.style.display = 'inline';
                                feedback.style.color = '#ef4444';
                                feedback.textContent = '<?php echo esc_js(__('Error sending email', 'gameengine')); ?>';
                            }
                        });
                    });
                });
            })();
        </script>
        <?php
    }

    /**
     * AJAX handler to resend gift email from admin order screen.
     */
    public function ajax_resend_gift_email()
    {
        $item_id  = absint($_POST['item_id'] ?? 0);
        $order_id = absint($_POST['order_id'] ?? 0);
        $nonce    = sanitize_text_field($_POST['nonce'] ?? '');

        if (!current_user_can('manage_woocommerce') || !wp_verify_nonce($nonce, 'gameengine_resend_gift_' . $item_id)) {
            wp_send_json_error(array('message' => __('Permission denied.', 'gameengine')));
        }

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found.', 'gameengine')));
        }

        $item = $order->get_item($item_id);
        if (!$item || $item->get_meta('_gameengine_is_gift') !== 'yes') {
            wp_send_json_error(array('message' => __('Gift item not found.', 'gameengine')));
        }

        $email       = $item->get_meta('_gameengine_gift_recipient_email');
        $name        = $item->get_meta('_gameengine_gift_recipient_name');
        $message     = $item->get_meta('_gameengine_gift_message');
        $claim_token = $item->get_meta('_gameengine_gift_claim_token');
        $product_id  = $item->get_product_id();

        $mappings = BuyPointsManager::get_mappings();
        $map      = $mappings[$product_id] ?? array();
        $amount   = absint($map['amount'] ?? $map[1] ?? 0) * $item->get_quantity();
        $pt_id    = absint($map['point_type_id'] ?? $map[0] ?? 1);

        $point_types     = (array) PointsManager::get_point_types();
        $point_type_name = __('Points', 'gameengine');
        foreach ($point_types as $pt) {
            $pt_arr = (array) $pt;
            if ((int) ($pt_arr['id'] ?? 0) === $pt_id) {
                $point_type_name = $pt_arr['name'] ?? $point_type_name;
                break;
            }
        }

        $buyer_name = trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()) ?: __('A friend', 'gameengine');

        $email_manager = new EmailManager();
        if (!empty($claim_token)) {
            $claim_url = add_query_arg('gameengine_claim_gift', $claim_token, home_url('/'));
            $sent = $email_manager->send_gift_points_claim_email($email, $name, $buyer_name, $amount, $point_type_name, $message, $claim_url);
        } else {
            $sent = $email_manager->send_gift_points_received_email($email, $name, $buyer_name, $amount, $point_type_name, $message);
        }

        if ($sent) {
            wp_send_json_success(array('message' => __('Gift email sent successfully!', 'gameengine')));
        } else {
            wp_send_json_error(array('message' => __('Could not send email.', 'gameengine')));
        }
    }
}

