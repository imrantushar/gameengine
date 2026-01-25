<?php

namespace Gamify\Pro;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Class Pro_Logic_Handler
 * Handles advanced validation and point calculation for Pro features.
 */
class Pro_Logic_Handler
{

	/**
	 * Initialize the Pro filters.
	 */
	public static function init()
	{
		//  Validation Logic (Returns true/false).
		add_filter('gamify_validate_pro_logic', array(__CLASS__, 'validate_pro_features'), 10, 4);

		// Point Calculation Logic (Modifies point amount).
		add_filter('gamify_pro_point_amount', array(__CLASS__, 'calculate_pro_points'), 10, 4);
	}

	/**
	 * Validates all Pro conditions based on the feature table.
	 *
	 * @param bool   $is_valid    Current validity.
	 * @param string $trigger_key The trigger identifier.
	 * @param array  $params      Rule parameters.
	 * @param array  $hook_args   Original hook arguments.
	 * @return bool
	 */
	public static function validate_pro_features($is_valid, $trigger_key, $params, $hook_args)
	{
		// If already invalid by another filter, return early.
		if (! $is_valid) {
			return false;
		}

		// --- WordPress Core Logic ---

		// Publish Post/Page Validations.
		if ('publish_post' === $trigger_key || 'publish_page' === $trigger_key) {
			$post = get_post($hook_args[0]);
			if (! $post) {
				return false;
			}

			// Check Post Type Selection (Pro).
			if (! empty($params['post_types']) && ! in_array($post->post_type, (array) $params['post_types'], true)) {
				return false;
			}

			// Min Word Count Check (Pro).
			if ('publish_post' === $trigger_key && ! empty($params['min_words'])) {
				/**
				 *  wp_strip_all_tags() as per WP standards.
				 */
				$word_count = str_word_count(wp_strip_all_tags($post->post_content));
				if ($word_count < intval($params['min_words'])) {
					return false;
				}
			}

			// Min Media Count Check (Pro).
			if ('publish_page' === $trigger_key && ! empty($params['min_media'])) {
				$attachments = get_attached_media('image', $post->ID);
				if (count($attachments) < intval($params['min_media'])) {
					return false;
				}
			}
		}

		// Post Comment Logic.
		if ('comment_post' === $trigger_key) {
			$comment = get_comment($hook_args[0]);
			if (! $comment) {
				return false;
			}

			// Min Character Count (Pro).
			if (! empty($params['min_chars']) && strlen($comment->comment_content) < intval($params['min_chars'])) {
				return false;
			}

			// Approval Logic: Approval Required unless Instant Reward is enabled.
			if (empty($params['instant_reward']) && '1' !== $comment->comment_approved) {
				return false;
			}
		}

		// Delete Post Logic.
		if ('delete_post' === $trigger_key && ! empty($params['age_check'])) {
			$post      = get_post($hook_args[0]);
			$post_date = strtotime($post->post_date);
			$days_old  = (time() - $post_date) / DAY_IN_SECONDS;
			// Only deduct if post is younger than X days.
			if ($days_old > intval($params['age_check'])) {
				return false;
			}
		}

		// Role Change: Multiple Roles Support.
		if ('user_role_change' === $trigger_key && ! empty($params['role'])) {
			$new_role = $hook_args[1];
			if (! in_array($new_role, (array) $params['role'], true)) {
				return false;
			}
		}

		// Password Reset Cooldown.
		if ('after_password_reset' === $trigger_key && ! empty($params['cooldown'])) {
			$user_id    = $hook_args[0]->ID;
			$last_reset = get_user_meta($user_id, '_gamify_last_password_reset', true);
			if ($last_reset && (time() - $last_reset) < (intval($params['cooldown']) * DAY_IN_SECONDS)) {
				return false;
			}
			update_user_meta($user_id, '_gamify_last_password_reset', time());
		}

		// --- Interactions Logic ---

		// Specific Post: Category Filter.
		if ('visit_specific_post' === $trigger_key && ! empty($params['categories'])) {
			$post_id = $hook_args[1];
			if (! has_category((array) $params['categories'], $post_id)) {
				return false;
			}
		}

		// Author Reply: Min length.
		if ('author_comment_reply' === $trigger_key && ! empty($params['min_reply_len'])) {
			$comment = get_comment($hook_args[0]);
			if (strlen($comment->comment_content) < intval($params['min_reply_len'])) {
				return false;
			}
		}

		// --- WooCommerce Logic ---

		if (strpos($trigger_key, 'woocommerce') !== false) {
			$order = wc_get_order($hook_args[0]);
			if (! $order) {
				return false;
			}

			// Minimum Spend Check.
			if (! empty($params['min_spend']) && $order->get_total() < floatval($params['min_spend'])) {
				return false;
			}

			// First Purchase Only.
			if (! empty($params['first_purchase'])) {
				if (wc_get_customer_order_count($order->get_user_id()) > 1) {
					return false;
				}
			}

			// Purchase Specific Product: Category Check.
			if ('woocommerce_purchase_specific_product' === $trigger_key && ! empty($params['categories'])) {
				$found = false;
				foreach ($order->get_items() as $item) {
					if (has_term((array) $params['categories'], 'product_cat', $item->get_product_id())) {
						$found = true;
						break;
					}
				}
				if (! $found) {
					return false;
				}
			}
		}

		return $is_valid;
	}

	/**
	 * Modifies the points based on Pro settings (Percentages, Multipliers, etc.).
	 *
	 * @param int    $points    Original points.
	 * @param object $rule      The current rule.
	 * @param array  $params    Rule parameters.
	 * @param array  $hook_args Original hook arguments.
	 * @return int|float
	 */
	public static function calculate_pro_points($points, $rule, $params, $hook_args)
	{
		// WooCommerce: Percent of Order Total.
		if ('woocommerce_new_purchase' === $rule->trigger_key && isset($params['calc_type']) && 'percent' === $params['calc_type']) {
			$order = wc_get_order($hook_args[0]);
			if ($order) {
				$percent = floatval($params['points']);
				$points  = ($order->get_total() * $percent) / 100;
			}
		}

		// WooCommerce: Quantity Based Multiplier.
		if ('woocommerce_purchase_specific_product' === $rule->trigger_key && ! empty($params['qty_multiplier'])) {
			$order      = wc_get_order($hook_args[0]);
			$item_count = $order->get_item_count();
			$points     = $points * $item_count;
		}

		// Interactions: Daily Visit Multiplier.
		if ('daily_visit_website' === $rule->trigger_key && ! empty($params['multiplier'])) {
			$points = $points * intval($params['multiplier']);
		}

		return $points;
	}
}
