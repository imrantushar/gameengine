<?php
if (! defined('ABSPATH')) exit;
$gameengine_user_id        = get_current_user_id();
$gameengine_user_data      = get_userdata($gameengine_user_id);
$gameengine_points_manager = new \GameEngine\Classes\PointsManager();
$gameengine_points_total   = $gameengine_points_manager->get_grand_total($gameengine_user_id);

// Rank display (task 5.4).
$gameengine_user_rank  = null;
if (class_exists('\GameEngine\Classes\RanksManager')) {
    $gameengine_user_rank = \GameEngine\Classes\RanksManager::get_user_rank($gameengine_user_id);
}

// User streaks (task 11.5).
$gameengine_user_streaks = array();
if (class_exists('\GameEngine\Classes\StreaksManager')) {
    $gameengine_user_streaks = \GameEngine\Classes\StreaksManager::get_user_streaks($gameengine_user_id);
}

// Social sharing toggle (task 18.3).
$gameengine_general_settings = get_option('gameengine_general_settings', array());
$gameengine_social_sharing   = ! isset($gameengine_general_settings['social_sharing']) || ! empty($gameengine_general_settings['social_sharing']);
?>
<div class="gameengine-dashboard">
    <div class="gameengine-header">
        <div class="gameengine-user-meta-info">
            <?php echo wp_kses_post(get_avatar($gameengine_user_id, 60)); ?>
            <div class="gameengine-user-details">
                <h3><?php echo esc_html($gameengine_user_data->display_name); ?></h3>
                <span class="gameengine-points-tag">🪙 <?php echo esc_html(number_format_i18n($gameengine_points_total)); ?> <?php esc_html_e('Points', 'gameengine'); ?></span>
                <?php if ($gameengine_user_rank) : ?>
                <span class="gameengine-rank-tag" style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;">
                    <?php if (! empty($gameengine_user_rank['icon'])) : ?>
                        <img src="<?php echo esc_url($gameengine_user_rank['icon']); ?>" alt="" style="width:16px;height:16px;object-fit:contain;">
                    <?php else : ?>
                        🎖️
                    <?php endif; ?>
                    <?php echo esc_html($gameengine_user_rank['title']); ?>
                </span>
                <?php endif; ?>
            </div>
        </div>
        <div class="gameengine-header-actions">
            <div class="gameengine-header-tabs">
                <button class="gameengine-tab-btn gameengine-active" data-tab="progress-map">
                    <span class="gameengine-icon">🗺️</span> <?php esc_html_e('Progress Map', 'gameengine'); ?>
                </button>
                <button class="gameengine-tab-btn" data-tab="achievements">
                    <span class="gameengine-icon">🏅</span> <?php esc_html_e('Achievements', 'gameengine'); ?>
                </button>
                <button class="gameengine-tab-btn" data-tab="levels">
                    <span class="gameengine-icon">🏆</span> <?php esc_html_e('Levels', 'gameengine'); ?>
                </button>
                <?php if (! empty($gameengine_user_streaks)) : ?>
                <button class="gameengine-tab-btn" data-tab="streaks">
                    <span class="gameengine-icon">🔥</span> <?php esc_html_e('Streaks', 'gameengine'); ?>
                </button>
                <?php endif; ?>
            </div>
            <!-- Notification Bell Removed -->
        </div>
    </div>

    <div class="gameengine-main-layout">

        <div class="gameengine-content-area">
            <div class="gameengine-tab-content gameengine-active" id="progress-map">
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
            <?php if (! empty($gameengine_user_streaks)) : ?>
            <div class="gameengine-tab-content" id="streaks">
                <h4><?php esc_html_e('Your Streaks', 'gameengine'); ?></h4>
                <div class="gameengine-streaks-list">
                    <?php foreach ($gameengine_user_streaks as $gameengine_streak) : ?>
                    <div class="gameengine-streak-item" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                        <span style="font-size:24px;">🔥</span>
                        <div>
                            <strong><?php echo esc_html($gameengine_streak['title'] ?? ''); ?></strong>
                            <div style="font-size:13px;color:#666;">
                                <?php
                                printf(
                                    /* translators: %s: streak count number */
                                    esc_html__('%s day streak', 'gameengine'),
                                    esc_html(number_format_i18n($gameengine_streak['current_count'] ?? 0))
                                );
                                ?>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>