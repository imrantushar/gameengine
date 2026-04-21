<?php

namespace GameEngine\Shortcodes;

if (!defined('ABSPATH')) {
    exit;
}

use GameEngine\Classes\ReferralManager;

/**
 * Shortcode [gameengine_referral_dashboard]
 * Displays user's referral link and performance stats.
 */
class ReferralDashboard
{
    public function __construct()
    {
        add_shortcode('gameengine_referral_dashboard', [$this, 'render_view']);
    }

    public function render_view($atts)
    {
        if (!is_user_logged_in()) {
            return sprintf('<p class="gf-login-msg">%s</p>', esc_html__('Please log in to view your referral dashboard.', 'gameengine'));
        }

        $user_id = get_current_user_id();
        $user = get_userdata($user_id);

        // Read slug from admin settings (default: 'ref')
        $slug        = \GameEngine\Classes\ReferralManager::get_setting('referral_slug', 'ref');
        $referral_url = add_query_arg($slug, $user->user_nicename, home_url('/'));

        // Fetch Stats
        global $wpdb;
        $table_name = $wpdb->prefix . 'gameengine_referrals';
        
        $total_referrals = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$table_name} WHERE referrer_id = %d AND status = 'converted'",
            $user_id
        ));

        // Total Clicks from user meta
        $total_clicks = \GameEngine\Classes\ReferralManager::get_click_count($user_id);

        // Fetch total points earned from referrals
        $points_table = $wpdb->prefix . 'gameengine_points_log';
        $total_points = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(points) FROM {$points_table} WHERE user_id = %d AND context = 'referral_signup'",
            $user_id
        ));

        // Fetch Recent Referrals (List)
        $recent_referrals = $wpdb->get_results($wpdb->prepare(
            "SELECT r.status, r.created_at, u.display_name 
             FROM {$table_name} r
             INNER JOIN {$wpdb->users} u ON r.referee_id = u.ID
             WHERE r.referrer_id = %d AND r.status = 'converted'
             ORDER BY r.created_at DESC
             LIMIT 5",
            $user_id
        ));

        $args = [
            'referral_url'     => $referral_url,
            'total_referrals'  => $total_referrals,
            'total_clicks'     => $total_clicks,
            'total_points'     => $total_points,
            'recent_referrals' => $recent_referrals,
            'user'             => $user
        ];

        ob_start();
        \GameEngine\Helper::get_template('shortcode/referral.php', $args);
        return apply_filters('gameengine/templates/shortcode/referral', ob_get_clean());
    }
}
