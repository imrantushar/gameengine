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
        $slug = isset($_GET['gameengine_achievement']) ? sanitize_key($_GET['gameengine_achievement']) : '';
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

        $title       = esc_html($achievement['title'] ?? __('Achievement', 'gameengine'));
        $description = esc_html($achievement['description'] ?? '');
        $image       = esc_url($achievement['badge_image'] ?? '');
        $site_name   = esc_html(get_bloginfo('name'));
        $permalink   = esc_url(add_query_arg('gameengine_achievement', $slug, home_url('/')));

        header('Content-Type: text/html; charset=UTF-8');
        // phpcs:disable
        echo '<!DOCTYPE html><html><head>';
        echo '<meta charset="UTF-8">';
        echo '<title>' . $title . ' - ' . $site_name . '</title>';
        echo '<meta property="og:type" content="website">';
        echo '<meta property="og:title" content="' . $title . '">';
        echo '<meta property="og:description" content="' . $description . '">';
        echo '<meta property="og:url" content="' . $permalink . '">';
        echo '<meta property="og:site_name" content="' . $site_name . '">';
        if ($image) {
            echo '<meta property="og:image" content="' . $image . '">';
        }
        echo '<meta http-equiv="refresh" content="0;url=' . esc_url(home_url('/')) . '">';
        echo '</head><body></body></html>';
        // phpcs:enable
        exit;
    }
}
