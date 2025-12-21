<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

class EmailManager
{
    /**
     * Initialize hooks to modify email headers based on settings.
     */
    public static function init()
    {
        $self = new self();
        // Hook into wp_mail to set From Name & Address dynamically
        add_filter('wp_mail_from', [$self, 'set_from_email']);
        add_filter('wp_mail_from_name', [$self, 'set_from_name']);
        add_filter('wp_mail_content_type', [$self, 'set_content_type']);

        // Listen to Gamify Events to send emails
        add_action('gamify_level_awarded', [$self, 'send_level_up_email'], 10, 3);
        add_action('gamify_achievement_unlocked', [$self, 'send_achievement_email'], 10, 3);
    }

    /**
     * Send email when a user levels up.
     */
    public function send_level_up_email($user_id, $level_id, $log_id)
    {
        $user = get_userdata($user_id);
        if (!$user) return;

        // Get saved settings
        $schedule = get_option('gamify_email_schedule', 'immediate');

        if ($schedule !== 'immediate') {
            // Logic for cron/digest scheduling can be added here
            return;
        }

        global $wpdb;
        $level_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gamify_levels WHERE id = %d", $level_id));

        $subject = sprintf(__('Congratulations! You reached %s', 'gamify'), $level_title);

        // Get template content or default
        $content = get_option('gamify_email_content', '');
        if (empty($content)) {
            $content = "Hi {user_name},\n\nCongratulations! You have reached level: {level_name}.\n\nKeep up the good work!";
        }

        // Replace placeholders
        $body = str_replace(
            ['{user_name}', '{level_name}', '{site_name}'],
            [$user->display_name, $level_title, get_bloginfo('name')],
            $content
        );

        wp_mail($user->user_email, $subject, $body);
    }

    /**
     * Send email when achievement is unlocked.
     */
    public function send_achievement_email($user_id, $achievement_id, $log_id)
    {
        $user = get_userdata($user_id);
        if (!$user) return;

        global $wpdb;
        $ach_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gamify_achievements WHERE id = %d", $achievement_id));

        $subject = sprintf(__('New Achievement Unlocked: %s', 'gamify'), $ach_title);
        $body = "Hi {$user->display_name},\n\nYou have unlocked a new achievement: {$ach_title}.\n\nCheck your profile!";

        wp_mail($user->user_email, $subject, $body);
    }

    // --- FILTERS ---

    public function set_from_email($original_email)
    {
        $custom_email = get_option('gamify_email_from_email');
        return is_email($custom_email) ? $custom_email : $original_email;
    }

    public function set_from_name($original_name)
    {
        $custom_name = get_option('gamify_email_from_name');
        return !empty($custom_name) ? $custom_name : $original_name;
    }

    public function set_content_type($content_type)
    {
        $format = get_option('gamify_email_format', 'plain');
        return ($format === 'html') ? 'text/html' : 'text/plain';
    }
}
