<?php
if (! defined('ABSPATH')) {
    exit;
}

$gamify_user_id        = get_current_user_id();
$gamify_user_data      = get_userdata($gamify_user_id);
$gamify_points_manager = new \Gamify\Classes\PointsManager();
$gamify_points_total   = $gamify_points_manager->get_grand_total($gamify_user_id);
?>
<div class="gamify-dashboard">
    <div class="gamify-header">
        <div class="gamify-user-meta-info">
            <?php echo wp_kses_post(get_avatar($gamify_user_id, 60)); ?>
            <div class="gamify-user-details">
                <h3><?php echo esc_html($gamify_user_data->display_name); ?></h3>
                <span class="gamify-points-tag">🪙 <?php echo esc_html(number_format_i18n($gamify_points_total)); ?> <?php esc_html_e('Points', 'gamify'); ?></span>
            </div>
        </div>
        <div class="gamify-header-actions">
            <div class="gamify-notification-bell" title="<?php echo esc_attr__('Notifications', 'gamify'); ?>">
                <span>🔔</span>
                <span class="noti-dot"></span>
            </div>
        </div>
    </div>

    <div class="gamify-main-layout">
        <div class="gamify-sidebar">
            <button class="gamify-tab-btn active" data-tab="progress-map">
                <span class="icon">🗺️</span> <?php esc_html_e('Progress Map', 'gamify'); ?>
            </button>
            <button class="gamify-tab-btn" data-tab="achievements">
                <span class="icon">🏅</span> <?php esc_html_e('Achievements', 'gamify'); ?>
            </button>
            <button class="gamify-tab-btn" data-tab="levels">
                <span class="icon">🏆</span> <?php esc_html_e('Levels', 'gamify'); ?>
            </button>
        </div>

        <div class="gamify-content-area">
            <div class="gamify-tab-content active" id="progress-map">
                <?php
                if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) {
                    echo \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html($gamify_user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                }
                ?>
            </div>
            <div class="gamify-tab-content" id="achievements">
                <h4><?php esc_html_e('Badges & Achievements', 'gamify'); ?></h4>
                <?php \Gamify\Helper::get_template('shortcode/achievements.php'); ?>
            </div>
            <div class="gamify-tab-content" id="levels">
                <h4><?php esc_html_e('Your Progression', 'gamify'); ?></h4>
                <?php \Gamify\Helper::get_template('shortcode/levels.php'); ?>
            </div>
        </div>
    </div>
</div>