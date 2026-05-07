<?php

namespace GameEngine\Addons\ProgressBar;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Progress Bar Addon.
 * Shortcode [gameengine_progress_bar] and REST data endpoint for level/achievement progress.
 */
class Init
{
    const ADDON_SLUG = 'progress_bar';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        add_shortcode('gameengine_progress_bar', [__CLASS__, 'render_shortcode']);
        add_action('rest_api_init', [__CLASS__, 'register_rest_route']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_styles']);

        // Extend the frontend dashboard REST response with progress data.
        add_filter('gameengine_frontend_profile_data', [__CLASS__, 'append_progress_data'], 10, 2);
    }

    // ─── Shortcode ────────────────────────────────────────────────────────────

    public static function render_shortcode(array $atts): string
    {
        $atts = shortcode_atts([
            'point_type'     => '',
            'mode'           => 'level',         // level | achievement
            'achievement_id' => 0,
            'show_label'     => 'true',
            'show_points'    => 'true',
            'color'          => '',
            'height'         => '16',
        ], $atts, 'gameengine_progress_bar');

        if (! is_user_logged_in()) {
            return self::render_bar(0, 0, 'level', '', $atts);
        }

        $user_id = get_current_user_id();
        $mode    = sanitize_key($atts['mode']);

        if ('achievement' === $mode && ! empty($atts['achievement_id'])) {
            return self::render_achievement_bar($user_id, absint($atts['achievement_id']), $atts);
        }

        return self::render_level_bar($user_id, sanitize_key($atts['point_type']), $atts);
    }

    private static function render_level_bar(int $user_id, string $pt_slug, array $atts): string
    {
        global $wpdb;

        $pt_id = (int) $wpdb->get_var($wpdb->prepare( // phpcs:ignore
            "SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s",
            $pt_slug
        ));

        if (! $pt_id) {
            return '';
        }

        $pm      = new \GameEngine\Classes\PointsManager();
        $balance = $pm->get_total($user_id, $pt_id);

        // Find current and next level for this point type.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $levels = $wpdb->get_results($wpdb->prepare(
            "SELECT id, title, min_points, max_points FROM {$wpdb->prefix}gameengine_levels
             WHERE point_type_id = %d AND status = 'publish'
             ORDER BY min_points ASC",
            $pt_id
        ), ARRAY_A);

        $current_level = null;
        $next_level    = null;

        foreach ($levels as $i => $level) {
            if ($balance >= (int) $level['min_points']) {
                $current_level = $level;
                $next_level    = $levels[$i + 1] ?? null;
            }
        }

        if (! $current_level) {
            $next_level    = $levels[0] ?? null;
            $pct           = 0;
            $label         = __('No level yet', 'gameengine');
        } elseif (! $next_level) {
            $pct   = 100;
            $label = $current_level['title'] . ' (' . __('Max Level', 'gameengine') . ')';
        } else {
            $range = max(1, (int) $next_level['min_points'] - (int) $current_level['min_points']);
            $done  = $balance - (int) $current_level['min_points'];
            $pct   = min(100, max(0, (int) round(($done / $range) * 100)));
            $label = sprintf(
                '%s → %s (%d / %d)',
                $current_level['title'],
                $next_level['title'],
                $balance,
                (int) $next_level['min_points']
            );
        }

        return self::render_bar($pct, $balance, 'level', $label, $atts);
    }

    private static function render_achievement_bar(int $user_id, int $achievement_id, array $atts): string
    {
        global $wpdb;

        // Count total requirements for this achievement and user progress.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $total = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = 'achievement' AND reward_id = %d AND is_active = 1",
            $achievement_id
        ));

        if (! $total) {
            return '';
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $done = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_requirement_progress rp
             JOIN {$wpdb->prefix}gameengine_requirements r ON r.id = rp.requirement_id
             WHERE rp.user_id = %d AND r.reward_type = 'achievement' AND r.reward_id = %d AND r.is_active = 1",
            $user_id,
            $achievement_id
        ));

        $pct   = (int) round(($done / $total) * 100);
        $label = sprintf('%d / %d steps', $done, $total);

        return self::render_bar($pct, $done, 'achievement', $label, $atts);
    }

    private static function render_bar(int $pct, int $current, string $mode, string $label, array $atts): string
    {
        $height     = absint($atts['height'] ?: 16);
        $color      = sanitize_hex_color($atts['color'] ?? '') ?: '';
        $show_label = filter_var($atts['show_label'], FILTER_VALIDATE_BOOLEAN);

        $style_bar = $color ? "--ge-bar-color:{$color};" : '';
        $style_bar .= "--ge-bar-height:{$height}px;";

        $out  = '<div class="ge-progress-bar-wrap" style="' . esc_attr($style_bar) . '">';
        $out .= '<div class="ge-progress-bar-track">';
        $out .= '<div class="ge-progress-bar-fill" style="width:' . esc_attr($pct) . '%"></div>';
        $out .= '</div>';

        if ($show_label && $label) {
            $out .= '<span class="ge-progress-bar-label">' . esc_html($label) . '</span>';
        }

        $out .= '</div>';

        return $out;
    }

    // ─── REST endpoint ────────────────────────────────────────────────────────

    public static function register_rest_route()
    {
        register_rest_route('gameengine/v1', '/progress/(?P<point_type>[a-z0-9_-]+)', [
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => [__CLASS__, 'get_progress_data'],
            'permission_callback' => 'is_user_logged_in',
        ]);
    }

    public static function get_progress_data(\WP_REST_Request $request): \WP_REST_Response
    {
        global $wpdb;
        $user_id = get_current_user_id();
        $pt_slug = sanitize_key($request->get_param('point_type'));

        $pt_id = (int) $wpdb->get_var($wpdb->prepare( // phpcs:ignore
            "SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s",
            $pt_slug
        ));

        if (! $pt_id) {
            return new \WP_REST_Response(['error' => 'Invalid point type'], 404);
        }

        $pm      = new \GameEngine\Classes\PointsManager();
        $balance = $pm->get_total($user_id, $pt_id);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $levels = $wpdb->get_results($wpdb->prepare(
            "SELECT id, title, min_points FROM {$wpdb->prefix}gameengine_levels
             WHERE point_type_id = %d AND status = 'publish'
             ORDER BY min_points ASC",
            $pt_id
        ), ARRAY_A);

        $current_level = null;
        $next_level    = null;

        foreach ($levels as $i => $level) {
            if ($balance >= (int) $level['min_points']) {
                $current_level = $level;
                $next_level    = $levels[$i + 1] ?? null;
            }
        }

        $pct = 0;
        if ($current_level && $next_level) {
            $range = max(1, (int) $next_level['min_points'] - (int) $current_level['min_points']);
            $done  = $balance - (int) $current_level['min_points'];
            $pct   = min(100, max(0, (int) round(($done / $range) * 100)));
        } elseif ($current_level && ! $next_level) {
            $pct = 100;
        }

        return new \WP_REST_Response([
            'user_balance'    => $balance,
            'current_level'   => $current_level,
            'next_level'      => $next_level,
            'progress_percent' => $pct,
        ]);
    }

    /** Hook to append progress data to the frontend profile REST response. */
    public static function append_progress_data(array $data, int $user_id): array
    {
        // Caller passes point_type_id; we add progress info.
        return $data; // Extended by REST endpoint; this hook is for future SPA use.
    }

    // ─── Styles ───────────────────────────────────────────────────────────────

    public static function enqueue_styles()
    {
        $css = '
.ge-progress-bar-wrap{margin:8px 0}
.ge-progress-bar-track{background:#e0e0e0;border-radius:4px;overflow:hidden;height:var(--ge-bar-height,16px)}
.ge-progress-bar-fill{background:var(--ge-bar-color,#4c6ef5);height:100%;border-radius:4px;transition:width .4s ease}
.ge-progress-bar-label{font-size:12px;color:#555;margin-top:4px;display:block}
';
        wp_add_inline_style('wp-block-library', $css);
    }
}

Init::init();
