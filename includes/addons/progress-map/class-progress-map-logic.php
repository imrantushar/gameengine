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
			"SELECT id, title, icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'level' as type, priority
			 FROM {$wpdb->prefix}gameengine_levels
			 ORDER BY priority ASC",
			ARRAY_A
		);

		// Fetch all Achievements.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$achievements = $wpdb->get_results(
			"SELECT id, title, badge_image as icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'achievement' as type, created_at
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
	 * @param int $user_id The User ID.
	 * @return string HTML output.
	 */
	public static function render_html($user_id)
	{
		$gameengine_journey = self::get_combined_journey($user_id);
		if (empty($gameengine_journey)) {
			return '';
		}

		ob_start();
?>
		<div class="gameengine-roadmap">
			<div class="gameengine-timeline">
				<?php foreach ($gameengine_journey as $gameengine_index => $gameengine_node) : ?>
					<?php
					$gameengine_is_completed = ('completed' === $gameengine_node['status']);
					$gameengine_side_class   = (0 === $gameengine_index % 2) ? 'gameengine-node-left' : 'gameengine-node-right';
					?>
					<div class="gameengine-timeline-node <?php echo esc_attr($gameengine_side_class); ?> <?php echo $gameengine_is_completed ? 'gameengine-is-active' : 'gameengine-is-locked'; ?>">

						<div class="gameengine-node-circle"><?php echo esc_html((int) $gameengine_index + 1); ?></div>

						<div class="gameengine-node-card">
							<div class="gameengine-card-inner">
								<div class="gameengine-card-media">
									<?php if (! empty($gameengine_node['icon'])) : ?>
										<img src="<?php echo esc_url($gameengine_node['icon']); ?>" alt="">
									<?php else : ?>
										<span class="gameengine-icon-placeholder"><?php echo ('level' === $gameengine_node['type']) ? '🏆' : '🏅'; ?></span>
									<?php endif; ?>
								</div>

								<div class="gameengine-card-info">
									<div class="gameengine-type-badge gameengine-type-<?php echo esc_attr($gameengine_node['type']); ?>">
										<?php echo esc_html(strtoupper((string) $gameengine_node['type'])); ?>
									</div>

									<h5><?php echo esc_html($gameengine_node['title']); ?></h5>

									<?php if ($gameengine_is_completed) : ?>
										<p class="gameengine-congrats"><?php echo wp_kses_post((string) ($gameengine_node['congrats'] ?? '')); ?></p>
									<?php else : ?>
										<div class="gameengine-restriction-info">
											<span class="gameengine-lock-label">🔒 <?php esc_html_e('Locked', 'gameengine'); ?></span>
											<p class="gameengine-lock-msg">
												<?php
												$res_msg = ! empty($gameengine_node['restriction_message']) ? $gameengine_node['restriction_message'] : __('Complete pre-requisites to unlock.', 'gameengine');
												echo wp_kses_post((string) $res_msg);
												?>
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
