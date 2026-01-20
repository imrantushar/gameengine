<?php

namespace Gamify\Addons\RestrictUnlock;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Restriction_Engine
 * Logic engine to handle prerequisites for achievements and levels.
 */
class Restriction_Engine {

	/**
	 * Initialize the addon hooks.
	 */
	public static function init() {
		// Intercept reward delivery in the core engine.
		add_filter( 'gamify_can_user_unlock_reward', array( __CLASS__, 'check_dependencies' ), 10, 3 );
	}

	/**
	 * Checks if the user is allowed to earn the reward based on dependencies.
	 *
	 * @param bool   $can_unlock Current status.
	 * @param int    $user_id    Target User ID.
	 * @param object $rule       The rule being processed.
	 * @return bool
	 */
	public static function check_dependencies( $can_unlock, $user_id, $rule ) {
		global $wpdb;

		$reward_id = absint( $rule->reward_id );
		$user_id   = absint( $user_id );

		if ( 'achievement' !== $rule->reward_type && 'level' !== $rule->reward_type ) {
			return $can_unlock;
		}

		//  Caching Strategy to avoid redundant DB calls.
		$cache_key = "gamify_item_restrict_{$rule->reward_type}_{$reward_id}";
		$item      = wp_cache_get( $cache_key, 'gamify' );

		if ( false === $item ) {
			// Determine table literally to avoid InterpolatedNotPrepared warning.
			if ( 'achievement' === $rule->reward_type ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$item = $wpdb->get_row( $wpdb->prepare( "SELECT required_achievement_id, required_level_id FROM {$wpdb->prefix}gamify_achievements WHERE id = %d", $reward_id ) );
			} else {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$item = $wpdb->get_row( $wpdb->prepare( "SELECT required_achievement_id, required_level_id FROM {$wpdb->prefix}gamify_levels WHERE id = %d", $reward_id ) );
			}
			wp_cache_set( $cache_key, $item, 'gamify', 300 );
		}

		if ( ! $item ) {
			return $can_unlock;
		}

		// Check Achievement dependency.
		if ( ! empty( $item->required_achievement_id ) ) {
			$req_ach_id = absint( $item->required_achievement_id );
			$ach_cache_key = "gamify_user_has_ach_{$user_id}_{$req_ach_id}";
			
			$has_req_ach = wp_cache_get( $ach_cache_key, 'gamify' );
			if ( false === $has_req_ach ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$has_req_ach = (bool) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d AND achievement_id = %d", $user_id, $req_ach_id ) );
				wp_cache_set( $ach_cache_key, $has_req_ach, 'gamify', 60 );
			}
			
			if ( ! $has_req_ach ) {
				return false;
			}
		}

		//  Check Level dependency.
		if ( ! empty( $item->required_level_id ) ) {
			$req_lvl_id = absint( $item->required_level_id );
			$lvl_cache_key = "gamify_user_has_lvl_{$user_id}_{$req_lvl_id}";

			$has_req_lvl = wp_cache_get( $lvl_cache_key, 'gamify' );
			if ( false === $has_req_lvl ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$has_req_lvl = (bool) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d AND level_id = %d", $user_id, $req_lvl_id ) );
				wp_cache_set( $lvl_cache_key, $has_req_lvl, 'gamify', 60 );
			}

			if ( ! $has_req_lvl ) {
				return false;
			}
		}

		return $can_unlock;
	}
}