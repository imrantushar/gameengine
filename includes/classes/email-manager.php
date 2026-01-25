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

        /* translators: %s: Level title */
        $subject = sprintf(__('Congratulations! You reached %s', 'gameengine'), $level_title);

        $content = get_option('gameengine_email_content', '');
        if (empty($content)) {
            $content = "Hi {user_name},\n\nCongratulations! You have reached level: {level_name}.\n\nKeep up the good work!";
        }

        $body = str_replace(
            ['{user_name}', '{level_name}', '{site_name}'],
            [$user->display_name, $level_title, get_bloginfo('name')],
            $content
        );

        wp_mail($user->user_email, $subject, $body);
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

        /* translators: %s: Achievement title */
        $subject = sprintf(__('New Achievement Unlocked: %s', 'gameengine'), $ach_title);

        /* translators: 1: User display name, 2: Achievement title */
        $body = sprintf(
            __("Hi %1\$s,\n\nYou have unlocked a new achievement: %2\$s.\n\nCheck your profile!", 'gameengine'),
            $user->display_name,
            $ach_title
        );

        wp_mail($user->user_email, $subject, $body);
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
        $format = get_option('gameengine_email_format', 'plain');
        return ($format === 'html') ? 'text/html' : 'text/plain';
    }
}
