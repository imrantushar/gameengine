<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SocialSharing
 * Registers a shareable permalink for achievements: ?gameengine_achievement=slug
 */
class SocialSharing
{

    public static function init()
    {
        $general  = get_option('gameengine_general_settings', array());
        $enabled  = ! isset($general['social_sharing']) || ! empty($general['social_sharing']);
        if (! $enabled) {
            return;
        }

        add_action('template_redirect', array(__CLASS__, 'handle_achievement_permalink'));
    }

    /**
     * Intercept ?gameengine_achievement=<slug> and render a simple OG-tagged page.
     */
    public static function handle_achievement_permalink()
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a public share link, not a form submission.
        $slug = isset($_GET['gameengine_achievement']) ? sanitize_key(wp_unslash($_GET['gameengine_achievement'])) : '';
        if (empty($slug)) {
            return;
        }

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $achievement = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}gameengine_achievements WHERE slug = %s LIMIT 1",
                $slug
            ),
            ARRAY_A
        );

        if (! $achievement) {
            return;
        }

        $title       = $achievement['title'] ?? __('Achievement', 'gameengine');
        $description = $achievement['description'] ?? '';
        $image       = $achievement['badge_image'] ?? '';
        $site_name   = get_bloginfo('name');
        $permalink   = add_query_arg('gameengine_achievement', $slug, home_url('/'));

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html><html><head>';
        echo '<meta charset="UTF-8">';
        echo '<title>' . esc_html($title) . ' - ' . esc_html($site_name) . '</title>';
        echo '<meta property="og:type" content="website">';
        echo '<meta property="og:title" content="' . esc_attr($title) . '">';
        echo '<meta property="og:description" content="' . esc_attr($description) . '">';
        echo '<meta property="og:url" content="' . esc_url($permalink) . '">';
        echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">';
        if ($image) {
            echo '<meta property="og:image" content="' . esc_url($image) . '">';
        }
        echo '<meta http-equiv="refresh" content="0;url=' . esc_url(home_url('/')) . '">';
        echo '</head><body></body></html>';
        exit;
    }
}
