<?php

namespace Gamify\Pro;

if (!defined('ABSPATH')) exit;

class Pro_Logic_Handler
{
    public static function init()
    {
        // 1. Validation Logic (Returns true/false)
        add_filter('gamify_validate_pro_logic', [__CLASS__, 'validate_pro_features'], 10, 4);

        // 2. Point Calculation Logic (Modifies point amount)
        add_filter('gamify_pro_point_amount', [__CLASS__, 'calculate_pro_points'], 10, 4);
    }

    /**
     * Validates all Pro conditions based on the feature table.
     */
    public static function validate_pro_features($is_valid, $trigger_key, $params, $hook_args)
    {
        // If already invalid by another filter, return early
        if (!$is_valid) return false;

        // --- WordPress Core Logic ---

        // Publish Post/Page Validations
        if ($trigger_key === 'publish_post' || $trigger_key === 'publish_page') {
            $post = get_post($hook_args[0]);
            if (!$post) return false;

            // Check Post Type Selection (Pro)
            if (!empty($params['post_types']) && !in_array($post->post_type, (array)$params['post_types'])) return false;

            // Min Word Count Check (Pro)
            if ($trigger_key === 'publish_post' && !empty($params['min_words'])) {
                $word_count = str_word_count(strip_tags($post->post_content));
                if ($word_count < intval($params['min_words'])) return false;
            }

            // Min Media Count Check (Pro)
            if ($trigger_key === 'publish_page' && !empty($params['min_media'])) {
                $attachments = get_attached_media('image', $post->ID);
                if (count($attachments) < intval($params['min_media'])) return false;
            }
        }

        // Post Comment Logic
        if ($trigger_key === 'comment_post') {
            $comment = get_comment($hook_args[0]);
            if (!$comment) return false;

            // Min Character Count (Pro)
            if (!empty($params['min_chars']) && strlen($comment->comment_content) < intval($params['min_chars'])) return false;

            // Approval Logic: Approval Required unless Instant Reward is enabled
            if (empty($params['instant_reward']) && $comment->comment_approved !== '1') return false;
        }

        // Delete Post Logic
        if ($trigger_key === 'delete_post' && !empty($params['age_check'])) {
            $post = get_post($hook_args[0]);
            $post_date = strtotime($post->post_date);
            $days_old = (time() - $post_date) / DAY_IN_SECONDS;
            // Only deduct if post is younger than X days
            if ($days_old > intval($params['age_check'])) return false;
        }

        // Role Change: Multiple Roles Support
        if ($trigger_key === 'user_role_change' && !empty($params['role'])) {
            $new_role = $hook_args[1];
            if (!in_array($new_role, (array)$params['role'])) return false;
        }

        // Password Reset Cooldown
        if ($trigger_key === 'after_password_reset' && !empty($params['cooldown'])) {
            $user_id = $hook_args[0]->ID;
            $last_reset = get_user_meta($user_id, '_gamify_last_password_reset', true);
            if ($last_reset && (time() - $last_reset) < (intval($params['cooldown']) * DAY_IN_SECONDS)) return false;
            update_user_meta($user_id, '_gamify_last_password_reset', time());
        }

        // --- Interactions Logic ---

        // Daily Visit Min Stay Duration
        if ($trigger_key === 'daily_visit_website' && !empty($params['min_stay'])) {
            // Simplified check: usually requires session/cookie tracking
            // Implementing a placeholder for stay duration validation
        }

        // Specific Post: Category Filter
        if ($trigger_key === 'visit_specific_post' && !empty($params['categories'])) {
            $post_id = $hook_args[1];
            if (!has_category((array)$params['categories'], $post_id)) return false;
        }

        // Author Reply: Min length
        if ($trigger_key === 'author_comment_reply' && !empty($params['min_reply_len'])) {
            $comment = get_comment($hook_args[0]);
            if (strlen($comment->comment_content) < intval($params['min_reply_len'])) return false;
        }

        // --- WooCommerce Logic ---

        if (strpos($trigger_key, 'woocommerce') !== false) {
            $order = wc_get_order($hook_args[0]);
            if (!$order) return false;

            // Minimum Spend Check
            if (!empty($params['min_spend']) && $order->get_total() < floatval($params['min_spend'])) return false;

            // First Purchase Only
            if (!empty($params['first_purchase'])) {
                if (wc_get_customer_order_count($order->get_user_id()) > 1) return false;
            }

            // Purchase Specific Product: Category Check
            if ($trigger_key === 'woocommerce_purchase_specific_product' && !empty($params['categories'])) {
                $found = false;
                foreach ($order->get_items() as $item) {
                    if (has_term((array)$params['categories'], 'product_cat', $item->get_product_id())) {
                        $found = true;
                        break;
                    }
                }
                if (!$found) return false;
            }
        }

        return $is_valid;
    }

    /**
     * Modifies the points based on Pro settings (Percentages, Multipliers, etc.)
     */
    public static function calculate_pro_points($points, $rule, $params, $hook_args)
    {
        // WooCommerce: Percent of Order Total
        if ($rule->trigger_key === 'woocommerce_new_purchase' && isset($params['calc_type']) && $params['calc_type'] === 'percent') {
            $order = wc_get_order($hook_args[0]);
            if ($order) {
                $percent = floatval($params['points']);
                $points = ($order->get_total() * $percent) / 100;
            }
        }

        // WooCommerce: Quantity Based Multiplier
        if ($rule->trigger_key === 'woocommerce_purchase_specific_product' && !empty($params['qty_multiplier'])) {
            $order = wc_get_order($hook_args[0]);
            $item_count = $order->get_item_count();
            $points = $points * $item_count;
        }

        // Interactions: Daily Visit Multiplier
        if ($rule->trigger_key === 'daily_visit_website' && !empty($params['multiplier'])) {
            $points = $points * intval($params['multiplier']);
        }

        return $points;
    }
}
