<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Handles all email notifications for the GameEngine plugin.
 */
class EmailManager
{
    /**
     * Initialize hooks to modify email headers and listen for events.
     */
    public static function init()
    {
        $self = new self();

        add_filter('wp_mail_from', [$self, 'set_from_email']);
        add_filter('wp_mail_from_name', [$self, 'set_from_name']);
        add_filter('wp_mail_content_type', [$self, 'set_content_type']);

        add_action('gameengine_level_awarded', [$self, 'send_level_up_email'], 10, 3);
        add_action('gameengine_achievement_unlocked', [$self, 'send_achievement_email'], 10, 3);
        add_action('gameengine_user_inactivity_detected', [$self, 'send_inactivity_nudge_email'], 10, 2);
        add_action('gameengine_points_added', [$self, 'check_points_milestone'], 10, 5);
    }

    /**
     * Parse HTML templates and replace placeholders.
     */
    private function parse_email_html($template_body, $user_id, $extra_vars = [])
    {
        $user = get_userdata($user_id);
        if (!$user) return '';

        // Default vars
        $vars = [
            '{user_name}' => $user->display_name,
            '{site_name}' => get_bloginfo('name'),
            '{points_balance}' => '0',
            '{level_name}' => '',
            '{achievement_name}' => '',
            '{next_level}' => '',
            '{points_to_next}' => '0'
        ];

        if (class_exists('\GameEngine\Classes\PointsManager')) {
            $pm = new \GameEngine\Classes\PointsManager();
            // Every point type together, as the member profile shows it.
            // get_total() alone reads point type #1, which a site need not have.
            $vars['{points_balance}'] = $pm->get_grand_total($user_id);
        }

        $vars = array_merge($vars, $extra_vars);

        // Simple HTML Wrapper
        $html = '<html><body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">';
        $html .= '<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">';
        $html .= str_replace(array_keys($vars), array_values($vars), nl2br($template_body));
        $html .= '</div></body></html>';

        return $html;
    }

    /**
     * Send email when a user levels up.
     *
     * @param int $user_id  User ID.
     * @param int $level_id Level ID.
     * @param int $log_id   Log ID.
     */
    public function send_level_up_email($user_id, $level_id, $log_id)
    {
        $user = get_userdata($user_id);
        if (!$user) {
            return;
        }

        $schedule = get_option('gameengine_email_schedule', 'immediate');
        if ($schedule !== 'immediate') {
            return;
        }

        $level_id_int = (int) $level_id;
        $cache_key    = 'gameengine_level_title_' . $level_id_int;
        $level_title  = wp_cache_get($cache_key, 'gameengine_emails');

        if (false === $level_title) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $level_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", $level_id_int));

            if ($level_title) {
                wp_cache_set($cache_key, $level_title, 'gameengine_emails', 300);
            }
        }

        $email_settings = get_option('gameengine_email_templates', []);
        
        $subject = !empty($email_settings['level_subject']) ? $email_settings['level_subject'] : __('Congratulations! You reached {level_name}', 'gameengine');
        $body_template = !empty($email_settings['level_body']) ? $email_settings['level_body'] : "Hi {user_name},<br><br>Congratulations! You have reached level: {level_name}.<br><br>Keep up the good work!";

        $subject = str_replace('{level_name}', $level_title, $subject);
        $body = $this->parse_email_html($body_template, $user_id, ['{level_name}' => $level_title]);

        $this->dispatch_notifications($email_settings, 'level', $user, $subject, $body);
    }

    /**
     * Send email when an achievement is unlocked.
     *
     * @param int $user_id        User ID.
     * @param int $achievement_id Achievement ID.
     * @param int $log_id         Log ID.
     */
    public function send_achievement_email($user_id, $achievement_id, $log_id)
    {
        $user = get_userdata($user_id);
        if (!$user) {
            return;
        }

        $achievement_id_int = (int) $achievement_id;
        $cache_key          = 'gameengine_ach_title_' . $achievement_id_int;
        $ach_title          = wp_cache_get($cache_key, 'gameengine_emails');

        if (false === $ach_title) {
            global $wpdb;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $ach_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", $achievement_id_int));

            if ($ach_title) {
                wp_cache_set($cache_key, $ach_title, 'gameengine_emails', 300);
            }
        }

        $email_settings = get_option('gameengine_email_templates', []);

        $subject = !empty($email_settings['achievement_subject']) ? $email_settings['achievement_subject'] : __('New Achievement Unlocked: {achievement_name}', 'gameengine');
        $body_template = !empty($email_settings['achievement_body']) ? $email_settings['achievement_body'] : "Hi {user_name},<br><br>You have unlocked a new achievement: {achievement_name}.<br><br>Check your profile!";

        $subject = str_replace('{achievement_name}', $ach_title, $subject);
        $body = $this->parse_email_html($body_template, $user_id, ['{achievement_name}' => $ach_title]);

        $this->dispatch_notifications($email_settings, 'achievement', $user, $subject, $body);
    }

    /**
     * Send email to inactive users.
     */
    public function send_inactivity_nudge_email($user_id, $points_balance)
    {
        $user = get_userdata($user_id);
        if (!$user) return;

        $email_settings = get_option('gameengine_email_templates', []);

        $subject = !empty($email_settings['inactivity_subject']) ? $email_settings['inactivity_subject'] : __('We miss you! You have {points_balance} points waiting.', 'gameengine');
        $body_template = !empty($email_settings['inactivity_body']) ? $email_settings['inactivity_body'] : "Hi {user_name},<br><br>We noticed you haven't been active lately. You possess {points_balance} points which you could use today!";

        $subject = str_replace('{points_balance}', $points_balance, $subject);
        $body = $this->parse_email_html($body_template, $user_id, ['{points_balance}' => $points_balance]);

        $this->dispatch_notifications($email_settings, 'inactivity', $user, $subject, $body);
    }

    /**
     * Track points for milestone emails.
     */
    public function check_points_milestone($user_id, $points, $context, $log_id, $point_type_id)
    {
        if (!class_exists('\GameEngine\Classes\PointsManager')) return;
        $pm = new \GameEngine\Classes\PointsManager();

        // The balance has to be read for the currency this award belongs to.
        // get_total() defaults to point type 1, so an award on any other type
        // was subtracted from an unrelated balance — leaving old_total below
        // the milestone every time and re-sending the same email on every
        // award.
        $total_points = $pm->get_total($user_id, (int) $point_type_id);

        $old_total = $total_points - $points;
        $milestone = 500; // e.g. Trigger every 500 points

        // Check if crossed a multiple of 500
        if (floor($old_total / $milestone) < floor($total_points / $milestone)) {
            $user = get_userdata($user_id);
            if (!$user) return;

            $email_settings = get_option('gameengine_email_templates', []);
            
            $subject = !empty($email_settings['milestone_subject']) ? $email_settings['milestone_subject'] : __('You reached a milestone! {points_balance} Points!', 'gameengine');
            $body_template = !empty($email_settings['milestone_body']) ? $email_settings['milestone_body'] : "Hi {user_name},<br><br>Awesome! You now have {points_balance} points.<br>";

            $subject = str_replace('{points_balance}', $total_points, $subject);
            
            // Note: {next_level} logic would need LevelManager to calculate
            // The body shows the same balance as the subject: this point type's.
            $extra_vars = ['{points_balance}' => $total_points];
            
            $body = $this->parse_email_html($body_template, $user_id, $extra_vars);

            $this->dispatch_notifications($email_settings, 'milestone', $user, $subject, $body);
        }
    }

    public function set_html_content_type() {
        return 'text/html';
    }

    /**
     * Send email with custom headers
     */
    private function send_wp_mail($to, $subject, $body, $email_settings) {
        $headers = [];
        
        $sender_name = !empty($email_settings['sender_name']) ? $email_settings['sender_name'] : get_bloginfo('name');
        $sender_email = !empty($email_settings['sender_email']) ? $email_settings['sender_email'] : get_option('admin_email');
        
        if (is_email($sender_email)) {
            $headers[] = "From: {$sender_name} <{$sender_email}>";
        }


        add_filter('wp_mail_content_type', [$this, 'set_html_content_type']);
        wp_mail($to, $subject, $body, $headers);
        remove_filter('wp_mail_content_type', [$this, 'set_html_content_type']);
    }

    /**
     * Dispatch notifications based on user/admin settings.
     */
    private function dispatch_notifications($email_settings, $prefix, $user, $subject, $body)
    {
        $user_enabled_raw = isset($email_settings[$prefix . '_user_enabled']) ? $email_settings[$prefix . '_user_enabled'] : (isset($email_settings[$prefix . '_enabled']) ? $email_settings[$prefix . '_enabled'] : true);
        $user_enabled = filter_var($user_enabled_raw, FILTER_VALIDATE_BOOLEAN);

        $admin_enabled_raw = isset($email_settings[$prefix . '_admin_enabled']) ? $email_settings[$prefix . '_admin_enabled'] : false;
        $admin_enabled = filter_var($admin_enabled_raw, FILTER_VALIDATE_BOOLEAN);

        if ($user_enabled) {
            $this->send_wp_mail($user->user_email, $subject, $body, $email_settings);
        }

        if ($admin_enabled) {
            $admin_email = get_option('admin_email');
            $admin_subject = "[GameEngine Notification] " . $subject;
            $this->send_wp_mail($admin_email, $admin_subject, $body, $email_settings);
        }
    }

    /**
     * Set custom 'From' email address.
     */
    public function set_from_email($original_email)
    {
        $custom_email = get_option('gameengine_email_from_email');
        return is_email($custom_email) ? $custom_email : $original_email;
    }

    /**
     * Set custom 'From' name.
     */
    public function set_from_name($original_name)
    {
        $custom_name = get_option('gameengine_email_from_name');
        return !empty($custom_name) ? $custom_name : $original_name;
    }

    /**
     * Set email content type based on settings (HTML or Plain).
     */
    public function set_content_type($content_type)
    {
        $format = get_option('gameengine_email_format', 'html'); // Default to html
        return ($format === 'html') ? 'text/html' : 'text/plain';
    }

    /**
     * Send gift points notification to an existing registered user.
     */
    public function send_gift_points_received_email(string $to_email, string $recipient_name, string $sender_name, int $amount, string $point_type_name, string $message = ''): bool
    {
        if (!is_email($to_email)) {
            return false;
        }

        $site_name = get_bloginfo('name');
        $greeting_name = $recipient_name ?: $to_email;

        $subject = sprintf(
            /* translators: 1: Sender name, 2: Points amount, 3: Point type name */
            __('%1$s sent you %2$s %3$s!', 'gameengine'),
            $sender_name,
            number_format_i18n($amount),
            $point_type_name
        );

        $body  = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">';
        $body .= '<div style="text-align: center; margin-bottom: 24px;">';
        $body .= '<span style="font-size: 42px;">🎁</span>';
        $body .= '<h2 style="margin: 12px 0 0 0; color: #0f172a; font-size: 22px;">' . esc_html__('You Received a Gift of Points!', 'gameengine') . '</h2>';
        $body .= '</div>';

        $body .= '<p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">' . sprintf(
            /* translators: %s: Recipient name */
            esc_html__('Hi %s,', 'gameengine'),
            '<strong>' . esc_html($greeting_name) . '</strong>'
        ) . '</p>';

        $body .= '<p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">' . sprintf(
            /* translators: 1: Sender name, 2: Amount, 3: Point type name, 4: Site name */
            esc_html__('Great news! %1$s has just gifted you %2$s %3$s on %4$s.', 'gameengine'),
            '<strong>' . esc_html($sender_name) . '</strong>',
            '<strong>' . esc_html(number_format_i18n($amount)) . '</strong>',
            esc_html($point_type_name),
            esc_html($site_name)
        ) . '</p>';

        if (!empty($message)) {
            $body .= '<div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">';
            $body .= '<p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">' . esc_html__('Personal Note from Sender:', 'gameengine') . '</p>';
            $body .= '<p style="margin: 0; font-size: 14px; font-style: italic; color: #334155;">"' . esc_html($message) . '"</p>';
            $body .= '</div>';
        }

        $body .= '<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; text-align: center; margin: 24px 0;">';
        $body .= '<p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">' . esc_html__('✨ The points have been automatically deposited into your account balance.', 'gameengine') . '</p>';
        $body .= '</div>';

        $account_url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/');
        $body .= '<div style="text-align: center; margin: 28px 0 16px 0;">';
        $body .= '<a href="' . esc_url($account_url) . '" style="background: #6366f1; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">' . esc_html__('View Your Points Balance', 'gameengine') . '</a>';
        $body .= '</div>';

        $body .= '<p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">' . sprintf(
            /* translators: %s: Site name */
            esc_html__('Thank you for being part of %s!', 'gameengine'),
            esc_html($site_name)
        ) . '</p>';
        $body .= '</div>';

        $email_settings = get_option('gameengine_email_settings', array());
        $this->send_wp_mail($to_email, $subject, $body, $email_settings);
        return true;
    }

    /**
     * Send gift claim invitation email to an unregistered recipient.
     */
    public function send_gift_points_claim_email(string $to_email, string $recipient_name, string $sender_name, int $amount, string $point_type_name, string $message = '', string $claim_url = ''): bool
    {
        if (!is_email($to_email)) {
            return false;
        }

        $site_name = get_bloginfo('name');
        $greeting_name = $recipient_name ?: $to_email;

        $subject = sprintf(
            /* translators: 1: Sender name, 2: Points amount, 3: Point type name, 4: Site name */
            __('%1$s sent you %2$s %3$s on %4$s!', 'gameengine'),
            $sender_name,
            number_format_i18n($amount),
            $point_type_name,
            $site_name
        );

        $body  = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">';
        $body .= '<div style="text-align: center; margin-bottom: 24px;">';
        $body .= '<span style="font-size: 42px;">🎁</span>';
        $body .= '<h2 style="margin: 12px 0 0 0; color: #0f172a; font-size: 22px;">' . esc_html__('You Have a Gift Waiting!', 'gameengine') . '</h2>';
        $body .= '</div>';

        $body .= '<p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">' . sprintf(
            /* translators: %s: Recipient name */
            esc_html__('Hi %s,', 'gameengine'),
            '<strong>' . esc_html($greeting_name) . '</strong>'
        ) . '</p>';

        $body .= '<p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">' . sprintf(
            /* translators: 1: Sender name, 2: Amount, 3: Point type name, 4: Site name */
            esc_html__('%1$s has sent you a special gift of %2$s %3$s on %4$s!', 'gameengine'),
            '<strong>' . esc_html($sender_name) . '</strong>',
            '<strong>' . esc_html(number_format_i18n($amount)) . '</strong>',
            esc_html($point_type_name),
            esc_html($site_name)
        ) . '</p>';

        if (!empty($message)) {
            $body .= '<div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">';
            $body .= '<p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">' . esc_html__('Personal Note from Sender:', 'gameengine') . '</p>';
            $body .= '<p style="margin: 0; font-size: 14px; font-style: italic; color: #334155;">"' . esc_html($message) . '"</p>';
            $body .= '</div>';
        }

        $body .= '<p style="font-size: 15px; line-height: 1.6; margin: 20px 0;">' . esc_html__('To claim your points, click the button below to sign in or create an account with this email address. The points will be instantly added to your new balance!', 'gameengine') . '</p>';

        if (!empty($claim_url)) {
            $body .= '<div style="text-align: center; margin: 28px 0 16px 0;">';
            $body .= '<a href="' . esc_url($claim_url) . '" style="background: #6366f1; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">' . esc_html__('Claim Your Gift Points Now', 'gameengine') . '</a>';
            $body .= '</div>';
            $body .= '<p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 12px;">' . esc_html__('Or copy and paste this URL into your browser:', 'gameengine') . '<br><span style="color: #6366f1; word-break: break-all;">' . esc_url($claim_url) . '</span></p>';
        }

        $body .= '<p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">' . sprintf(
            /* translators: %s: Site name */
            esc_html__('We look forward to seeing you on %s!', 'gameengine'),
            esc_html($site_name)
        ) . '</p>';
        $body .= '</div>';

        $email_settings = get_option('gameengine_email_settings', array());
        $this->send_wp_mail($to_email, $subject, $body, $email_settings);
        return true;
    }
}
