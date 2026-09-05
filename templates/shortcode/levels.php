<?php
if (!defined('ABSPATH'))
    exit;

/** @var \GameEngine\Classes\LevelsManager $gameengine_levels_manager */
$gameengine_levels_manager = new \GameEngine\Classes\LevelsManager();

$gameengine_user_id = isset($user_id) ? absint($user_id) : get_current_user_id();
$gameengine_pt_id = isset($point_type_id) ? absint($point_type_id) : 1;

$gameengine_next_lvl_data = $gameengine_levels_manager->get_next_level($gameengine_user_id, $gameengine_pt_id);
$gameengine_all_lvls = $gameengine_levels_manager->get_all_levels_with_status($gameengine_user_id, $gameengine_pt_id);

?>
<div class="gameengine-level-container">
    <?php if ($gameengine_next_lvl_data): ?>
            <div class="gameengine-progress-section">
                <div class="gameengine-progress-header">
                    <span class="gameengine-progress-title"><?php esc_html_e('Next Milestone', 'gameengine'); ?></span>
                    <span
                        class="gameengine-progress-value"><?php echo (int) $gameengine_next_lvl_data['progress_pc']; ?>%</span>
                </div>
                <div class="gameengine-progress-bar-bg">
                    <div class="gameengine-progress-bar-fill"
                        style="width: <?php echo (int) $gameengine_next_lvl_data['progress_pc']; ?>%;"></div>
                </div>
                <div class="gameengine-next-lvl-msg">
                    <span>🚀</span>
                    <span>
                        <?php
                        printf(
                            /* translators: 1: points needed, 2: level name */
                            esc_html__('Collect %1$s more points to unlock %2$s', 'gameengine'),
                            '<strong>' . esc_html( number_format_i18n( $gameengine_next_lvl_data['points_needed'] ) ) . '</strong>',
                            '<strong>' . esc_html($gameengine_next_lvl_data['level']->title) . '</strong>'
                        );
                        ?>
                    </span>
                </div>
            </div>
    <?php endif; ?>

    <div class="gameengine-lvl-roadmap">
        <?php if (!empty($gameengine_all_lvls)): ?>
                <?php foreach ($gameengine_all_lvls as $gameengine_lvl):
                    $gameengine_is_unlocked = (bool) $gameengine_lvl->unlocked;
                    $gameengine_status_class = $gameengine_is_unlocked ? 'unlocked' : 'locked';
                    ?>
                        <div class="gameengine-lvl-node <?php echo esc_attr($gameengine_status_class); ?>">
                            <div class="gameengine-lvl-icon-wrap">
                                <?php if (!empty($gameengine_lvl->icon)): ?>
                                        <img src="<?php echo esc_url($gameengine_lvl->icon); ?>" alt=""
                                            style="width: 36px; height: 36px; object-fit: contain;">
                                <?php else: ?>
                                        <span>🏆</span>
                                <?php endif; ?>

                                <?php if (!$gameengine_is_unlocked): ?>
                                        <div class="gameengine-lock-icon">🔒</div>
                                <?php endif; ?>
                            </div>

                            <div class="gameengine-lvl-content">
                                <div class="gameengine-lvl-title-row">
                                    <span class="gameengine-lvl-title"><?php echo esc_html($gameengine_lvl->title); ?></span>
                                    <span class="gameengine-lvl-status-label">
                                        <?php $gameengine_is_unlocked ? esc_html_e('Unlocked', 'gameengine') : esc_html_e('Locked', 'gameengine'); ?>
                                    </span>
                                </div>

                                <?php if (!empty($gameengine_lvl->description)): ?>
                                        <div class="gameengine-lvl-description">
                                            <?php echo wp_kses_post($gameengine_lvl->description); ?>
                                        </div>
                                <?php endif; ?>

                                <div class="gameengine-lvl-meta">
                                    <?php if ($gameengine_is_unlocked): ?>
                                            <span class="gameengine-lvl-date">
                                                📅
                                                <?php echo esc_html(date_i18n(get_option('date_format'), strtotime($gameengine_lvl->achieved_at))); ?>
                                            </span>
                                    <?php else: ?>
                                            <span class="gameengine-lvl-points-target">
                                                🎯 <?php echo esc_html( number_format_i18n( (int) $gameengine_lvl->min_points ) ); ?> Points
                                            </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                <?php endforeach; ?>
        <?php else: ?>
                <p class="gameengine-empty-state">
                    <?php esc_html_e('No levels available yet.', 'gameengine'); ?>
                </p>
        <?php endif; ?>
    </div>
</div>