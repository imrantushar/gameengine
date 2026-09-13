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

$gameengine_lock_style_printed = false;
if (! defined('GAMEENGINE_ACADEMY_LOCK_STYLE')) {
    define('GAMEENGINE_ACADEMY_LOCK_STYLE', true);
    $gameengine_lock_style_printed = true;
}
?>
<?php if ($gameengine_lock_style_printed) : ?>
	<style>
		.academy-gameengine-unlock{display:flex;gap:12px;align-items:flex-start;padding:16px;border:1px solid #e2e2e8;border-radius:10px;background:#faf9ff}
		.academy-gameengine-unlock__icon{font-size:20px;line-height:1.2}
		.academy-gameengine-unlock__body{display:flex;flex-direction:column;gap:8px}
		.academy-gameengine-unlock__title{margin:0;font-weight:600}
		.academy-gameengine-unlock__chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0;padding:0;list-style:none}
		.academy-gameengine-unlock__label{width:100%;font-weight:600;margin-bottom:2px}
		.academy-gameengine-unlock__chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:#fff;border:1px solid #d9d7f0;font-size:13px}
		.academy-gameengine-unlock__joiner{font-size:12px;font-weight:700;color:#6b6b7b;text-transform:uppercase}
	</style>
<?php endif; ?>
<?php
if ($is_enable_academy_login && ! is_user_logged_in()) :
    ?>
	<div class="academy-widget-enroll__continue">
		<div class="academy-gameengine-unlock">
			<span class="academy-gameengine-unlock__icon" aria-hidden="true">🔒</span>
			<div class="academy-gameengine-unlock__body">
				<p class="academy-gameengine-unlock__title"><?php esc_html_e('Log in to check your progress', 'gameengine'); ?></p>
				<button type="button" class="academy-btn academy-btn--bg-purple academy-btn-popup-login">
					<?php esc_html_e('Log In to Unlock', 'gameengine'); ?>
				</button>
			</div>
		</div>
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
                'icon'  => '🪙',
                /* translators: %s: required point amount */
                'label' => sprintf(esc_html__('%s points', 'gameengine'), number_format_i18n((int) $gameengine_rule['value'])),
            );
        } elseif ('achievement' === $gameengine_rule['type']) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $gameengine_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_achievements WHERE id = %d", (int) $gameengine_rule['value']));
            if ($gameengine_title) {
                $gameengine_chips[] = array(
                    'icon'  => '🏅',
                    'label' => $gameengine_title,
                );
            }
        } elseif ('level' === $gameengine_rule['type']) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $gameengine_title = $wpdb->get_var($wpdb->prepare("SELECT title FROM {$wpdb->prefix}gameengine_levels WHERE id = %d", (int) $gameengine_rule['value']));
            if ($gameengine_title) {
                $gameengine_chips[] = array(
                    'icon'  => '🏆',
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
				<div class="academy-gameengine-unlock">
					<span class="academy-gameengine-unlock__icon" aria-hidden="true">🔒</span>
					<ul class="academy-gameengine-unlock__chips">
						<li class="academy-gameengine-unlock__label"><?php esc_html_e('Unlock this course:', 'gameengine'); ?></li>
						<?php foreach ($gameengine_chips as $gameengine_index => $gameengine_chip) : ?>
							<li class="academy-gameengine-unlock__chip">
								<span aria-hidden="true"><?php echo esc_html($gameengine_chip['icon']); ?></span>
								<?php echo esc_html($gameengine_chip['label']); ?>
							</li>
							<?php if ($gameengine_index < $gameengine_total - 1) : ?>
								<li class="academy-gameengine-unlock__joiner" aria-hidden="true"><?php echo esc_html($gameengine_joiner); ?></li>
							<?php endif; ?>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>
		</div>
		<?php
	endif;
endif;
