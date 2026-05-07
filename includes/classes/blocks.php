<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Gutenberg block registration for GameEngine.
 *
 * Registers the "gameengine" block category and all dynamic blocks.
 * Each block delegates rendering to the corresponding shortcode handler
 * or REST endpoint so there is a single source of truth for output.
 */
class Blocks
{
    public static function init()
    {
        add_filter('block_categories_all', [__CLASS__, 'register_category'], 10, 2);
        add_action('init', [__CLASS__, 'register_blocks']);
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueue_block_editor_script']);
    }

    public static function register_category(array $categories): array
    {
        array_unshift($categories, [
            'slug'  => 'gameengine',
            'title' => __('GameEngine', 'gameengine'),
            'icon'  => null,
        ]);
        return $categories;
    }

    public static function register_blocks()
    {
        $blocks = [
            'leaderboard'   => [__CLASS__, 'render_leaderboard'],
            'points-balance'=> [__CLASS__, 'render_points_balance'],
            'achievements'  => [__CLASS__, 'render_achievements'],
            'levels'        => [__CLASS__, 'render_levels'],
            'profile'       => [__CLASS__, 'render_profile'],
            'progress-map'  => [__CLASS__, 'render_progress_map'],
            'point-history' => [__CLASS__, 'render_point_history'],
            'progress-bar'  => [__CLASS__, 'render_progress_bar'],
        ];

        foreach ($blocks as $name => $callback) {
            register_block_type(
                'gameengine/' . $name,
                ['render_callback' => $callback]
            );
        }
    }

    public static function enqueue_block_editor_script()
    {
        $versioned = 'blocks.' . GAMEENGINE_VERSION;
        $asset_path = GAMEENGINE_PATH . 'assets/build/' . $versioned . '.asset.php';

        if (! file_exists($asset_path)) {
            return;
        }

        $asset = require $asset_path;

        wp_enqueue_script(
            'gameengine-blocks',
            GAMEENGINE_URL . 'assets/build/' . $versioned . '.js',
            $asset['dependencies'],
            $asset['version'],
            false
        );

        wp_set_script_translations('gameengine-blocks', 'gameengine', GAMEENGINE_PATH . 'languages/');
    }

    // ── Render callbacks ───────────────────────────────────────────────────

    public static function render_leaderboard(array $atts): string
    {
        $count      = isset($atts['count'])      ? (int)    $atts['count']      : 10;
        $point_type = isset($atts['point_type']) ? sanitize_text_field($atts['point_type']) : '';
        $time_range = isset($atts['time_range']) ? sanitize_text_field($atts['time_range']) : 'all_time';

        $shortcode = sprintf(
            '[gameengine_leaderboard count="%d" point_type="%s" time_range="%s"]',
            $count,
            esc_attr($point_type),
            esc_attr($time_range)
        );
        return do_shortcode($shortcode);
    }

    public static function render_points_balance(array $atts): string
    {
        $point_type    = isset($atts['point_type'])    ? sanitize_text_field($atts['point_type']) : '';
        $show_icon     = ! empty($atts['show_icon'])   ? 'true' : 'false';
        $guest_message = isset($atts['guest_message']) ? sanitize_text_field($atts['guest_message']) : '';

        if ($guest_message === '' && ! is_user_logged_in()) {
            return '';
        }

        $shortcode = sprintf(
            '[gameengine_points point_type="%s"]',
            esc_attr($point_type)
        );
        return do_shortcode($shortcode);
    }

    public static function render_achievements(array $atts): string
    {
        return do_shortcode('[gameengine_achievements]');
    }

    public static function render_levels(array $atts): string
    {
        $point_type_id = isset($atts['point_type_id']) ? (int) $atts['point_type_id'] : 0;
        $shortcode = sprintf(
            '[gameengine_level point_type_id="%d"]',
            $point_type_id
        );
        return do_shortcode($shortcode);
    }

    public static function render_profile(array $atts): string
    {
        return do_shortcode('[gameengine_profile]');
    }

    public static function render_progress_map(array $atts): string
    {
        return do_shortcode('[gameengine_progress_map]');
    }

    public static function render_point_history(array $atts): string
    {
        $per_page = isset($atts['per_page']) ? (int) $atts['per_page'] : 10;
        $shortcode = sprintf('[gameengine_point_history per_page="%d"]', $per_page);
        return do_shortcode($shortcode);
    }

    public static function render_progress_bar(array $atts): string
    {
        $point_type     = isset($atts['point_type'])     ? sanitize_text_field($atts['point_type'])     : '';
        $mode           = isset($atts['mode'])           ? sanitize_text_field($atts['mode'])           : 'level';
        $achievement_id = isset($atts['achievement_id']) ? (int) $atts['achievement_id']                : 0;
        $color          = isset($atts['color'])          ? sanitize_hex_color($atts['color']) ?? '#4f46e5' : '#4f46e5';
        $height         = isset($atts['height'])         ? (int) $atts['height']                        : 12;

        $shortcode = sprintf(
            '[gameengine_progress_bar point_type="%s" mode="%s" achievement_id="%d" color="%s" height="%d"]',
            esc_attr($point_type),
            esc_attr($mode),
            $achievement_id,
            esc_attr($color),
            $height
        );
        return do_shortcode($shortcode);
    }
}
