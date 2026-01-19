<?php

namespace Gamify\Pro;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Time_Based_Rewards
 * Handles time-specific reward logic for Pro users.
 */
class Time_Based_Rewards {

	/**
	 * Initialize the filter hooks.
	 */
	public static function init() {
		add_filter( 'gamify_check_timing_validity', array( __CLASS__, 'validate_timing' ), 10, 2 );
	}

	/**
	 * Validates if the reward should be given based on time and day.
	 *
	 * @param bool  $is_valid Current validity status.
	 * @param array $params   Trigger parameters.
	 * @return bool
	 */
	public static function validate_timing( $is_valid, $params ) {

		//  Validate Active Days.
		if ( ! empty( $params['active_days'] ) ) {
			$active_days = (array) $params['active_days'];
			$today       = strtolower( current_time( 'D' ) ); // Returns mon, tue, etc.
			if ( ! in_array( $today, $active_days, true ) ) {
				return false;
			}
		}

		//  Validate Happy Hours (Time Range).
		if ( ! empty( $params['start_time'] ) && ! empty( $params['end_time'] ) ) {
			$current_time = current_time( 'H:i' );

			/**
			 * We use gmdate() instead of date() as per WordPress standards
			 * to avoid runtime timezone change issues.
			 */
			$start = gmdate( 'H:i', strtotime( $params['start_time'] ) );
			$end   = gmdate( 'H:i', strtotime( $params['end_time'] ) );

			if ( $current_time < $start || $current_time > $end ) {
				return false;
			}
		}

		return $is_valid;
	}
}