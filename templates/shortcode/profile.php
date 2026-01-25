<?php
if (! defined('ABSPATH')) {
    exit;
}

$gameengine_user_id        = get_current_user_id();
$gameengine_user_data      = get_userdata($gameengine_user_id);
$gameengine_points_manager = new \GameEngine\Classes\PointsManager();
$gameengine_points_total   = $gameengine_points_manager->get_grand_total($gameengine_user_id);
?>
<div class="gameengine-dashboard">
    <div class="gameengine-header">
        <div class="gameengine-user-meta-info">
            <?php echo wp_kses_post(get_avatar($gameengine_user_id, 60)); ?>
            <div class="gameengine-user-details">
                <h3><?php echo esc_html($gameengine_user_data->display_name); ?></h3>
                <span class="gameengine-points-tag">🪙 <?php echo esc_html(number_format_i18n($gameengine_points_total)); ?> <?php esc_html_e('Points', 'gameengine'); ?></span>
            </div>
        </div>
        <div class="gameengine-header-actions">
            <div class="gameengine-notification-bell" title="<?php echo esc_attr__('Notifications', 'gameengine'); ?>">
                <span>🔔</span>
                <span class="noti-dot"></span>
            </div>
        </div>
    </div>

    <div class="gameengine-main-layout">
        <div class="gameengine-sidebar">
            <button class="gameengine-tab-btn active" data-tab="progress-map">
                <span class="icon">🗺️</span> <?php esc_html_e('Progress Map', 'gameengine'); ?>
            </button>
            <button class="gameengine-tab-btn" data-tab="achievements">
                <span class="icon">🏅</span> <?php esc_html_e('Achievements', 'gameengine'); ?>
            </button>
            <button class="gameengine-tab-btn" data-tab="levels">
                <span class="icon">🏆</span> <?php esc_html_e('Levels', 'gameengine'); ?>
            </button>
        </div>

        <div class="gameengine-content-area">
            <div class="gameengine-tab-content active" id="progress-map">
                <?php
                if (class_exists('\GameEngine\Addons\ProgressMap\Progress_Map_Logic')) {
                    echo \GameEngine\Addons\ProgressMap\Progress_Map_Logic::render_html($gameengine_user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                }
                ?>
            </div>
            <div class="gameengine-tab-content" id="achievements">
                <h4><?php esc_html_e('Badges & Achievements', 'gameengine'); ?></h4>
                <?php \GameEngine\Helper::get_template('shortcode/achievements.php'); ?>
            </div>
            <div class="gameengine-tab-content" id="levels">
                <h4><?php esc_html_e('Your Progression', 'gameengine'); ?></h4>
                <?php \GameEngine\Helper::get_template('shortcode/levels.php'); ?>
            </div>
        </div>
    </div>
</div>