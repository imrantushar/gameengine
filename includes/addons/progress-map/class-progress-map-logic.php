<?php

namespace Gamify\Addons\ProgressMap;

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

		// 1. Fetch all Levels.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$levels = $wpdb->get_results("SELECT id, title, icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'level' as type, priority FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC", ARRAY_A);

		// 2. Fetch all Achievements.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$achievements = $wpdb->get_results("SELECT id, title, badge_image as icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'achievement' as type, created_at FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A);

		// 3. Fetch user earned data.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_levels = $wpdb->get_col($wpdb->prepare("SELECT level_id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d", $user_id));
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_achievements = $wpdb->get_col($wpdb->prepare("SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", $user_id));

		// 4. Merge and process status.
		$journey  = array_merge($levels ? $levels : array(), $achievements ? $achievements : array());
		$unlocked = array();
		$locked   = array();

		if (! empty($journey)) {
			foreach ($journey as $item) {
				$is_completed   = ('level' === $item['type']) ? in_array((string) $item['id'], $user_levels, true) : in_array((string) $item['id'], $user_achievements, true);
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
	 * Pre-fetches titles for all required dependencies using secure placeholders and caching.
	 *
	 * @param array $journey The combined journey array.
	 * @return array Map of ID to Title.
	 */
	private static function get_dependency_titles($journey)
	{
		global $wpdb;
		$titles = array();

		$ach_ids = array_unique(array_filter(array_map('absint', wp_list_pluck($journey, 'required_achievement_id'))));
		$lvl_ids = array_unique(array_filter(array_map('absint', wp_list_pluck($journey, 'required_level_id'))));

		// 1. Fetch Achievement Titles.
		if (! empty($ach_ids)) {
			$cache_key = 'gf_ach_titles_' . md5(wp_json_encode($ach_ids));
			$results   = wp_cache_get($cache_key, 'gamify');

			if (false === $results) {
				$placeholders = implode(',', array_fill(0, count($ach_ids), '%d'));
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$results = $wpdb->get_results($wpdb->prepare("SELECT id, title FROM {$wpdb->prefix}gamify_achievements WHERE id IN ($placeholders)", $ach_ids), OBJECT_K);
				wp_cache_set($cache_key, $results, 'gamify', 300);
			}

			if ($results) {
				foreach ($results as $id => $row) {
					$titles['ach_' . $id] = $row->title;
				}
			}
		}

		// 2. Fetch Level Titles.
		if (! empty($lvl_ids)) {
			$cache_key = 'gf_lvl_titles_' . md5(wp_json_encode($lvl_ids));
			$results   = wp_cache_get($cache_key, 'gamify');

			if (false === $results) {
				$placeholders = implode(',', array_fill(0, count($lvl_ids), '%d'));
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$results = $wpdb->get_results($wpdb->prepare("SELECT id, title FROM {$wpdb->prefix}gamify_levels WHERE id IN ($placeholders)", $lvl_ids), OBJECT_K);
				wp_cache_set($cache_key, $results, 'gamify', 300);
			}

			if ($results) {
				foreach ($results as $id => $row) {
					$titles['lvl_' . $id] = $row->title;
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
	public static function render_html($user_id)
	{
		$gamify_journey = self::get_combined_journey($user_id);
		if (empty($gamify_journey)) {
			return '';
		}

		$gamify_dependency_titles = self::get_dependency_titles($gamify_journey);
		$gamify_total_nodes       = count($gamify_journey);

		ob_start();
?>
		<div class="gamify-roadmap">
			<div class="gamify-timeline">
				<?php
				foreach ($gamify_journey as $gamify_index => $gamify_node) :
					$gamify_is_last        = ($gamify_index === $gamify_total_nodes - 1);
					$gamify_is_completed   = ('completed' === $gamify_node['status']);
					$gamify_next_completed = (! $gamify_is_last && 'completed' === $gamify_journey[$gamify_index + 1]['status']);

					$gamify_line_class = ($gamify_is_completed && $gamify_next_completed) ? 'line-blue' : 'line-gray';
					$gamify_side_class = (0 === $gamify_index % 2) ? 'node-left' : 'node-right';
				?>
					<div class="gamify-timeline-node <?php echo esc_attr($gamify_side_class); ?> <?php echo $gamify_is_completed ? 'is-active' : 'is-locked'; ?>">
						<div class="gamify-node-circle"><?php echo esc_html((int) $gamify_index + 1); ?></div>

						<?php if (! $gamify_is_last) : ?>
							<div class="gamify-connector <?php echo esc_attr($gamify_line_class); ?>"></div>
						<?php endif; ?>

						<div class="gamify-node-card">
							<div class="gamify-card-inner">
								<div class="gamify-card-media">
									<?php if (! empty($gamify_node['icon'])) : ?>
										<img src="<?php echo esc_url($gamify_node['icon']); ?>" alt="">
									<?php else : ?>
										<span class="icon-placeholder"><?php echo ('level' === $gamify_node['type']) ? '🏆' : '🏅'; ?></span>
									<?php endif; ?>
								</div>
								<div class="gamify-card-info">
									<div class="gamify-type-badge <?php echo esc_attr($gamify_node['type']); ?>">
										<?php echo esc_html(strtoupper((string) $gamify_node['type'])); ?>
									</div>
									<h5><?php echo esc_html($gamify_node['title']); ?></h5>

									<?php if ($gamify_is_completed) : ?>
										<p class="gf-congrats"><?php echo esc_html($gamify_node['congrats']); ?></p>
									<?php else : ?>
										<div class="gf-restriction-info">
											<span class="gf-lock-label">🔒 <?php esc_html_e('Locked', 'gamify'); ?></span>
											<p class="gf-lock-msg">
												<?php echo ! empty($gamify_node['restriction_message']) ? esc_html($gamify_node['restriction_message']) : esc_html__('Complete pre-requisites to unlock.', 'gamify'); ?>
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
