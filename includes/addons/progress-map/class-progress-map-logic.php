<?php

namespace GameEngine\Addons\ProgressMap;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Class Progress_Map_Logic
 * Handles the calculation and rendering of the user journey roadmap.
 */
class Progress_Map_Logic
{

	/**
	 * Fetches and merges levels and achievements into a single timeline.
	 *
	 * @param int $user_id The WordPress User ID.
	 * @return array Combined journey data.
	 */
	public static function get_combined_journey($user_id)
	{
		global $wpdb;

		$user_id = absint($user_id);

		// Fetch all Levels.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$levels = $wpdb->get_results(
			"SELECT id, title, icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'level' as type, priority, unlock_with_points_enabled, point_type_id, min_points
			 FROM {$wpdb->prefix}gameengine_levels
			 ORDER BY priority ASC",
			ARRAY_A
		);

		// Fetch all Achievements.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$achievements = $wpdb->get_results(
			"SELECT id, title, badge_image as icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'achievement' as type, created_at, unlock_with_points_enabled, required_point_type_id as point_type_id, required_points_amount as min_points
			 FROM {$wpdb->prefix}gameengine_achievements
			 ORDER BY created_at ASC",
			ARRAY_A
		);

		// Fetch user earned levels.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_levels = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT level_id FROM {$wpdb->prefix}gameengine_user_levels WHERE user_id = %d",
				$user_id
			)
		);

		// Fetch user earned achievements.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_achievements = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT achievement_id FROM {$wpdb->prefix}gameengine_user_achievements WHERE user_id = %d",
				$user_id
			)
		);

		// Merge and process status.
		$journey  = array_merge($levels ? $levels : array(), $achievements ? $achievements : array());
		$unlocked = array();
		$locked   = array();

		if (! empty($journey)) {
			foreach ($journey as $item) {
				$is_completed   = ('level' === $item['type'])
					? in_array($item['id'], (array)$user_levels)
					: in_array($item['id'], (array)$user_achievements);

				$item['status'] = $is_completed ? 'completed' : 'locked';

				if ($is_completed) {
					$unlocked[] = $item;
				} else {
					$locked[] = $item;
				}
			}
		}

		return array_merge($unlocked, $locked);
	}

	/**
	 * Renders the Roadmap HTML.
	 *
	 * Reached steps come first, then the locked ones in order. The next few
	 * locked steps stay in view and the rest fold into a <details>, so a long
	 * journey doesn't push the rest of the page down.
	 *
	 * @param int $user_id The User ID.
	 * @return string HTML output.
	 */
	public static function render_html($user_id)
	{
		$gameengine_journey = self::get_combined_journey($user_id);

		ob_start();

		if (empty($gameengine_journey)) {
			?>
			<div class="gameengine-ui gameengine-progress-map">
				<div class="gameengine-empty">
					<span class="gameengine-empty__icon"><?php \GameEngine\Icons::render('map'); ?></span>
					<p class="gameengine-empty__title"><?php esc_html_e('No milestones yet.', 'gameengine'); ?></p>
				</div>
			</div>
			<?php
			return ob_get_clean();
		}

		$gameengine_total   = count($gameengine_journey);
		$gameengine_reached = count(wp_list_filter($gameengine_journey, array('status' => 'completed')));
		$gameengine_percent = (int) round(($gameengine_reached / $gameengine_total) * 100);

		/**
		 * Filters how many locked steps show before the rest fold away.
		 *
		 * @param int $count Locked steps to show. Default 3.
		 */
		$gameengine_visible = $gameengine_reached + max(0, (int) apply_filters('gameengine_progress_map_visible_locked', 3));

		// Folding away one or two steps saves nothing, so show them.
		if ($gameengine_total - $gameengine_visible <= 2) {
			$gameengine_visible = $gameengine_total;
		}

		$gameengine_shown  = array_slice($gameengine_journey, 0, $gameengine_visible);
		$gameengine_folded = array_slice($gameengine_journey, $gameengine_visible);
		?>
		<div class="gameengine-ui gameengine-progress-map">
			<div class="gameengine-progress-map__summary">
				<p class="gameengine-progress-map__count">
					<?php
					printf(
						/* translators: 1: milestones the member has reached, 2: all milestones */
						esc_html__('%1$s of %2$s milestones reached', 'gameengine'),
						'<strong>' . esc_html(number_format_i18n($gameengine_reached)) . '</strong>',
						esc_html(number_format_i18n($gameengine_total))
					);
					?>
				</p>
				<div class="gameengine-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="<?php echo esc_attr($gameengine_percent); ?>" aria-label="<?php esc_attr_e('Milestones reached', 'gameengine'); ?>">
					<span class="gameengine-progress__bar" style="width: <?php echo esc_attr($gameengine_percent); ?>%;"></span>
				</div>
			</div>

			<div class="gameengine-progress-map__timeline">
				<ol class="gameengine-progress-map__list<?php echo $gameengine_folded ? ' gameengine-progress-map__list--continues' : ''; ?>">
					<?php self::render_steps($gameengine_shown, 0); ?>
				</ol>

				<?php if ($gameengine_folded) : ?>
					<details class="gameengine-progress-map__more">
						<summary class="gameengine-progress-map__toggle">
							<?php \GameEngine\Icons::render('chevron-down'); ?>
							<span class="gameengine-progress-map__toggle-more">
								<?php
								echo esc_html(sprintf(
									/* translators: %s: number of folded milestones */
									_n('Show %s more milestone', 'Show %s more milestones', count($gameengine_folded), 'gameengine'),
									number_format_i18n(count($gameengine_folded))
								));
								?>
							</span>
							<span class="gameengine-progress-map__toggle-less"><?php esc_html_e('Show fewer milestones', 'gameengine'); ?></span>
						</summary>
						<ol class="gameengine-progress-map__list gameengine-progress-map__list--continued">
							<?php self::render_steps($gameengine_folded, $gameengine_visible); ?>
						</ol>
					</details>
				<?php endif; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Prints timeline steps.
	 *
	 * @param array $steps  Journey items.
	 * @param int   $offset Position of the first item in the whole journey.
	 */
	private static function render_steps($steps, $offset)
	{
		foreach (array_values($steps) as $gameengine_index => $gameengine_node) :
			$gameengine_is_completed = ('completed' === $gameengine_node['status']);
			$gameengine_is_level     = ('level' === $gameengine_node['type']);
			$gameengine_node_icon    = (string) ($gameengine_node['icon'] ?? '');
			?>
			<li class="gameengine-progress-map__step <?php echo $gameengine_is_completed ? 'gameengine-progress-map__step--done' : 'gameengine-progress-map__step--locked'; ?>">
				<span class="gameengine-progress-map__marker">
					<?php if ($gameengine_is_completed) : ?>
						<?php \GameEngine\Icons::render('check'); ?>
						<span class="gameengine-screen-reader-text"><?php esc_html_e('Reached', 'gameengine'); ?></span>
					<?php else : ?>
						<?php echo esc_html(number_format_i18n($offset + $gameengine_index + 1)); ?>
					<?php endif; ?>
				</span>

				<div class="gameengine-progress-map__card">
					<span class="gameengine-progress-map__media<?php echo $gameengine_is_level ? '' : ' gameengine-progress-map__media--achievement'; ?>">
						<?php if ('' !== $gameengine_node_icon && 0 !== strpos($gameengine_node_icon, 'dashicons-')) : ?>
							<img src="<?php echo esc_url($gameengine_node_icon); ?>" alt="" loading="lazy">
						<?php else : ?>
							<?php \GameEngine\Icons::render($gameengine_is_level ? 'trophy' : 'medal'); ?>
						<?php endif; ?>
					</span>

					<div class="gameengine-progress-map__body">
						<div class="gameengine-progress-map__head">
							<span class="gameengine-badge <?php echo $gameengine_is_level ? 'gameengine-badge--primary' : 'gameengine-badge--points'; ?>">
								<?php echo $gameengine_is_level ? esc_html__('Level', 'gameengine') : esc_html__('Achievement', 'gameengine'); ?>
							</span>
							<?php if (! $gameengine_is_completed) : ?>
								<span class="gameengine-badge"><?php \GameEngine\Icons::render('lock'); ?><?php esc_html_e('Locked', 'gameengine'); ?></span>
							<?php endif; ?>
						</div>

						<h4 class="gameengine-progress-map__title"><?php echo esc_html($gameengine_node['title']); ?></h4>

						<?php if ($gameengine_is_completed && ! empty($gameengine_node['congrats'])) : ?>
							<div class="gameengine-progress-map__text"><?php echo wp_kses_post((string) $gameengine_node['congrats']); ?></div>
						<?php elseif (! $gameengine_is_completed) : ?>
							<div class="gameengine-progress-map__text">
								<?php
								$gameengine_lock_msg = ! empty($gameengine_node['restriction_message']) ? $gameengine_node['restriction_message'] : self::get_lock_message($gameengine_node);
								echo wp_kses_post((string) $gameengine_lock_msg);
								?>
							</div>
						<?php endif; ?>
					</div>
				</div>
			</li>
			<?php
		endforeach;
	}

	/**
	 * What unlocks a step that has no restriction message of its own.
	 *
	 * A step unlocked by points names the amount and the point type, which
	 * "Complete pre-requisites to unlock." never told the member.
	 *
	 * @param array $node Journey item.
	 * @return string
	 */
	private static function get_lock_message($node)
	{
		$points = (int) ($node['min_points'] ?? 0);

		if (! empty($node['unlock_with_points_enabled']) && $points > 0) {
			return sprintf(
				/* translators: 1: points needed, 2: what the points are called, e.g. "Community Points" */
				__('Collect %1$s %2$s to unlock.', 'gameengine'),
				number_format_i18n($points),
				\GameEngine\Classes\PointsManager::get_point_type_label((int) ($node['point_type_id'] ?? 0))
			);
		}

		return __('Complete pre-requisites to unlock.', 'gameengine');
	}
}
