<?php

namespace GameEngine\Addons\NewEngagementTriggers;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * New Engagement Triggers Addon.
 * Registers link-click, video-watch, birthday, and anniversary triggers.
 */
class Init
{
    const ADDON_SLUG        = 'new_engagement_triggers';
    const BIRTHDAY_CRON     = 'gameengine_birthday_check';
    const ANNIVERSARY_CRON  = 'gameengine_anniversary_check';
    const LINK_QUERY_VAR    = 'gameengine_link';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            self::clear_crons();
            return;
        }

        // Register the integration with TriggerRegistry.
        add_filter('gameengine_integrations', [__CLASS__, 'register_integration']);

        // Link-click: rewrite + endpoint.
        add_action('init', [__CLASS__, 'register_link_rewrite']);
        add_action('template_redirect', [__CLASS__, 'handle_link_redirect']);
        add_filter('query_vars', [__CLASS__, 'add_query_var']);

        // Video-watch: REST endpoint + shortcode.
        add_action('rest_api_init', [__CLASS__, 'register_video_rest_route']);
        add_shortcode('gameengine_video', [__CLASS__, 'render_video_shortcode']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_video_script']);

        // Birthday/anniversary crons.
        self::schedule_crons();
        add_action(self::BIRTHDAY_CRON, [__CLASS__, 'run_birthday_check']);
        add_action(self::ANNIVERSARY_CRON, [__CLASS__, 'run_anniversary_check']);
    }

    // ─── Integration registration ─────────────────────────────────────────────

    public static function register_integration(array $integrations): array
    {
        if (! class_exists('\GameEngine\Integrations\NewEngagement')) {
            require_once dirname(__DIR__, 2) . '/integrations/new-engagement.php';
        }
        $integrations['new_engagement'] = \GameEngine\Integrations\NewEngagement::class;
        return $integrations;
    }

    // ─── Link-click ───────────────────────────────────────────────────────────

    public static function register_link_rewrite()
    {
        add_rewrite_rule('^gameengine-link/([a-zA-Z0-9_-]+)/?$', 'index.php?' . self::LINK_QUERY_VAR . '=$matches[1]', 'top');
    }

    public static function add_query_var(array $vars): array
    {
        $vars[] = self::LINK_QUERY_VAR;
        return $vars;
    }

    public static function handle_link_redirect()
    {
        $token = get_query_var(self::LINK_QUERY_VAR);
        if (empty($token)) {
            return;
        }

        $link = self::get_link_by_token(sanitize_key($token));
        if (! $link) {
            wp_die(esc_html__('Invalid link.', 'gameengine'), 404);
        }

        $destination = $link['destination_url'];

        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $meta_key = 'gameengine_link_click_' . $link['id'];

            // Once-per-user enforcement (default).
            $limit = $link['limit'] ?? 'once';
            $already_clicked = (bool) get_user_meta($user_id, $meta_key, true);

            if (! $already_clicked || 'unlimited' === $limit) {
                do_action('gameengine_link_click', $user_id, $token);
                if ('once' === $limit) {
                    update_user_meta($user_id, $meta_key, 1);
                }
            }
        }

        wp_safe_redirect($destination);
        exit;
    }

    private static function get_link_by_token(string $token): ?array
    {
        $links = get_option('gameengine_tracked_links', []);
        foreach ($links as $link) {
            if (isset($link['token']) && $link['token'] === $token) {
                return $link;
            }
        }
        return null;
    }

    // ─── Video-watch ──────────────────────────────────────────────────────────

    public static function register_video_rest_route()
    {
        register_rest_route('gameengine/v1', '/video/watched', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'handle_video_watched'],
            'permission_callback' => 'is_user_logged_in',
            'args'                => [
                'video_id'  => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                'threshold' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            ],
        ]);
    }

    public static function handle_video_watched(\WP_REST_Request $request): \WP_REST_Response
    {
        $user_id   = get_current_user_id();
        $video_id  = $request->get_param('video_id');
        $threshold = $request->get_param('threshold');

        $meta_key   = 'gameengine_video_' . md5($video_id) . '_' . $threshold;
        if (get_user_meta($user_id, $meta_key, true)) {
            return new \WP_REST_Response(['awarded' => false, 'reason' => 'already_awarded'], 200);
        }

        update_user_meta($user_id, $meta_key, 1);
        do_action('gameengine_video_watched', $user_id, $video_id, $threshold);

        return new \WP_REST_Response(['awarded' => true], 200);
    }

    public static function render_video_shortcode(array $atts): string
    {
        $atts = shortcode_atts([
            'url'       => '',
            'type'      => 'youtube', // youtube | vimeo | html5
            'threshold' => '100',
            'width'     => '100%',
            'height'    => '360',
        ], $atts, 'gameengine_video');

        if (empty($atts['url'])) {
            return '';
        }

        $video_id = md5($atts['url']);
        $nonce    = wp_create_nonce('ge_video_watch');

        $embed = '';
        if ('youtube' === $atts['type']) {
            $yt_id  = self::extract_youtube_id($atts['url']);
            $embed  = '<iframe id="ge-video-' . esc_attr($video_id) . '" width="' . esc_attr($atts['width']) . '" height="' . esc_attr($atts['height']) . '" '
                    . 'src="https://www.youtube.com/embed/' . esc_attr($yt_id) . '?enablejsapi=1" frameborder="0" allowfullscreen></iframe>';
        } elseif ('vimeo' === $atts['type']) {
            $vm_id  = self::extract_vimeo_id($atts['url']);
            $embed  = '<iframe id="ge-video-' . esc_attr($video_id) . '" width="' . esc_attr($atts['width']) . '" height="' . esc_attr($atts['height']) . '" '
                    . 'src="https://player.vimeo.com/video/' . esc_attr($vm_id) . '?api=1" frameborder="0" allowfullscreen></iframe>';
        } else {
            $embed = '<video id="ge-video-' . esc_attr($video_id) . '" width="' . esc_attr($atts['width']) . '" height="' . esc_attr($atts['height']) . '" controls>'
                   . '<source src="' . esc_url($atts['url']) . '"></video>';
        }

        return '<div class="ge-video-wrapper" '
             . 'data-video-id="' . esc_attr($video_id) . '" '
             . 'data-threshold="' . esc_attr($atts['threshold']) . '" '
             . 'data-type="' . esc_attr($atts['type']) . '" '
             . 'data-nonce="' . esc_attr($nonce) . '" '
             . 'data-rest-url="' . esc_url(rest_url('gameengine/v1/video/watched')) . '">'
             . $embed
             . '</div>';
    }

    public static function enqueue_video_script()
    {
        if (! is_user_logged_in()) {
            return;
        }
        $asset_path = GAMEENGINE_PATH . 'assets/js/ge-video-tracker.js';
        if (file_exists($asset_path)) {
            wp_enqueue_script(
                'ge-video-tracker',
                GAMEENGINE_URL . 'assets/js/ge-video-tracker.js',
                ['jquery'],
                GAMEENGINE_VERSION,
                true
            );
        }
    }

    private static function extract_youtube_id(string $url): string
    {
        preg_match('/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url, $m);
        return $m[1] ?? '';
    }

    private static function extract_vimeo_id(string $url): string
    {
        preg_match('/vimeo\.com\/(\d+)/', $url, $m);
        return $m[1] ?? '';
    }

    // ─── Birthday cron ────────────────────────────────────────────────────────

    public static function run_birthday_check()
    {
        $today = gmdate('m-d');

        $users = get_users(['fields' => ['ID']]);
        foreach ($users as $user) {
            $birthday = get_user_meta($user->ID, 'gameengine_birthday', true);
            if (empty($birthday)) {
                continue;
            }

            // Stored as MM-DD
            $bday_md = gmdate('m-d', strtotime($birthday));
            if ($bday_md !== $today) {
                continue;
            }

            $year_key = 'gameengine_birthday_awarded_' . gmdate('Y');
            if (get_user_meta($user->ID, $year_key, true)) {
                continue;
            }

            do_action('gameengine_birthday', (int) $user->ID);
            update_user_meta($user->ID, $year_key, 1);
        }
    }

    // ─── Anniversary cron ─────────────────────────────────────────────────────

    public static function run_anniversary_check()
    {
        $today = gmdate('m-d');

        $users = get_users(['fields' => ['ID', 'user_registered']]);
        foreach ($users as $user) {
            $reg_md = gmdate('m-d', strtotime($user->user_registered));
            if ($reg_md !== $today) {
                continue;
            }

            // Don't award on the actual registration date (year 0).
            $reg_year = (int) gmdate('Y', strtotime($user->user_registered));
            if ($reg_year === (int) gmdate('Y')) {
                continue;
            }

            $year_key = 'gameengine_anniversary_awarded_' . gmdate('Y');
            if (get_user_meta($user->ID, $year_key, true)) {
                continue;
            }

            do_action('gameengine_anniversary', (int) $user->ID);
            update_user_meta($user->ID, $year_key, 1);
        }
    }

    // ─── Cron scheduling ──────────────────────────────────────────────────────

    public static function schedule_crons()
    {
        if (! wp_next_scheduled(self::BIRTHDAY_CRON)) {
            wp_schedule_event(strtotime('today midnight'), 'daily', self::BIRTHDAY_CRON);
        }
        if (! wp_next_scheduled(self::ANNIVERSARY_CRON)) {
            wp_schedule_event(strtotime('today midnight'), 'daily', self::ANNIVERSARY_CRON);
        }
    }

    public static function clear_crons()
    {
        foreach ([self::BIRTHDAY_CRON, self::ANNIVERSARY_CRON] as $hook) {
            $ts = wp_next_scheduled($hook);
            if ($ts) {
                wp_unschedule_event($ts, $hook);
            }
        }
    }
}

Init::init();
