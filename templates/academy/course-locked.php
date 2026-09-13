<?php
/**
 * "GameEngine Unlock" locked-enrollment card.
 *
 * Rendered by GameEngine\Addons\AcademyLMS\Course_Unlock::modify_enrollment_form()
 * in place of Academy's enroll form when the current user has not yet met the
 * course's points / achievement / level rules.
 *
 * Available vars: $course_id (int), $rules (array), $is_enable_academy_login (bool).
 *
 * @package GameEngine
 */

if (! defined('ABSPATH')) {
    exit;
}

\GameEngine\Assets::enqueue_frontend();

if ($is_enable_academy_login && ! is_user_logged_in()) :
    ?>
	<div class="academy-widget-enroll__continue">
		<div class="gameengine-ui gameengine-course-lock">
			<span class="gameengine-course-lock__icon"><?php \GameEngine\Icons::render('lock'); ?></span>
			<div class="gameengine-course-lock__body">
				<p class="gameengine-course-lock__title"><?php esc_html_e('Log in to check your progress', 'gameengine'); ?></p>
			</div>
		</div>
		<button type="button" class="academy-btn academy-btn--bg-purple academy-btn-popup-login">
			<?php esc_html_e('Log In to Unlock', 'gameengine'); ?>
		</button>
	</div>
	<?php
else :
    global $wpdb;
    $gameengine_requires_all = \GameEngine\Addons\AcademyLMS\Course_Unlock::requires_all_rules($course_id);
    $gameengine_chips        = array();

    foreach ((array) $rules as $gameengine_rule) {
        if (empty($gameengine_rule['type'])) {
            continue;
        }
        if ('points' === $gameengine_rule['type']) {
            $gameengine_chips[] = array(
                'icon'  => 'coin',
                /* translators: %s: required point amount */
                'label' => sprintf(esc_html__('%s points', 'gameengine'), number_format_i18n((int) $gameengine_rule['value'])),
            );
        } elseif ('achievement' === $gameengine_rule['type']) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $gameengine_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", (int) $gameengine_rule['value']));
            if ($gameengine_title) {
                $gameengine_chips[] = array(
                    'icon'  => 'medal',
                    'label' => $gameengine_title,
                );
            }
        } elseif ('level' === $gameengine_rule['type']) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $gameengine_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", (int) $gameengine_rule['value']));
            if ($gameengine_title) {
                $gameengine_chips[] = array(
                    'icon'  => 'trophy',
                    /* translators: %s: level title */
                    'label' => sprintf(esc_html__('Level: %s', 'gameengine'), $gameengine_title),
                );
            }
        }
    }

    if (! empty($gameengine_chips)) :
        $gameengine_joiner = $gameengine_requires_all ? esc_html__('AND', 'gameengine') : esc_html__('OR', 'gameengine');
        $gameengine_total  = count($gameengine_chips);
        ?>
		<div class="academy-widget-enroll__continue">
			<div class="academy-widget-enroll__get-membership academy-widget-enroll__get-membership--gameengine">
				<div class="gameengine-ui gameengine-course-lock">
					<span class="gameengine-course-lock__icon"><?php \GameEngine\Icons::render('lock'); ?></span>
					<div class="gameengine-course-lock__body">
						<p class="gameengine-course-lock__title"><?php esc_html_e('Unlock this course:', 'gameengine'); ?></p>
						<ul class="gameengine-course-lock__rules">
							<?php foreach ($gameengine_chips as $gameengine_index => $gameengine_chip) : ?>
								<li class="gameengine-course-lock__rule">
									<?php \GameEngine\Icons::render($gameengine_chip['icon']); ?>
									<?php echo esc_html($gameengine_chip['label']); ?>
								</li>
								<?php if ($gameengine_index < $gameengine_total - 1) : ?>
									<li class="gameengine-course-lock__joiner" aria-hidden="true"><?php echo esc_html($gameengine_joiner); ?></li>
								<?php endif; ?>
							<?php endforeach; ?>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<?php
	endif;
endif;
