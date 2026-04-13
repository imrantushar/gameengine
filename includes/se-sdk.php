<?php
/**
 * License SDK initializer.
 *
 * @version 1.0.0
 * @since GameEngine\Pro 1.0.0
 */

namespace GameEngine;

use SE_License_SDK_Client;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SeSdk {
	private static ?SeSdk $instance = null;

	private static ?SE_License_SDK_Client $sdk_client = null;

	public static function get_instance(): SeSdk {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	protected function __construct() {
		if ( ! did_action( 'plugins_loaded' ) ) {
			add_action( 'plugins_loaded', [ $this, 'get_sdk' ] );
		} else {
			$this->get_sdk();
		}
	}

	public function get_sdk(): SE_License_SDK_Client {
		if ( null === self::$sdk_client ) {
			self::$sdk_client = se_license_init( [
				'package_file'         => GAMEENGINE_FILE,
				'package_name'         => 'GameEngine', // translation remove due to load too early
				'product_id'           => 254,
				'is_free'              => true,
				'use_update'           => true,
				'slug'                 => 'gameengine',
				'basename'             => GAMEENGINE_BASENAME,
				'package_type'         => 'plugin',
				'package_version'      => GAMEENGINE_VERSION,
				'allow_local'          => true,
				'license_server'       => 'https://store.kodezen.com/',
				'purchase_url'         => 'https://store.kodezen.com/product/gemcrm/',
				'product_logo'         => defined( 'GAMEENGINE_URL' ) ? GAMEENGINE_URL . 'assets/images/logo.svg' : '',
				'store_dashboard_url'  => 'https://store.kodezen.com/dashboard/license-keys/',
				'terms_url'            => 'https://kodezen.com/terms-and-conditions/',
				'privacy_policy_url'   => 'https://store.kodezen.com/privacy-policy/',
				'ticket_recipient'     => 'support@kodezen.com',
				'primary_color'        => '#006BFF',
				'first_install_time'   => strtotime( '-4 days' ), //get_option( 'gameengine_first_install_time' ),
				'optin_notice_delay'   => 3 * DAY_IN_SECONDS,
				'data_being_collected' => [
					'addons'       => 'List of active addons',
					'levels'       => 'Number of levels configured',
					'achievements' => 'Number of achievements configured',
					'point_types'  => 'Number of point-system configured',
					'leaderboard'  => 'Number of leaderboards',
				],
			] );

			add_filter( self::$sdk_client->getHookName( 'tracker_data' ), function ( $data ) {
				$data['addons']       = get_option( 'gameengine_active_addons', [] );
				$data['levels']       = self::get_count_by_status( 'levels' );
				$data['achievements'] = self::get_count_by_status( 'achievements' );
				$data['point_types']  = self::get_count_by_status( 'point_types' );
				$data['leaderboard']  = self::get_count_by_status( 'user_achievements', true );
				$data['users']  = self::get_count_by_status( 'user_achievements', true );

				return $data;
			} );
		}

		return self::$sdk_client;
	}

	protected static function get_count_by_status( $table, bool $count_all = false ) {
		global $wpdb;

		if ( $count_all ) {
			return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_{$table};" );
		}

		$counts = $wpdb->get_results( "SELECT status, COUNT(*) total FROM {$wpdb->prefix}gameengine_{$table} GROUP BY status;" );
		$data   = [];

		foreach ( $counts as $count ) {
			$data[ $count->status ] = (int) $count->total;
		}

		return $data;
	}
}

// End of file se-sdk.php.
