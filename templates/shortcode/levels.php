<?php
if (! defined('ABSPATH')) exit;
$gameengine_levels_manager = new \GameEngine\Classes\LevelsManager();
$gameengine_user_id        = get_current_user_id();
$gameengine_user_lvls      = $gameengine_levels_manager->get_all_user_levels($gameengine_user_id);
?>
<div class="gameengine-level-list">
    <?php if (! empty($gameengine_user_lvls)) : ?>
        <?php foreach ($gameengine_user_lvls as $gameengine_lvl) : ?>
            <div class="gameengine-level-item">
                <div class="gameengine-lvl-info-left">
                    <span class="gameengine-lvl-icon">🏆</span>
                    <span class="gameengine-lvl-name"><?php echo esc_html($gameengine_lvl->title); ?></span>
                </div>
                <span class="gameengine-lvl-date">
                    <?php
                    $gameengine_achieved_at = isset($gameengine_lvl->achieved_at) ? $gameengine_lvl->achieved_at : '';
                    if (! empty($gameengine_achieved_at)) {
                        $gameengine_ts = strtotime($gameengine_achieved_at);
                        echo (false !== $gameengine_ts) ? esc_html(date_i18n(get_option('date_format'), $gameengine_ts)) : esc_html__('—', 'gameengine');
                    } else {
                        echo esc_html__('—', 'gameengine');
                    }
                    ?>
                </span>
            </div>
        <?php endforeach; ?>
    <?php else : ?>
        <p class="gameengine-empty-state">
            <?php esc_html_e('No levels unlocked yet.', 'gameengine'); ?>
        </p>
    <?php endif; ?>
</div>