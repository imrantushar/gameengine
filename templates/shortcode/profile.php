<?php
if (! defined('ABSPATH')) exit;
global $wpdb;

$gameengine_user_id        = get_current_user_id();
$gameengine_user_data      = get_userdata($gameengine_user_id);
$gameengine_points_manager = new \GameEngine\Classes\PointsManager();
$gameengine_points_total   = $gameengine_points_manager->get_grand_total($gameengine_user_id);

// The header chip shows the highest level the member currently holds.
$gameengine_levels_manager = new \GameEngine\Classes\LevelsManager();
$gameengine_user_level     = $gameengine_levels_manager->get_current_level($gameengine_user_id);

// Streaks are a per-trigger option now, so the runs come from the rules the
// member is actually working on rather than a separate streak record.
$gameengine_user_streaks = \GameEngine\Classes\Triggers::get_user_streaks($gameengine_user_id);

// Earned against available, for the summary tiles. Joined to the definitions so
// an award whose achievement or level was deleted is not counted.
// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$gameengine_ach_total  = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_achievements");
$gameengine_ach_earned = (int) $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(DISTINCT ua.achievement_id) FROM {$wpdb->prefix}gameengine_user_achievements ua
     INNER JOIN {$wpdb->prefix}gameengine_achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id = %d",
    $gameengine_user_id
));
$gameengine_lvl_total  = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_levels");
$gameengine_lvl_earned = (int) $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(DISTINCT ul.level_id) FROM {$wpdb->prefix}gameengine_user_levels ul
     INNER JOIN {$wpdb->prefix}gameengine_levels l ON l.id = ul.level_id
     WHERE ul.user_id = %d",
    $gameengine_user_id
));
// phpcs:enable

// The Progress Map tab only works when its addon is active (that is what loads
// Progress_Map_Logic). When it is off, skip the tab entirely instead of
// rendering an empty pane, and let the next tab be the default.
$gameengine_tabs = array();
if (class_exists('\GameEngine\Addons\ProgressMap\Progress_Map_Logic')) {
    $gameengine_tabs['progress-map'] = array('label' => __('Progress Map', 'gameengine'), 'icon' => 'map');
}
$gameengine_tabs['achievements'] = array('label' => __('Achievements', 'gameengine'), 'icon' => 'medal');
$gameengine_tabs['levels']       = array('label' => __('Levels', 'gameengine'), 'icon' => 'trophy');
if (! empty($gameengine_user_streaks)) {
    $gameengine_tabs['streaks'] = array('label' => __('Streaks', 'gameengine'), 'icon' => 'flame');
}

$gameengine_default_tab = array_key_first($gameengine_tabs);
$gameengine_tab_id      = wp_unique_id('gameengine-profile-');
?>
<div class="gameengine-ui gameengine-profile">
    <section class="gameengine-card gameengine-profile__summary">
        <div class="gameengine-profile__identity">
            <?php echo wp_kses_post(get_avatar($gameengine_user_id, 64, '', '', array('class' => 'gameengine-avatar gameengine-avatar--lg'))); ?>
            <div>
                <h2 class="gameengine-profile__name"><?php echo esc_html($gameengine_user_data->display_name); ?></h2>
                <?php if ($gameengine_user_level) : ?>
                    <?php
                    $gameengine_level_icon  = $gameengine_user_level->icon ?? '';
                    $gameengine_level_color = $gameengine_user_level->color ?? '';
                    $gameengine_is_dashicon = ! empty($gameengine_level_icon) && strpos($gameengine_level_icon, 'dashicons-') === 0;
                    if ($gameengine_is_dashicon) {
                        wp_enqueue_style('dashicons');
                    }
                    ?>
                    <div class="gameengine-profile__tags">
                        <span class="gameengine-badge gameengine-badge--primary gameengine-profile__level"<?php echo $gameengine_level_color ? ' style="' . esc_attr('color:' . $gameengine_level_color) . '"' : ''; ?>>
                            <?php if ($gameengine_is_dashicon) : ?>
                                <span class="dashicons <?php echo esc_attr($gameengine_level_icon); ?>" aria-hidden="true"></span>
                            <?php elseif (! empty($gameengine_level_icon)) : ?>
                                <img src="<?php echo esc_url($gameengine_level_icon); ?>" alt="">
                            <?php else : ?>
                                <?php \GameEngine\Icons::render('trophy'); ?>
                            <?php endif; ?>
                            <?php echo esc_html($gameengine_user_level->title); ?>
                        </span>
                    </div>
                <?php endif; ?>
                <?php do_action('gameengine_profile_after_level', $gameengine_user_id); ?>
            </div>
        </div>

        <dl class="gameengine-profile__stats">
            <div class="gameengine-profile__stat">
                <dt><?php esc_html_e('Points', 'gameengine'); ?></dt>
                <dd><?php echo esc_html(number_format_i18n($gameengine_points_total)); ?></dd>
            </div>
            <div class="gameengine-profile__stat">
                <dt><?php esc_html_e('Achievements', 'gameengine'); ?></dt>
                <dd><?php echo esc_html(number_format_i18n($gameengine_ach_earned)); ?><span class="gameengine-profile__stat-total"> / <?php echo esc_html(number_format_i18n($gameengine_ach_total)); ?></span></dd>
            </div>
            <div class="gameengine-profile__stat">
                <dt><?php esc_html_e('Levels', 'gameengine'); ?></dt>
                <dd><?php echo esc_html(number_format_i18n($gameengine_lvl_earned)); ?><span class="gameengine-profile__stat-total"> / <?php echo esc_html(number_format_i18n($gameengine_lvl_total)); ?></span></dd>
            </div>
        </dl>
    </section>

    <div class="gameengine-tabs" data-gameengine-tabs>
        <div class="gameengine-tabs__list" role="tablist" aria-label="<?php esc_attr_e('Your progress', 'gameengine'); ?>">
            <?php foreach ($gameengine_tabs as $gameengine_tab_key => $gameengine_tab) : ?>
                <?php $gameengine_tab_selected = $gameengine_tab_key === $gameengine_default_tab; ?>
                <button
                    type="button"
                    class="gameengine-tabs__tab"
                    role="tab"
                    id="<?php echo esc_attr($gameengine_tab_id . '-tab-' . $gameengine_tab_key); ?>"
                    aria-controls="<?php echo esc_attr($gameengine_tab_id . '-panel-' . $gameengine_tab_key); ?>"
                    aria-selected="<?php echo $gameengine_tab_selected ? 'true' : 'false'; ?>"
                    tabindex="<?php echo $gameengine_tab_selected ? '0' : '-1'; ?>"
                >
                    <?php \GameEngine\Icons::render($gameengine_tab['icon']); ?>
                    <?php echo esc_html($gameengine_tab['label']); ?>
                </button>
            <?php endforeach; ?>
        </div>

        <?php foreach ($gameengine_tabs as $gameengine_tab_key => $gameengine_tab) : ?>
            <div
                class="gameengine-tabs__panel"
                role="tabpanel"
                id="<?php echo esc_attr($gameengine_tab_id . '-panel-' . $gameengine_tab_key); ?>"
                aria-labelledby="<?php echo esc_attr($gameengine_tab_id . '-tab-' . $gameengine_tab_key); ?>"
                tabindex="0"
                <?php echo $gameengine_tab_key === $gameengine_default_tab ? '' : 'hidden'; ?>
            >
                <?php if ('progress-map' === $gameengine_tab_key) : ?>
                    <?php echo \GameEngine\Addons\ProgressMap\Progress_Map_Logic::render_html($gameengine_user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                <?php elseif ('achievements' === $gameengine_tab_key) : ?>
                    <?php \GameEngine\Helper::get_template('shortcode/achievements.php'); ?>
                <?php elseif ('levels' === $gameengine_tab_key) : ?>
                    <?php \GameEngine\Helper::get_template('shortcode/levels.php'); ?>
                <?php elseif ('streaks' === $gameengine_tab_key) : ?>
                    <ul class="gameengine-streaks">
                        <?php foreach ($gameengine_user_streaks as $gameengine_streak) : ?>
                            <?php $gameengine_streak_count = (int) ($gameengine_streak['count'] ?? 0); ?>
                            <li class="gameengine-streak">
                                <span class="gameengine-streak__icon"><?php \GameEngine\Icons::render('flame'); ?></span>
                                <span class="gameengine-streak__body">
                                    <span class="gameengine-streak__label"><?php echo esc_html($gameengine_streak['label'] ?? ''); ?></span>
                                    <span class="gameengine-streak__count">
                                        <?php
                                        if ('weekly' === ($gameengine_streak['interval'] ?? 'daily')) {
                                            printf(
                                                /* translators: %s: streak count number */
                                                esc_html(_n('%s week streak', '%s week streak', $gameengine_streak_count, 'gameengine')),
                                                esc_html(number_format_i18n($gameengine_streak_count))
                                            );
                                        } else {
                                            printf(
                                                /* translators: %s: streak count number */
                                                esc_html(_n('%s day streak', '%s day streak', $gameengine_streak_count, 'gameengine')),
                                                esc_html(number_format_i18n($gameengine_streak_count))
                                            );
                                        }
                                        ?>
                                    </span>
                                </span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>

    <?php
    /**
     * Fires after the member profile's tabs, inside its wrapper.
     *
     * @param int $user_id The signed-in member whose profile is shown.
     */
    do_action('gameengine_profile_after_tabs', $gameengine_user_id);
    ?>
</div>
