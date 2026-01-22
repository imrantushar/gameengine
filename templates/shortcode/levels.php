<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Template for [gamify_level] and Levels tab in profile.
 */
$levels_manager = new \Gamify\Classes\LevelsManager();
$user_id        = get_current_user_id();
$user_lvls      = $levels_manager->get_all_user_levels($user_id);
?>

<div class="gamify-level-list">
    <?php if (! empty($user_lvls)) : ?>
        <?php foreach ($user_lvls as $lvl) : ?>
            <div class="gamify-level-item">
                <div class="lvl-info-left">
                    <span class="lvl-icon">🏆</span>
                    <span class="lvl-name"><?php echo esc_html($lvl->title); ?></span>
                </div>
                <span class="lvl-date">
                    <?php echo esc_html(date_i18n(get_option('date_format'), strtotime($lvl->achieved_at))); ?>
                </span>
            </div>
        <?php endforeach; ?>
    <?php else : ?>
        <p class="gf-empty-state">
            <?php esc_html_e('No levels unlocked yet.', 'gamify'); ?>
        </p>
    <?php endif; ?>
</div>