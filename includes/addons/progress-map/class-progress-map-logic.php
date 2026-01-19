<?php

namespace Gamify\Addons\ProgressMap;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Progress_Map_Logic
 * Handles the calculation and rendering of the user journey roadmap.
 */
class Progress_Map_Logic {

	/**
	 * Fetches and merges levels and achievements into a single timeline.
	 *
	 * @param int $user_id The WordPress User ID.
	 * @return array Combined journey data.
	 */
	public static function get_combined_journey( $user_id ) {
		global $wpdb;

		$user_id = absint( $user_id );

		// 1. Fetch all Levels.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$levels = $wpdb->get_results( "SELECT id, title, icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'level' as type, priority FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC", ARRAY_A );

		// 2. Fetch all Achievements.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$achievements = $wpdb->get_results( "SELECT id, title, badge_image as icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'achievement' as type, created_at FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A );

		// 3. Fetch user earned data.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_levels = $wpdb->get_col( $wpdb->prepare( "SELECT level_id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d", $user_id ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_achievements = $wpdb->get_col( $wpdb->prepare( "SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", $user_id ) );

		// 4. Merge and process status.
		$journey  = array_merge( $levels ? $levels : array(), $achievements ? $achievements : array() );
		$unlocked = array();
		$locked   = array();

		if ( ! empty( $journey ) ) {
			foreach ( $journey as $item ) {
				$is_completed   = ( 'level' === $item['type'] ) ? in_array( (string) $item['id'], $user_levels, true ) : in_array( (string) $item['id'], $user_achievements, true );
				$item['status'] = $is_completed ? 'completed' : 'locked';

				if ( $is_completed ) {
					$unlocked[] = $item;
				} else {
					$locked[] = $item;
				}
			}
		}

		return array_merge( $unlocked, $locked );
	}

	/**
	 * Pre-fetches titles for all required dependencies using secure placeholders and caching.
	 *
	 * @param array $journey The combined journey array.
	 * @return array Map of ID to Title.
	 */
	private static function get_dependency_titles( $journey ) {
		global $wpdb;
		$titles = array();

		$ach_ids = array_unique( array_filter( array_map( 'absint', wp_list_pluck( $journey, 'required_achievement_id' ) ) ) );
		$lvl_ids = array_unique( array_filter( array_map( 'absint', wp_list_pluck( $journey, 'required_level_id' ) ) ) );

		// 1. Fetch Achievement Titles.
		if ( ! empty( $ach_ids ) ) {
			$cache_key = 'gf_ach_titles_' . md5( wp_json_encode( $ach_ids ) );
			$results   = wp_cache_get( $cache_key, 'gamify' );

			if ( false === $results ) {
				$placeholders = implode( ',', array_fill( 0, count( $ach_ids ), '%d' ) );
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$results = $wpdb->get_results( $wpdb->prepare( "SELECT id, title FROM {$wpdb->prefix}gamify_achievements WHERE id IN ($placeholders)", $ach_ids ), OBJECT_K );
				wp_cache_set( $cache_key, $results, 'gamify', 300 );
			}

			if ( $results ) {
				foreach ( $results as $id => $row ) {
					$titles[ 'ach_' . $id ] = $row->title;
				}
			}
		}

		// 2. Fetch Level Titles.
		if ( ! empty( $lvl_ids ) ) {
			$cache_key = 'gf_lvl_titles_' . md5( wp_json_encode( $lvl_ids ) );
			$results   = wp_cache_get( $cache_key, 'gamify' );

			if ( false === $results ) {
				$placeholders = implode( ',', array_fill( 0, count( $lvl_ids ), '%d' ) );
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$results = $wpdb->get_results( $wpdb->prepare( "SELECT id, title FROM {$wpdb->prefix}gamify_levels WHERE id IN ($placeholders)", $lvl_ids ), OBJECT_K );
				wp_cache_set( $cache_key, $results, 'gamify', 300 );
			}

			if ( $results ) {
				foreach ( $results as $id => $row ) {
					$titles[ 'lvl_' . $id ] = $row->title;
				}
			}
		}

		return $titles;
	}

	/**
	 * Renders the Roadmap HTML.
	 *
	 * @param int $user_id The User ID.
	 * @return string HTML output.
	 */
	public static function render_html( $user_id ) {
		$journey = self::get_combined_journey( $user_id );
		if ( empty( $journey ) ) {
			return '';
		}

		$dependency_titles = self::get_dependency_titles( $journey );
		$total             = count( $journey );

		ob_start();
		?>
		<div class="gamify-roadmap-v2">
			<div class="gamify-timeline">
				<?php
				foreach ( $journey as $index => $node ) :
					$is_last        = ( $index === $total - 1 );
					$is_completed   = ( 'completed' === $node['status'] );
					$next_completed = ( ! $is_last && 'completed' === $journey[ $index + 1 ]['status'] );

					$line_class = ( $is_completed && $next_completed ) ? 'line-blue' : 'line-gray';
					$side_class = ( 0 === $index % 2 ) ? 'node-left' : 'node-right';
					?>
					<div class="gamify-timeline-node <?php echo esc_attr( $side_class ); ?> <?php echo $is_completed ? 'is-active' : 'is-locked'; ?>">

						<div class="gamify-node-circle"><?php echo esc_html( (int) $index + 1 ); ?></div>

						<?php if ( ! $is_last ) : ?>
							<div class="gamify-connector <?php echo esc_attr( $line_class ); ?>"></div>
						<?php endif; ?>

						<div class="gamify-node-card">
							<div class="gamify-card-inner">
								<div class="gamify-card-media">
									<?php if ( ! empty( $node['icon'] ) ) : ?>
										<img src="<?php echo esc_url( $node['icon'] ); ?>" alt="<?php echo esc_attr( $node['title'] ); ?>">
									<?php else : ?>
										<span class="icon-placeholder"><?php echo ( 'level' === $node['type'] ) ? esc_html__( '🏆', 'gamify' ) : esc_html__( '🏅', 'gamify' ); ?></span>
									<?php endif; ?>
								</div>
								<div class="gamify-card-info">
									<div class="gamify-type-badge <?php echo esc_attr( $node['type'] ); ?>">
										<?php echo esc_html( strtoupper( (string) $node['type'] ) ); ?>
									</div>
									<h5><?php echo esc_html( $node['title'] ); ?></h5>

									<?php if ( $is_completed ) : ?>
										<p class="gf-congrats"><?php echo esc_html( $node['congrats'] ); ?></p>
									<?php else : ?>
										<div class="gf-restriction-info">
											<span class="gf-lock-label">🔒 <?php esc_html_e( 'Locked', 'gamify' ); ?></span>
											
											<?php if ( ! empty( $node['required_achievement_id'] ) && isset( $dependency_titles[ 'ach_' . $node['required_achievement_id'] ] ) ) : ?>
												<p class="gf-dep-hint">
													<strong><?php esc_html_e( 'Prerequisite:', 'gamify' ); ?></strong> 
													<?php echo esc_html( $dependency_titles[ 'ach_' . $node['required_achievement_id'] ] ); ?>
												</p>
											<?php endif; ?>

											<?php if ( ! empty( $node['required_level_id'] ) && isset( $dependency_titles[ 'lvl_' . $node['required_level_id'] ] ) ) : ?>
												<p class="gf-dep-hint">
													<strong><?php esc_html_e( 'Requires Level:', 'gamify' ); ?></strong> 
													<?php echo esc_html( $dependency_titles[ 'lvl_' . $node['required_level_id'] ] ); ?>
												</p>
											<?php endif; ?>

											<p class="gf-lock-msg">
												<?php echo ! empty( $node['restriction_message'] ) ? esc_html( $node['restriction_message'] ) : esc_html__( 'Complete pre-requisites to unlock.', 'gamify' ); ?>
											</p>
										</div>
									<?php endif; ?>
								</div>
							</div>
						</div>

					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}