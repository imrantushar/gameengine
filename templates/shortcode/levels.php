<?php
if (! defined('ABSPATH')) {
    exit;
}

$gamify_levels_manager = new \Gamify\Classes\LevelsManager();
$gamify_user_id        = get_current_user_id();
$gamify_user_lvls      = $gamify_levels_manager->get_all_user_levels($gamify_user_id);
?>
<div class="gamify-level-list">
    <?php if (! empty($gamify_user_lvls)) : ?>
        <?php foreach ($gamify_user_lvls as $gamify_lvl) : ?>
            <div class="gamify-level-item">
                <div class="lvl-info-left">
                    <span class="lvl-icon">🏆</span>
                    <span class="lvl-name"><?php echo esc_html($gamify_lvl->title); ?></span>
                </div>
                <span class="lvl-date">
                    <?php echo esc_html(date_i18n(get_option('date_format'), strtotime($gamify_lvl->achieved_at))); ?>
                </span>
            </div>
        <?php endforeach; ?>
    <?php else : ?>
        <p class="gf-empty-state">
            <?php esc_html_e('No levels unlocked yet.', 'gamify'); ?>
        </p>
    <?php endif; ?>
</div>