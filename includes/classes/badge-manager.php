<?php

namespace GameEngine\Classes;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manages the ge_badge custom post type used by the Badge Editor.
 */
class BadgeManager
{

    public static function init()
    {
        $self = new self();
        add_action('init', array($self, 'register_post_type'));
    }

    public function register_post_type()
    {
        register_post_type(
            'ge_badge',
            array(
                'labels'              => array(
                    'name'          => __('Badges', 'gameengine'),
                    'singular_name' => __('Badge', 'gameengine'),
                ),
                'public'              => false,
                'show_ui'             => false,
                'show_in_nav_menus'   => false,
                'show_in_admin_bar'   => false,
                'show_in_rest'        => false,
                'supports'            => array('title', 'custom-fields'),
                'capability_type'     => 'post',
                'has_archive'         => false,
                'rewrite'             => false,
                'query_var'           => false,
            )
        );
    }

    /**
     * Get all badges.
     */
    public static function get_all(int $per_page = 50, int $page = 1): array
    {
        $posts = get_posts(array(
            'post_type'      => 'ge_badge',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
        ));

        return array_map(array(__CLASS__, 'format_badge'), $posts);
    }

    /**
     * Get badge count.
     */
    public static function get_count(): int
    {
        $counts = wp_count_posts('ge_badge');
        return (int) ($counts->publish ?? 0);
    }

    /**
     * Create a badge post.
     */
    public static function create(array $data): int
    {
        $post_id = wp_insert_post(array(
            'post_type'   => 'ge_badge',
            'post_title'  => sanitize_text_field($data['title'] ?? ''),
            'post_status' => 'publish',
        ));

        if (is_wp_error($post_id)) {
            return 0;
        }

        self::save_meta($post_id, $data);
        return $post_id;
    }

    /**
     * Update a badge post.
     */
    public static function update(int $id, array $data): bool
    {
        $result = wp_update_post(array(
            'ID'         => $id,
            'post_title' => sanitize_text_field($data['title'] ?? ''),
        ));

        if (is_wp_error($result)) {
            return false;
        }

        self::save_meta($id, $data);
        return true;
    }

    /**
     * Delete a badge post.
     */
    public static function delete(int $id): bool
    {
        return (bool) wp_delete_post($id, true);
    }

    /**
     * Get a single badge by ID.
     */
    public static function get_by_id(int $id): ?array
    {
        $post = get_post($id);
        if (!$post || $post->post_type !== 'ge_badge') {
            return null;
        }
        return self::format_badge($post);
    }

    private static function save_meta(int $post_id, array $data): void
    {
        if (isset($data['icon'])) {
            update_post_meta($post_id, '_ge_badge_icon', sanitize_text_field($data['icon']));
        }
        if (isset($data['color'])) {
            update_post_meta($post_id, '_ge_badge_color', sanitize_hex_color($data['color']) ?? '#6366f1');
        }
        if (isset($data['icon_type'])) {
            update_post_meta($post_id, '_ge_badge_icon_type', sanitize_key($data['icon_type']));
        }
        if (isset($data['shape'])) {
            $allowed_shapes = array('circle', 'square', 'shield');
            $shape = in_array($data['shape'], $allowed_shapes, true) ? $data['shape'] : 'circle';
            update_post_meta($post_id, '_ge_badge_shape', $shape);
        }
        if (isset($data['border_color'])) {
            update_post_meta($post_id, '_ge_badge_border_color', sanitize_hex_color($data['border_color']) ?? '#ffffff');
        }
        if (isset($data['text_color'])) {
            update_post_meta($post_id, '_ge_badge_text_color', sanitize_hex_color($data['text_color']) ?? '#ffffff');
        }
    }

    private static function format_badge(\WP_Post $post): array
    {
        return array(
            'id'           => $post->ID,
            'title'        => $post->post_title,
            'icon'         => get_post_meta($post->ID, '_ge_badge_icon', true),
            'color'        => get_post_meta($post->ID, '_ge_badge_color', true) ?: '#6366f1',
            'icon_type'    => get_post_meta($post->ID, '_ge_badge_icon_type', true) ?: 'dashicon',
            'shape'        => get_post_meta($post->ID, '_ge_badge_shape', true) ?: 'circle',
            'border_color' => get_post_meta($post->ID, '_ge_badge_border_color', true) ?: '#ffffff',
            'text_color'   => get_post_meta($post->ID, '_ge_badge_text_color', true) ?: '#ffffff',
        );
    }
}
