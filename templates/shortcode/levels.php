<?php
if (! defined('ABSPATH')) {
    exit;
}

/** @var \GameEngine\Classes\LevelsManager $gameengine_levels_manager */
$gameengine_levels_manager = new \GameEngine\Classes\LevelsManager();

$gameengine_user_id = isset($user_id) ? absint($user_id) : get_current_user_id();
// 0 = "no specific currency". Only filter to one point type when the caller
// actually asked for it via the shortcode attribute — otherwise every level is
// shown, whatever point type it belongs to.
$gameengine_pt_id = isset($point_type_id) ? absint($point_type_id) : 0;

// "Next milestone" progress is per-currency, so it still needs one point type;
// fall back to the first published one instead of assuming ID 1.
$gameengine_next_pt_id = $gameengine_pt_id ? $gameengine_pt_id : \GameEngine\Classes\PointsManager::resolve_point_type_id(0);

$gameengine_next_lvl_data = $gameengine_next_pt_id
    ? $gameengine_levels_manager->get_next_level($gameengine_user_id, $gameengine_next_pt_id)
    : null;
$gameengine_all_lvls = $gameengine_levels_manager->get_all_levels_with_status($gameengine_user_id, $gameengine_pt_id ?: null);

// The member's highest level gets a "Current level" mark in the grid.
$gameengine_current_lvl    = $gameengine_levels_manager->get_current_level($gameengine_user_id);
$gameengine_current_lvl_id = $gameengine_current_lvl ? (int) $gameengine_current_lvl->id : 0;
$gameengine_date_format    = get_option('date_format');
?>
<div class="gameengine-ui gameengine-levels">
    <?php if ($gameengine_next_lvl_data) : ?>
        <?php
        $gameengine_progress_pc   = (int) $gameengine_next_lvl_data['progress_pc'];
        $gameengine_next_lvl_name = $gameengine_next_lvl_data['level']->title;
        ?>
        <section class="gameengine-card gameengine-level-progress">
            <span class="gameengine-level-progress__icon"><?php \GameEngine\Icons::render('trending-up'); ?></span>
            <div class="gameengine-level-progress__body">
                <div class="gameengine-level-progress__head">
                    <div>
                        <p class="gameengine-level-progress__eyebrow"><?php esc_html_e('Next Milestone', 'gameengine'); ?></p>
                        <h3 class="gameengine-level-progress__title"><?php echo esc_html($gameengine_next_lvl_name); ?></h3>
                    </div>
                    <span class="gameengine-level-progress__percent"><?php echo esc_html($gameengine_progress_pc); ?>%</span>
                </div>
                <div
                    class="gameengine-progress"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="<?php echo esc_attr($gameengine_progress_pc); ?>"
                    aria-label="<?php echo esc_attr(sprintf(/* translators: %s: level name */ __('Progress to %s', 'gameengine'), $gameengine_next_lvl_name)); ?>"
                >
                    <span class="gameengine-progress__bar" style="width: <?php echo esc_attr($gameengine_progress_pc); ?>%;"></span>
                </div>
                <p class="gameengine-level-progress__hint">
                    <?php
                    printf(
                        /* translators: 1: points needed, 2: what the points are called, e.g. "Community Points", 3: level name */
                        esc_html__('Collect %1$s more %2$s to unlock %3$s', 'gameengine'),
                        '<strong>' . esc_html(number_format_i18n($gameengine_next_lvl_data['points_needed'])) . '</strong>',
                        esc_html(\GameEngine\Classes\PointsManager::get_point_type_label($gameengine_next_pt_id)),
                        '<strong>' . esc_html($gameengine_next_lvl_name) . '</strong>'
                    );
                    ?>
                </p>
            </div>
        </section>
    <?php endif; ?>

    <?php if (! empty($gameengine_all_lvls)) : ?>
        <ul class="gameengine-level-grid">
            <?php foreach ($gameengine_all_lvls as $gameengine_lvl) : ?>
                <?php
                $gameengine_is_unlocked = (bool) $gameengine_lvl->unlocked;
                $gameengine_is_current  = $gameengine_is_unlocked && (int) $gameengine_lvl->id === $gameengine_current_lvl_id;
                $gameengine_lvl_classes = array(
                    'gameengine-level-card',
                    $gameengine_is_unlocked ? 'gameengine-level-card--unlocked' : 'gameengine-level-card--locked',
                );
                if ($gameengine_is_current) {
                    $gameengine_lvl_classes[] = 'gameengine-level-card--current';
                }

                $gameengine_lvl_icon     = (string) ($gameengine_lvl->icon ?? '');
                $gameengine_lvl_dashicon = '' !== $gameengine_lvl_icon && 0 === strpos($gameengine_lvl_icon, 'dashicons-');
                if ($gameengine_lvl_dashicon) {
                    wp_enqueue_style('dashicons');
                }
                ?>
                <li class="<?php echo esc_attr(implode(' ', $gameengine_lvl_classes)); ?>">
                    <span class="gameengine-level-card__media">
                        <?php if ($gameengine_lvl_dashicon) : ?>
                            <span class="dashicons <?php echo esc_attr($gameengine_lvl_icon); ?>" aria-hidden="true"></span>
                        <?php elseif ('' !== $gameengine_lvl_icon) : ?>
                            <img src="<?php echo esc_url($gameengine_lvl_icon); ?>" alt="" loading="lazy">
                        <?php else : ?>
                            <?php \GameEngine\Icons::render('trophy'); ?>
                        <?php endif; ?>
                    </span>

                    <div class="gameengine-level-card__body">
                        <div class="gameengine-level-card__top">
                            <h4 class="gameengine-level-card__title"><?php echo esc_html($gameengine_lvl->title); ?></h4>
                            <?php if ($gameengine_is_current) : ?>
                                <span class="gameengine-badge gameengine-badge--primary"><?php esc_html_e('Current level', 'gameengine'); ?></span>
                            <?php elseif ($gameengine_is_unlocked) : ?>
                                <span class="gameengine-badge gameengine-badge--success"><?php esc_html_e('Unlocked', 'gameengine'); ?></span>
                            <?php else : ?>
                                <span class="gameengine-badge"><?php esc_html_e('Locked', 'gameengine'); ?></span>
                            <?php endif; ?>
                        </div>

                        <?php if ($gameengine_is_unlocked && ! empty($gameengine_lvl->achieved_at)) : ?>
                            <p class="gameengine-level-card__meta">
                                <?php \GameEngine\Icons::render('calendar'); ?>
                                <?php echo esc_html(date_i18n($gameengine_date_format, strtotime($gameengine_lvl->achieved_at))); ?>
                            </p>
                        <?php elseif (! $gameengine_is_unlocked && ! empty($gameengine_lvl->unlock_with_points_enabled)) : ?>
                            <p class="gameengine-level-card__meta">
                                <?php \GameEngine\Icons::render('flag'); ?>
                                <?php
                                echo esc_html(sprintf(
                                    /* translators: 1: required point amount, 2: what the points are called, e.g. "Community Points" */
                                    __('%1$s %2$s', 'gameengine'),
                                    number_format_i18n((int) $gameengine_lvl->min_points),
                                    \GameEngine\Classes\PointsManager::get_point_type_label((int) ($gameengine_lvl->point_type_id ?? 0))
                                ));
                                ?>
                            </p>
                        <?php endif; ?>

                        <?php if (! empty($gameengine_lvl->description)) : ?>
                            <div class="gameengine-level-card__desc"><?php echo wp_kses_post($gameengine_lvl->description); ?></div>
                        <?php endif; ?>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php else : ?>
        <div class="gameengine-empty">
            <span class="gameengine-empty__icon"><?php \GameEngine\Icons::render('trophy'); ?></span>
            <p class="gameengine-empty__title"><?php esc_html_e('No levels available yet.', 'gameengine'); ?></p>
        </div>
    <?php endif; ?>
</div>
