<?php
namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manages the Referral & Affiliate logic.
 * Handles tracking, cookie management, and user linking.
 */
class ReferralManager
{
    /**
     * Cookie name for referral tracking.
     */
    private static $cookie_name = 'gameengine_referrer_id';

    /**
     * Initialize the Referral System.
     */
    public static function init()
    {
        $self = new self();
        add_action('init', [$self, 'detect_referral']);
        add_action('user_register', [$self, 'link_on_registration']);

        // Engagement Hooks
        add_action('gameengine_achievement_unlocked', [$self, 'track_engagement'], 10, 3);
        add_action('gameengine_level_awarded', [$self, 'track_engagement'], 10, 3);

        // Settings Integration
        add_filter('gameengine_settings_data', [$self, 'inject_settings']);
        add_action('gameengine_save_pro_settings', [$self, 'save_settings']);
    }

    /**
     * Helper: Reads a single setting from saved options.
     */
    public static function get_setting(string $key, $default = '')
    {
        $settings = get_option('gameengine_referral_settings', [
            'enabled'       => 'yes',
            'cookie_expiry' => '30',
            'referral_slug' => 'ref',
            'signup_reward' => '50',
        ]);
        return isset($settings[$key]) ? $settings[$key] : $default;
    }

    /**
     * Injects referral settings into the global settings API.
     */
    public function inject_settings($settings)
    {
        $settings['referral'] = get_option('gameengine_referral_settings', [
            'enabled'         => 'yes',
            'cookie_expiry'   => '30',
            'referral_slug'   => 'ref',
            'signup_reward'   => '50', // Default points
        ]);
        return $settings;
    }

    /**
     * Saves referral settings coming from the API.
     */
    public function save_settings($params)
    {
        if (isset($params['referral'])) {
            update_option('gameengine_referral_settings', array_map('sanitize_text_field', (array) $params['referral']));
        }
    }

    /**
     * Detects referral ID from URL parameters and sets a cookie.
     */
    public function detect_referral()
    {
        // Check if the referral system is enabled in settings
        if (self::get_setting('enabled', 'yes') !== 'yes') {
            return;
        }

        // Read the configured slug (e.g. 'ref', 'affiliate', 'invite')
        $slug      = sanitize_key(self::get_setting('referral_slug', 'ref'));
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $ref_param = isset($_GET[$slug]) ? sanitize_text_field(wp_unslash($_GET[$slug])) : '';

        if (empty($ref_param)) {
            return;
        }

        // Identify referrer (by numeric ID or by user_nicename slug)
        $referrer_id = 0;
        if (is_numeric($ref_param)) {
            $user = get_userdata(intval($ref_param));
            if ($user) {
                $referrer_id = $user->ID;
            }
        } else {
            $user = get_user_by('slug', $ref_param);
            if ($user) {
                $referrer_id = $user->ID;
            }
        }

        // Do not set a cookie if the visitor is already the referrer
        if ($referrer_id > 0 && $referrer_id !== get_current_user_id()) {
            $this->set_referral_cookie($referrer_id);
        }
    }

    /**
     * Stores the Referrer ID in a secure browser cookie.
     */
    private function set_referral_cookie($referrer_id)
    {
        // Read expiry from settings (admin-controlled), default 30 days
        $expiry_days = absint(self::get_setting('cookie_expiry', '30'));
        if ($expiry_days < 1) {
            $expiry_days = 30;
        }
        $expiry_days = apply_filters('gameengine_referral_cookie_expiry', $expiry_days);
        $expiry_time = time() + (DAY_IN_SECONDS * $expiry_days);

        setcookie(self::$cookie_name, $referrer_id, $expiry_time, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true);
    }

    /**
     * Retrieves the stored Referrer ID from the cookie.
     */
    public static function get_stored_referrer_id()
    {
        return isset($_COOKIE[self::$cookie_name]) ? absint($_COOKIE[self::$cookie_name]) : 0;
    }

    /**
     * Finds the referrer of a specific user.
     */
    public static function get_referrer_of_user($user_id)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'gameengine_referrals';

        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT referrer_id FROM {$table_name} WHERE referee_id = %d LIMIT 1",
            absint($user_id)
        ));
    }

    /**
     * Tracks referee engagement and notifies the referrer.
     */
    public function track_engagement($user_id, $object_id, $log_id = 0)
    {
        $referrer_id = self::get_referrer_of_user($user_id);

        if ($referrer_id <= 0) {
            return;
        }

        $hook_name = current_action();
        $action_key = 'any';

        if ($hook_name === 'gameengine_level_awarded') {
            $action_key = 'level_up';
        } elseif ($hook_name === 'gameengine_achievement_unlocked') {
            $action_key = 'achievement_unlock';
        }

        // Fire the engagement trigger for the referral system
        do_action('gameengine_referral_engagement', $referrer_id, $user_id, $action_key);
    }

    /**
     * Links a new user to their referrer upon registration.
     */
    public function link_on_registration($user_id)
    {
        $referrer_id = self::get_stored_referrer_id();

        if ($referrer_id <= 0 || $referrer_id === $user_id) {
            return;
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'gameengine_referrals';

        // Record the relationship
        $wpdb->insert(
            $table_name,
            [
                'referrer_id' => $referrer_id,
                'referee_id'  => $user_id,
                'status'      => 'converted',
                'ip_address'  => $this->get_user_ip(),
                'created_at'  => current_time('mysql')
            ],
            ['%d', '%d', '%s', '%s', '%s']
        );

        // Fire an action so other modules or triggers can react (e.g. award points)
        do_action('gameengine_referral_signup', $referrer_id, $user_id);

        // Clear the cookie after successful conversion
        setcookie(self::$cookie_name, '', time() - HOUR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);
    }

    /**
     * Utility to get user IP address.
     */
    private function get_user_ip()
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        }
        return $_SERVER['REMOTE_ADDR'];
    }
}
