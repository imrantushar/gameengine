<?php

namespace Gamify\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\LevelsManager;

/**
 * Class Shortcodes
 * Handles frontend display via modern styled WordPress shortcodes.
 */
class Shortcodes {

	/**
	 * Initialize Shortcodes.
	 */
	public static function init() {
		$self = new self();
		add_shortcode( 'gamify_profile', array( $self, 'render_profile' ) );
		add_shortcode( 'gamify_points', array( $self, 'render_points' ) );
		add_shortcode( 'gamify_achievements', array( $self, 'render_achievements' ) );
		add_shortcode( 'gamify_level', array( $self, 'render_level' ) );
		add_shortcode( 'gamify_progress_map', array( $self, 'render_progress_map' ) );
	}

	/**
	 * [gamify_profile] - Full modern dashboard.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string HTML Output.
	 */
	public function render_profile( $atts ) {
		if ( ! is_user_logged_in() ) {
			return sprintf( '<p class="gf-login-msg">%s</p>', esc_html__( 'Please log in to view your progress.', 'gamify' ) );
		}

		$user_id   = get_current_user_id();
		$user_data = get_userdata( $user_id );

		if ( ! $user_data ) {
			return '';
		}

		$points_manager = new PointsManager();
		$points         = $points_manager->get_grand_total( $user_id );

		ob_start();
		?>
		<div class="gamify-dashboard-v3">
			<!-- Header -->
			<div class="gamify-v3-header">
				<div class="gamify-v3-user">
					<?php echo wp_kses_post( get_avatar( $user_id, 60 ) ); ?>
					<div class="gamify-v3-user-info">
						<h3><?php echo esc_html( $user_data->display_name ); ?></h3>
						<span class="gamify-v3-points-tag">🪙 <?php echo esc_html( number_format_i18n( $points ) ); ?> <?php esc_html_e( 'Points', 'gamify' ); ?></span>
					</div>
				</div>
				<div class="gamify-v3-actions">
					<div class="gamify-notification-bell" title="<?php echo esc_attr__( 'Notifications', 'gamify' ); ?>">
						<span>🔔</span>
						<span class="noti-dot"></span>
					</div>
				</div>
			</div>

			<div class="gamify-v3-main">
				<!-- Sidebar -->
				<div class="gamify-v3-sidebar">
					<button class="gamify-tab-btn active" data-tab="progress-map">
						<span class="icon">🗺️</span> <?php esc_html_e( 'Progress Map', 'gamify' ); ?>
					</button>
					<button class="gamify-tab-btn" data-tab="achievements">
						<span class="icon">🏅</span> <?php esc_html_e( 'Achievements', 'gamify' ); ?>
					</button>
					<button class="gamify-tab-btn" data-tab="levels">
						<span class="icon">🏆</span> <?php esc_html_e( 'Levels', 'gamify' ); ?>
					</button>
				</div>

				<!-- Content -->
				<div class="gamify-v3-content">
					<!-- Tab: Progress Map -->
					<div class="gamify-tab-content active" id="progress-map">
						<?php
						if ( class_exists( '\Gamify\Addons\ProgressMap\Progress_Map_Logic' ) ) {
							echo \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html( $user_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}
						?>
					</div>

					<!-- Tab: Achievements -->
					<div class="gamify-tab-content" id="achievements">
						<h4><?php esc_html_e( 'Badges & Achievements', 'gamify' ); ?></h4>
						<?php echo $this->render_achievements(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</div>

					<!-- Tab: Levels -->
					<div class="gamify-tab-content" id="levels">
						<h4><?php esc_html_e( 'Your Progression', 'gamify' ); ?></h4>
						<?php
						$lvl_manager = new LevelsManager();
						$user_lvls   = $lvl_manager->get_all_user_levels( $user_id );
						?>
						<div class="gamify-level-list">
							<?php if ( ! empty( $user_lvls ) ) : ?>
								<?php foreach ( $user_lvls as $lvl ) : ?>
									<div class="gamify-level-item">
										<span class="lvl-icon">🏆</span>
										<span class="lvl-name"><?php echo esc_html( $lvl->title ); ?></span>
										<span class="lvl-date"><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $lvl->achieved_at ) ) ); ?></span>
									</div>
								<?php endforeach; ?>
							<?php else : ?>
								<p class="gf-empty-state"><?php esc_html_e( 'No levels unlocked yet.', 'gamify' ); ?></p>
							<?php endif; ?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Renders a grid of ALL achievements with lock logic.
	 *
	 * @return string HTML Output.
	 */
	public function render_achievements() {
		if ( ! is_user_logged_in() ) {
			return '';
		}

		global $wpdb;
		$user_id = get_current_user_id();

		// 1. Fetch all available achievements.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$all_achievements = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A );

		// 2. Fetch earned achievement IDs.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$earned_ids = $wpdb->get_col( $wpdb->prepare( "SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", $user_id ) );

		if ( empty( $all_achievements ) ) {
			return sprintf( '<p>%s</p>', esc_html__( 'No achievements created yet.', 'gamify' ) );
		}

		ob_start();
		?>
		<div class="gamify-achievements-grid-v3">
			<?php
			foreach ( $all_achievements as $ach ) :
				$is_earned    = in_array( (string) $ach['id'], $earned_ids, true );
				$status_class = $is_earned ? 'is-unlocked' : 'is-locked';
				?>
				<div class="gamify-achievement-card <?php echo esc_attr( $status_class ); ?>">
					<div class="achievement-icon-box">
						<?php if ( ! empty( $ach['badge_image'] ) ) : ?>
							<img src="<?php echo esc_url( $ach['badge_image'] ); ?>" alt="<?php echo esc_attr( $ach['title'] ); ?>">
						<?php else : ?>
							<span class="default-icon">🏅</span>
						<?php endif; ?>
						
						<?php if ( ! $is_earned ) : ?>
							<div class="lock-overlay">🔒</div>
						<?php endif; ?>
					</div>
					
					<div class="achievement-details">
						<span class="ach-title"><?php echo esc_html( $ach['title'] ); ?></span>
						<?php if ( ! $is_earned && ! empty( $ach['restriction_message'] ) ) : ?>
							<div class="ach-hint" title="<?php echo esc_attr( $ach['restriction_message'] ); ?>">
								ℹ️ <?php esc_html_e( 'How to unlock', 'gamify' ); ?>
							</div>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * [gamify_points] - Styled point display.
	 */
	public function render_points() {
		if ( ! is_user_logged_in() ) {
			return '0';
		}
		$manager = new PointsManager();
		$points  = $manager->get_grand_total( get_current_user_id() );
		return sprintf( '<span class="gamify-pill-points">🪙 %s</span>', esc_html( number_format_i18n( $points ) ) );
	}

	/**
	 * [gamify_level] - Styled current level display.
	 */
	public function render_level() {
		if ( ! is_user_logged_in() ) {
			return '';
		}
		$manager = new LevelsManager();
		$levels  = $manager->get_all_user_levels( get_current_user_id() );
		if ( empty( $levels ) ) {
			return esc_html__( 'No Level', 'gamify' );
		}
		$current = end( $levels );
		return sprintf( '<span class="gamify-pill-level">🏆 %s</span>', esc_html( $current->title ) );
	}

	/**
	 * [gamify_progress_map] - Dedicated shortcode for roadmap.
	 */
	public function render_progress_map() {
		if ( ! is_user_logged_in() ) {
			return '';
		}
		if ( class_exists( '\Gamify\Addons\ProgressMap\Progress_Map_Logic' ) ) {
			return \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html( get_current_user_id() );
		}
		return sprintf( '<p>%s</p>', esc_html__( 'Progress Map addon is not active.', 'gamify' ) );
	}
}