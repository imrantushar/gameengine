<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manages gift points claims, claim tokens, and auto-crediting for registered/unregistered recipients.
 */
class GiftClaimManager
{
    private const COOKIE_NAME = 'ge_gift_claim_token';

    public static function init()
    {
        $self = new self();

        add_action('init', array($self, 'handle_claim_url_request'));
        add_action('user_register', array($self, 'handle_user_registration'), 20, 1);
        add_action('wp_login', array($self, 'handle_user_login'), 20, 2);
        add_action('template_redirect', array($self, 'display_frontend_notices'));
    }

    /**
     * Create a new gift claim record.
     */
    public static function create_claim(array $data)
    {
        global $wpdb;

        $token = !empty($data['claim_token']) ? sanitize_text_field($data['claim_token']) : wp_generate_password(32, false);

        $inserted = $wpdb->insert(
            $wpdb->prefix . 'gameengine_gift_claims',
            array(
                'claim_token'        => $token,
                'order_id'           => absint($data['order_id'] ?? 0),
                'order_item_id'      => absint($data['order_item_id'] ?? 0),
                'buyer_user_id'      => absint($data['buyer_user_id'] ?? 0),
                'recipient_email'    => sanitize_email($data['recipient_email'] ?? ''),
                'recipient_name'     => sanitize_text_field($data['recipient_name'] ?? ''),
                'point_type_id'      => absint($data['point_type_id'] ?? 1),
                'points'             => absint($data['points'] ?? 0),
                'message'            => sanitize_textarea_field($data['message'] ?? ''),
                'status'             => sanitize_key($data['status'] ?? 'pending'),
                'claimed_by_user_id' => !empty($data['claimed_by_user_id']) ? absint($data['claimed_by_user_id']) : null,
                'claimed_at'         => !empty($data['claimed_at']) ? $data['claimed_at'] : null,
                'created_at'         => current_time('mysql'),
            ),
            array('%s', '%d', '%d', '%d', '%s', '%s', '%d', '%d', '%s', '%s', '%d', '%s', '%s')
        );

        if (!$inserted) {
            return false;
        }

        return $wpdb->insert_id;
    }

    /**
     * Get a claim by token.
     */
    public static function get_claim_by_token(string $token)
    {
        global $wpdb;

        if (empty($token)) {
            return null;
        }

        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_gift_claims WHERE claim_token = %s",
            $token
        ));
    }

    /**
     * Get claims by WooCommerce order ID.
     */
    public static function get_claims_by_order(int $order_id): array
    {
        global $wpdb;

        if ($order_id <= 0) {
            return array();
        }

        return (array) $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_gift_claims WHERE order_id = %d",
            $order_id
        ));
    }

    /**
     * Get pending claims by recipient email.
     */
    public static function get_pending_claims_by_email(string $email): array
    {
        global $wpdb;

        if (!is_email($email)) {
            return array();
        }

        return (array) $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}gameengine_gift_claims WHERE recipient_email = %s AND status = 'pending'",
            $email
        ));
    }

    /**
     * Claim a pending gift for a specific user.
     */
    public static function claim_gift($claim, int $user_id): bool
    {
        global $wpdb;

        if (is_numeric($claim)) {
            $claim = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gameengine_gift_claims WHERE id = %d",
                (int) $claim
            ));
        }

        if (!$claim || $claim->status !== 'pending') {
            return false;
        }

        $user = get_userdata($user_id);
        if (!$user) {
            return false;
        }

        $points_amount = absint($claim->points);
        $point_type_id = absint($claim->point_type_id);

        $buyer_name = '';
        if ($claim->buyer_user_id) {
            $buyer_user = get_userdata($claim->buyer_user_id);
            if ($buyer_user) {
                $buyer_name = $buyer_user->display_name;
            }
        }
        if (!$buyer_name && function_exists('wc_get_order')) {
            $order = wc_get_order($claim->order_id);
            if ($order) {
                $buyer_name = trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name());
            }
        }
        if (!$buyer_name) {
            $buyer_name = __('a friend', 'gameengine');
        }

        // Credit points to user.
        $pm = new PointsManager();
        $credited = $pm->add($user_id, $points_amount, 'gift_points_received', array(
            'point_type_id' => $point_type_id,
            'description'   => sprintf(
                /* translators: 1: Points amount, 2: Sender name, 3: Order ID */
                __('Claimed %1$d gift points from %2$s (Order #%3$d)', 'gameengine'),
                $points_amount,
                $buyer_name,
                $claim->order_id
            ),
        ));

        if (!$credited) {
            return false;
        }

        // Update claim record.
        $now = current_time('mysql');
        $wpdb->update(
            $wpdb->prefix . 'gameengine_gift_claims',
            array(
                'status'             => 'awarded',
                'claimed_by_user_id' => $user_id,
                'claimed_at'         => $now,
            ),
            array('id' => $claim->id),
            array('%s', '%d', '%s'),
            array('%d')
        );

        // Update WooCommerce order line item meta if available.
        if (function_exists('wc_get_order_item_meta') && $claim->order_item_id) {
            wc_update_order_item_meta($claim->order_item_id, '_gameengine_gift_status', 'awarded');
            wc_update_order_item_meta($claim->order_item_id, '_gameengine_gift_awarded_user_id', $user_id);
        }

        if (function_exists('wc_get_order')) {
            $order = wc_get_order($claim->order_id);
            if ($order) {
                $order->add_order_note(sprintf(
                    /* translators: 1: Points amount, 2: User display name, 3: User ID */
                    __('Gift Points: %1$d points successfully claimed by %2$s (User #%3$d).', 'gameengine'),
                    $points_amount,
                    $user->display_name,
                    $user_id
                ));
            }
        }

        return true;
    }

    /**
     * Handle incoming claim link request via ?gameengine_claim_gift={token}
     */
    public function handle_claim_url_request()
    {
        if (empty($_GET['gameengine_claim_gift'])) {
            return;
        }

        $token = sanitize_text_field(wp_unslash($_GET['gameengine_claim_gift']));
        $claim = self::get_claim_by_token($token);

        if (!$claim) {
            wp_die(
                esc_html__('Sorry, this gift claim link is invalid or has expired.', 'gameengine'),
                esc_html__('Invalid Gift Link', 'gameengine'),
                array('response' => 404, 'back_link' => true)
            );
        }

        if ($claim->status === 'awarded') {
            wp_die(
                esc_html__('This gift has already been claimed.', 'gameengine'),
                esc_html__('Gift Already Claimed', 'gameengine'),
                array('response' => 200, 'back_link' => true)
            );
        }

        if ($claim->status === 'revoked') {
            wp_die(
                esc_html__('This gift points order was refunded or revoked.', 'gameengine'),
                esc_html__('Gift Revoked', 'gameengine'),
                array('response' => 403, 'back_link' => true)
            );
        }

        // If user is logged in:
        if (is_user_logged_in()) {
            $current_user_id = get_current_user_id();
            $claimed         = self::claim_gift($claim, $current_user_id);

            if ($claimed) {
                self::clear_cookie();
                set_transient('gameengine_gift_claimed_' . $current_user_id, array(
                    'points' => $claim->points,
                    'type'   => $claim->point_type_id,
                ), 60);

                // Redirect to My Account or home.
                $redirect = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/');
                wp_safe_redirect(add_query_arg('gameengine_claimed', '1', $redirect));
                exit;
            }
        } else {
            // User is not logged in: store token in cookie and redirect to login / register.
            self::set_cookie($token);

            $redirect_url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : wp_login_url(home_url('/'));
            wp_safe_redirect(add_query_arg('gameengine_need_login_claim', '1', $redirect_url));
            exit;
        }
    }

    /**
     * Auto-claim pending gifts when a new user registers.
     */
    public function handle_user_registration(int $user_id)
    {
        $user = get_userdata($user_id);
        if (!$user) {
            return;
        }

        $email = $user->user_email;
        $claims = self::get_pending_claims_by_email($email);

        // Also check if a claim token cookie is present.
        $cookie_token = self::get_cookie();
        if ($cookie_token) {
            $cookie_claim = self::get_claim_by_token($cookie_token);
            if ($cookie_claim && $cookie_claim->status === 'pending') {
                $claims[] = $cookie_claim;
            }
        }

        $claimed_total = 0;
        foreach ($claims as $claim) {
            if (self::claim_gift($claim, $user_id)) {
                $claimed_total += (int) $claim->points;
            }
        }

        if ($claimed_total > 0) {
            self::clear_cookie();
            set_transient('gameengine_gift_claimed_' . $user_id, array(
                'points' => $claimed_total,
            ), 120);
        }
    }

    /**
     * Auto-claim pending gifts when an existing user logs in.
     */
    public function handle_user_login(string $user_login, $user)
    {
        if (!is_object($user) || empty($user->ID)) {
            return;
        }

        $email = $user->user_email;
        $claims = self::get_pending_claims_by_email($email);

        $cookie_token = self::get_cookie();
        if ($cookie_token) {
            $cookie_claim = self::get_claim_by_token($cookie_token);
            if ($cookie_claim && $cookie_claim->status === 'pending') {
                $claims[] = $cookie_claim;
            }
        }

        $claimed_total = 0;
        foreach ($claims as $claim) {
            if (self::claim_gift($claim, $user->ID)) {
                $claimed_total += (int) $claim->points;
            }
        }

        if ($claimed_total > 0) {
            self::clear_cookie();
            set_transient('gameengine_gift_claimed_' . $user->ID, array(
                'points' => $claimed_total,
            ), 120);
        }
    }

    /**
     * Display frontend notices on My Account / pages when claimed.
     */
    public function display_frontend_notices()
    {
        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $claimed_info = get_transient('gameengine_gift_claimed_' . $user_id);
            if ($claimed_info) {
                delete_transient('gameengine_gift_claimed_' . $user_id);
                $msg = sprintf(
                    /* translators: %d: Points amount */
                    __('🎉 Congratulations! You have received %d Gift Points in your account balance!', 'gameengine'),
                    absint($claimed_info['points'])
                );

                if (function_exists('wc_add_notice')) {
                    wc_add_notice($msg, 'success');
                } else {
                    add_action('wp_footer', function () use ($msg) {
                        echo '<div style="position:fixed;bottom:20px;right:20px;z-index:999999;background:#10b981;color:#fff;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:sans-serif;font-size:15px;font-weight:600;">' . esc_html($msg) . '</div>';
                    });
                }
            }
        } elseif (!empty($_GET['gameengine_need_login_claim'])) {
            $msg = __('🎁 You have a gift points claim waiting! Please log in or register with your email to claim your points.', 'gameengine');
            if (function_exists('wc_add_notice')) {
                wc_add_notice($msg, 'notice');
            }
        }
    }

    private static function set_cookie(string $token): void
    {
        if (!headers_sent()) {
            setcookie(self::COOKIE_NAME, $token, time() + 30 * DAY_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true);
        }
    }

    private static function get_cookie(): ?string
    {
        return !empty($_COOKIE[self::COOKIE_NAME]) ? sanitize_text_field($_COOKIE[self::COOKIE_NAME]) : null;
    }

    private static function clear_cookie(): void
    {
        if (!headers_sent() && isset($_COOKIE[self::COOKIE_NAME])) {
            setcookie(self::COOKIE_NAME, '', time() - HOUR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true);
        }
    }
}

