<?php

namespace GameEngine\Addons\EnhancedEmailNotifications;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Enhanced Email Notifications Addon.
 * Adds per-user opt-out, expiration warnings, points-added emails,
 * and a richer template tag engine on top of the existing EmailManager.
 */
class Init
{
    const ADDON_SLUG    = 'enhanced_email_notifications';
    const OPT_OUT_META  = 'gameengine_email_prefs';

    /** Supported event keys => label. */
    const EVENTS = [
        'points_added'         => 'Points Awarded',
        'achievement_unlocked' => 'Achievement Unlocked',
        'level_awarded'        => 'Level Up',
        'points_expiring'      => 'Points Expiring (Warning)',
        'birthday'             => 'Birthday Reward',
        'anniversary'          => 'Anniversary Reward',
    ];

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        add_action('gameengine_points_added', [__CLASS__, 'on_points_added'], 20, 5);
        add_action('gameengine_achievement_unlocked', [__CLASS__, 'on_achievement_unlocked'], 20, 3);
        add_action('gameengine_level_awarded', [__CLASS__, 'on_level_awarded'], 20, 3);

        add_action('gameengine_birthday', [__CLASS__, 'on_birthday'], 20, 1);
        add_action('gameengine_anniversary', [__CLASS__, 'on_anniversary'], 20, 1);

        // Register email-preferences shortcode.
        add_shortcode('gameengine_email_preferences', [__CLASS__, 'render_preferences_form']);

        // Handle form submission.
        add_action('wp_loaded', [__CLASS__, 'handle_preferences_save']);

        // Expiration warning: piggyback on expiration cron.
        add_action('gameengine_expire_points', [__CLASS__, 'send_expiration_warnings'], 5);
    }

    // ─── Event handlers ──────────────────────────────────────────────────────

    public static function on_points_added(int $user_id, int $points, string $context, int $log_id, int $point_type_id)
    {
        if (! self::user_wants_event($user_id, 'points_added')) {
            return;
        }
        if (! self::is_event_globally_enabled('points_added')) {
            return;
        }

        $user = get_userdata($user_id);
        if (! $user) {
            return;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $pt_name = $wpdb->get_var($wpdb->prepare(
            "SELECT name FROM {$wpdb->prefix}gameengine_point_types WHERE id = %d",
            $point_type_id
        ));

        $pm    = new \GameEngine\Classes\PointsManager();
        $extra = [
            '{points}'       => $points,
            '{point_type}'   => $pt_name ?: '',
            '{total_points}' => $pm->get_total($user_id, $point_type_id),
        ];

        self::send_event_email($user, 'points_added', $extra);
    }

    public static function on_achievement_unlocked(int $user_id, int $achievement_id, int $user_achievement_id)
    {
        if (! self::user_wants_event($user_id, 'achievement_unlocked')) {
            return;
        }
        if (! self::is_event_globally_enabled('achievement_unlocked')) {
            return;
        }

        $user = get_userdata($user_id);
        if (! $user) {
            return;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT title, badge_image FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d",
            $achievement_id
        ), ARRAY_A);

        $extra = [
            '{achievement_title}'     => $row['title'] ?? '',
            '{achievement_image_url}' => $row['badge_image'] ?? '',
        ];

        self::send_event_email($user, 'achievement_unlocked', $extra);
    }

    public static function on_level_awarded(int $user_id, int $level_id, int $user_level_id)
    {
        if (! self::user_wants_event($user_id, 'level_awarded')) {
            return;
        }
        if (! self::is_event_globally_enabled('level_awarded')) {
            return;
        }

        $user = get_userdata($user_id);
        if (! $user) {
            return;
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT title, icon FROM {$wpdb->prefix}gameengine_levels WHERE id = %d",
            $level_id
        ), ARRAY_A);

        $extra = [
            '{level_title}'    => $row['title'] ?? '',
            '{level_icon_url}' => $row['icon'] ?? '',
        ];

        self::send_event_email($user, 'level_awarded', $extra);
    }

    /**
     * Send expiration warning emails for points expiring within the configured warning window.
     */
    public static function send_expiration_warnings()
    {
        $settings     = get_option('gameengine_enhanced_email_settings', []);
        $warning_days = absint($settings['expiration_warning_days'] ?? 7);

        if (! self::is_event_globally_enabled('points_expiring') || $warning_days < 1) {
            return;
        }

        global $wpdb;
        $table    = $wpdb->prefix . 'gameengine_points_log';
        $window   = gmdate('Y-m-d H:i:s', strtotime("+{$warning_days} days", current_time('timestamp')));
        $now      = current_time('mysql');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT user_id, point_type_id, SUM(points) AS expiring_points, MIN(expires_at) AS earliest_expiry
             FROM {$table}
             WHERE points > 0
               AND expires_at IS NOT NULL
               AND expires_at > %s
               AND expires_at <= %s
               AND expired = 0
             GROUP BY user_id, point_type_id",
            $now,
            $window
        ), ARRAY_A);

        foreach ($rows as $row) {
            $user_id = (int) $row['user_id'];

            if (! self::user_wants_event($user_id, 'points_expiring')) {
                continue;
            }

            $user = get_userdata($user_id);
            if (! $user) {
                continue;
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $pt_name = $wpdb->get_var($wpdb->prepare(
                "SELECT name FROM {$wpdb->prefix}gameengine_point_types WHERE id = %d",
                (int) $row['point_type_id']
            ));

            $extra = [
                '{points}'      => (int) $row['expiring_points'],
                '{point_type}'  => $pt_name ?: '',
                '{expiry_date}' => date_i18n(get_option('date_format'), strtotime($row['earliest_expiry'])),
            ];

            self::send_event_email($user, 'points_expiring', $extra);
        }
    }

    public static function on_birthday(int $user_id)
    {
        $user = get_userdata($user_id);
        if (! $user || ! self::user_wants_event($user_id, 'birthday') || ! self::is_event_globally_enabled('birthday')) {
            return;
        }
        self::send_event_email($user, 'birthday', []);
    }

    public static function on_anniversary(int $user_id)
    {
        $user = get_userdata($user_id);
        if (! $user || ! self::user_wants_event($user_id, 'anniversary') || ! self::is_event_globally_enabled('anniversary')) {
            return;
        }
        self::send_event_email($user, 'anniversary', []);
    }

    // ─── Email sending ────────────────────────────────────────────────────────

    private static function send_event_email(\WP_User $user, string $event, array $extra_tags = [])
    {
        $settings = get_option('gameengine_enhanced_email_settings', []);

        $defaults = [
            'points_added'         => [
                'subject' => __('You earned {points} {point_type}!', 'gameengine'),
                'body'    => __("Hi {user_name},\n\nYou just earned {points} {point_type}. Your new balance is {total_points}.\n\n{site_name}", 'gameengine'),
            ],
            'achievement_unlocked' => [
                'subject' => __('Achievement Unlocked: {achievement_title}', 'gameengine'),
                'body'    => __("Hi {user_name},\n\nYou unlocked \"{achievement_title}\"!\n\n{site_name}", 'gameengine'),
            ],
            'level_awarded'        => [
                'subject' => __('You reached a new level: {level_title}', 'gameengine'),
                'body'    => __("Hi {user_name},\n\nCongratulations! You reached level {level_title}.\n\n{site_name}", 'gameengine'),
            ],
            'points_expiring'      => [
                'subject' => __('Your {points} {point_type} expire on {expiry_date}', 'gameengine'),
                'body'    => __("Hi {user_name},\n\n{points} of your {point_type} will expire on {expiry_date}. Use them before they are gone!\n\n{site_name}", 'gameengine'),
            ],
        ];

        $subject_tpl = $settings["{$event}_subject"] ?? $defaults[$event]['subject'];
        $body_tpl    = $settings["{$event}_body"] ?? $defaults[$event]['body'];

        $tags = array_merge(self::base_tags($user), $extra_tags);

        $subject = self::resolve_tags($subject_tpl, $tags);
        $body    = self::resolve_tags($body_tpl, $tags);

        $html_body  = self::wrap_html($body);
        $plain_body = wp_strip_all_tags($body);

        $to      = $user->user_email;
        $headers = [
            'Content-Type: multipart/alternative; boundary="ge_email_boundary"',
        ];

        // Build multipart body manually to stay compatible with wp_mail.
        $multipart  = "--ge_email_boundary\r\n";
        $multipart .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $multipart .= $plain_body . "\r\n";
        $multipart .= "--ge_email_boundary\r\n";
        $multipart .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $multipart .= $html_body . "\r\n";
        $multipart .= "--ge_email_boundary--";

        wp_mail($to, $subject, $multipart, $headers);
    }

    private static function base_tags(\WP_User $user): array
    {
        return [
            '{user_name}'  => $user->display_name,
            '{user_email}' => $user->user_email,
            '{site_name}'  => get_bloginfo('name'),
            '{site_url}'   => get_bloginfo('url'),
            '{date}'       => date_i18n(get_option('date_format')),
        ];
    }

    private static function resolve_tags(string $template, array $tags): string
    {
        return str_replace(array_keys($tags), array_values($tags), $template);
    }

    private static function wrap_html(string $content): string
    {
        $content_nl2br = nl2br(esc_html($content));
        return '<html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;">'
             . '<div style="max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:8px;">'
             . $content_nl2br
             . '</div></body></html>';
    }

    // ─── Per-user opt-out ─────────────────────────────────────────────────────

    public static function user_wants_event(int $user_id, string $event): bool
    {
        $prefs = get_user_meta($user_id, self::OPT_OUT_META, true);
        if (! is_array($prefs)) {
            return true;
        }
        return ! in_array($event, $prefs, true);
    }

    public static function is_event_globally_enabled(string $event): bool
    {
        $settings = get_option('gameengine_enhanced_email_settings', []);
        $key      = "{$event}_enabled";
        return ! isset($settings[$key]) || (bool) $settings[$key];
    }

    // ─── Shortcode: email preferences form ───────────────────────────────────

    public static function render_preferences_form(): string
    {
        if (! is_user_logged_in()) {
            return '<p>' . esc_html__('Please log in to manage your email preferences.', 'gameengine') . '</p>';
        }

        $user_id = get_current_user_id();
        $prefs   = (array) get_user_meta($user_id, self::OPT_OUT_META, true);

        $nonce = wp_create_nonce('gameengine_email_prefs');

        $out  = '<form method="post" class="ge-email-preferences">';
        $out .= '<input type="hidden" name="ge_email_prefs_nonce" value="' . esc_attr($nonce) . '">';
        $out .= '<h3>' . esc_html__('Email Notification Preferences', 'gameengine') . '</h3>';

        foreach (self::EVENTS as $event => $label) {
            $disabled = ! self::is_event_globally_enabled($event);
            $checked  = ! in_array($event, $prefs, true) && ! $disabled ? ' checked' : '';
            $out .= '<label style="display:block;margin-bottom:8px;">';
            $out .= '<input type="checkbox" name="ge_events[]" value="' . esc_attr($event) . '"' . $checked;
            $out .= $disabled ? ' disabled>' : '>';
            $out .= esc_html($label);
            $out .= $disabled ? ' <em>(' . esc_html__('disabled by admin', 'gameengine') . ')</em>' : '';
            $out .= '</label>';
        }

        $out .= '<button type="submit" name="ge_save_email_prefs" class="button">'
             . esc_html__('Save Preferences', 'gameengine') . '</button>';
        $out .= '</form>';

        return $out;
    }

    public static function handle_preferences_save()
    {
        if (! isset($_POST['ge_save_email_prefs']) || ! is_user_logged_in()) {
            return;
        }
        if (! wp_verify_nonce(sanitize_key($_POST['ge_email_prefs_nonce'] ?? ''), 'gameengine_email_prefs')) {
            return;
        }

        $user_id       = get_current_user_id();
        $wanted        = array_map('sanitize_key', (array) ($_POST['ge_events'] ?? []));
        $all_events    = array_keys(self::EVENTS);
        $opted_out     = array_diff($all_events, $wanted);

        update_user_meta($user_id, self::OPT_OUT_META, array_values($opted_out));
    }
}

Init::init();
