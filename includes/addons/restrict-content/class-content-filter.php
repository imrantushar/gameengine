<?php

namespace Gamify\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Content_Filter
 * Intercepts content to apply restrictions.
 */
class Content_Filter
{

    public static function init()
    {
        add_filter('the_content', array(__CLASS__, 'apply_restriction'), 1);
    }

    public static function apply_restriction($content)
    {
        if (! is_singular(array('post', 'page'))) {
            return $content;
        }

        $post_id = get_the_ID();
        if (! $post_id) {
            return $content;
        }

        $type       = get_post_meta($post_id, '_gamify_restrict_type', true);
        $required_v = get_post_meta($post_id, '_gamify_restrict_value', true);
        $lock_msg   = get_post_meta($post_id, '_gamify_restrict_message', true);
        $only_media = get_post_meta($post_id, '_gamify_lock_media', true);

        if (empty($type) || 'none' === $type) {
            return $content;
        }

        $has_access = Restriction_Helper::can_access($type, $required_v);

        if (false === $has_access) {
            // Logic for "Lock Media Only"
            if ('1' === (string) $only_media) {
                $locked_ui = Restriction_Helper::get_locked_ui(__('Media Hidden', 'gamify'));
                // Regex to replace images.
                $content = preg_replace('/<img[^>]+>/i', $locked_ui, $content);
                // Regex to replace anchor tags content or hide links.
                $content = preg_replace('/<a\b[^>]*>(.*?)<\/a>/i', '$1 (' . esc_html__('Link Hidden', 'gamify') . ')', $content);
                return $content;
            }

            // Fully lock the post content.
            return Restriction_Helper::get_locked_ui($lock_msg);
        }

        return $content;
    }
}
