<?php

namespace GameEngine\Addons\SocialSharing;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Social Sharing Addon.
 * Generates OG share images and share URLs for achievements and levels.
 */
class Init
{
    const ADDON_SLUG = 'social_sharing';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);

        // Inject share buttons via JS on frontend.
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_share_scripts']);
    }

    // ─── REST routes ──────────────────────────────────────────────────────────

    public static function register_rest_routes()
    {
        register_rest_route('gameengine/v1', '/share/achievement/(?P<id>\d+)', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [__CLASS__, 'get_achievement_share_data'],
            'permission_callback' => '__return_true',
            'args'                => [
                'id' => ['required' => true, 'validate_callback' => 'is_numeric'],
            ],
        ]);

        register_rest_route('gameengine/v1', '/share/level/(?P<id>\d+)', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [__CLASS__, 'get_level_share_data'],
            'permission_callback' => '__return_true',
            'args'                => [
                'id' => ['required' => true, 'validate_callback' => 'is_numeric'],
            ],
        ]);
    }

    public static function get_achievement_share_data(\WP_REST_Request $request): \WP_REST_Response
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $ach = $wpdb->get_row($wpdb->prepare(
            "SELECT id, title, badge_image, disable_sharing FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d",
            $id
        ), ARRAY_A);

        if (! $ach) {
            return new \WP_REST_Response(['error' => 'Not found'], 404);
        }

        if (! empty($ach['disable_sharing'])) {
            return new \WP_REST_Response(['error' => 'Sharing disabled'], 403);
        }

        $og_image = self::get_or_generate_og_image('achievement', $id, $ach['title'], $ach['badge_image'] ?? '');

        return new \WP_REST_Response([
            'title'       => $ach['title'],
            'og_image'    => $og_image,
            'share_urls'  => self::build_share_urls($ach['title'], $og_image),
        ]);
    }

    public static function get_level_share_data(\WP_REST_Request $request): \WP_REST_Response
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $level = $wpdb->get_row($wpdb->prepare(
            "SELECT id, title, icon FROM {$wpdb->prefix}gameengine_levels WHERE id = %d",
            $id
        ), ARRAY_A);

        if (! $level) {
            return new \WP_REST_Response(['error' => 'Not found'], 404);
        }

        $og_image = self::get_or_generate_og_image('level', $id, $level['title'], $level['icon'] ?? '');

        return new \WP_REST_Response([
            'title'      => $level['title'],
            'og_image'   => $og_image,
            'share_urls' => self::build_share_urls($level['title'], $og_image),
        ]);
    }

    // ─── OG image generation ──────────────────────────────────────────────────

    /**
     * Return cached OG image URL, or generate and cache it.
     */
    private static function get_or_generate_og_image(string $type, int $id, string $title, string $icon_url): string
    {
        $cache_key = "ge_og_{$type}_{$id}";
        $cached    = get_transient($cache_key);
        if ($cached) {
            return $cached;
        }

        $url = self::generate_og_image($title, $icon_url);
        if ($url) {
            set_transient($cache_key, $url, WEEK_IN_SECONDS);
        }
        return $url ?: plugins_url('assets/img/ge-share-default.png', GAMEENGINE_PLUGIN_FILE);
    }

    private static function generate_og_image(string $title, string $icon_url): string
    {
        // Require GD or Imagick.
        if (! extension_loaded('gd') && ! extension_loaded('imagick')) {
            return '';
        }

        $width  = 1200;
        $height = 630;

        if (extension_loaded('gd')) {
            $img = imagecreatetruecolor($width, $height);
            if (! $img) {
                return '';
            }

            $bg     = imagecolorallocate($img, 30, 30, 60);
            $white  = imagecolorallocate($img, 255, 255, 255);
            $accent = imagecolorallocate($img, 100, 150, 255);

            imagefill($img, 0, 0, $bg);

            // Draw accent bar at top.
            imagefilledrectangle($img, 0, 0, $width, 8, $accent);

            // Title text (requires a font path or use built-in).
            $font_size = 5;
            $text_x    = 60;
            $text_y    = 280;
            imagestring($img, $font_size, $text_x, $text_y, mb_substr($title, 0, 60), $white);

            // Site name.
            $site_name = get_bloginfo('name');
            imagestring($img, 3, $text_x, $text_y + 40, $site_name, $accent);

            ob_start();
            imagepng($img);
            $png_data = ob_get_clean();
            imagedestroy($img);

            // Save as WP attachment.
            $upload   = wp_upload_bits('ge-share-' . sanitize_title($title) . '.png', null, $png_data);
            if (! empty($upload['url'])) {
                return $upload['url'];
            }
        }

        return '';
    }

    // ─── Share URL building ───────────────────────────────────────────────────

    private static function build_share_urls(string $title, string $og_image): array
    {
        $site_url   = get_bloginfo('url');
        $text       = rawurlencode($title . ' - ' . get_bloginfo('name'));
        $page_url   = rawurlencode($site_url);

        return [
            'facebook'  => 'https://www.facebook.com/sharer/sharer.php?u=' . $page_url,
            'twitter'   => 'https://twitter.com/intent/tweet?text=' . $text . '&url=' . $page_url,
            'linkedin'  => 'https://www.linkedin.com/sharing/share-offsite/?url=' . $page_url,
            'copy_link' => $site_url,
        ];
    }

    // ─── Frontend script ──────────────────────────────────────────────────────

    public static function enqueue_share_scripts()
    {
        $settings = get_option('gameengine_social_sharing_settings', []);
        if (! empty($settings['disabled'])) {
            return;
        }

        wp_add_inline_script('jquery-core', '
            window.GE_SHARE_REST = ' . wp_json_encode([
                'achievementEndpoint' => rest_url('gameengine/v1/share/achievement/'),
                'levelEndpoint'       => rest_url('gameengine/v1/share/level/'),
                'nonce'               => wp_create_nonce('wp_rest'),
            ]) . ';
        ');
    }
}

Init::init();
