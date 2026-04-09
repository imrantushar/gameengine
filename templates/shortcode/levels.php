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
<style>
    /* GameEngine Level Roadmap Styles */
    .gameengine-level-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        max-width: 100%;
        margin: 0 auto;
        color: #334155;
    }

    .gameengine-progress-section {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 32px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }

    .gameengine-progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .gameengine-progress-title {
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .gameengine-progress-value {
        font-size: 14px;
        font-weight: 800;
        color: #3b82f6;
        background: #fff;
        padding: 2px 10px;
        border-radius: 99px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .gameengine-progress-bar-bg {
        background: #e2e8f0;
        height: 12px;
        border-radius: 999px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(0, 0, 0, 0.03);
    }

    .gameengine-progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
        transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-radius: 999px;
    }

    .gameengine-next-lvl-msg {
        margin-top: 16px;
        font-size: 14px;
        color: #475569;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .gameengine-next-lvl-msg strong {
        color: #1e293b;
        font-weight: 700;
    }

    .gameengine-lvl-roadmap {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 24px;
    }

    .gameengine-lvl-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 30px 20px;
        border-radius: 20px;
        background: #fff;
        border: 1px solid #e2e8f0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        height: 100%;
        box-sizing: border-box;
    }

    .gameengine-lvl-node.unlocked {
        border-top: 6px solid #3b82f6;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.03);
    }

    .gameengine-lvl-node.locked {
        background: #fafafa;
        border-top: 6px solid #cbd5e1;
        opacity: 0.9;
    }

    .gameengine-lvl-node.locked::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
    }

    .gameengine-lvl-node:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        border-color: #cbd5e1;
    }

    .gameengine-lvl-icon-wrap {
        width: 70px;
        height: 70px;
        min-width: 70px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        position: relative;
        z-index: 2;
        transition: transform 0.3s ease;
        margin-bottom: 20px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .gameengine-lvl-node:hover .gameengine-lvl-icon-wrap {
        transform: scale(1.1) rotate(5deg);
    }

    .unlocked .gameengine-lvl-icon-wrap {
        background: #ecfdf5;
        color: #3b82f6;
        border: 2px solid #3b82f6;
    }

    .locked .gameengine-lvl-icon-wrap {
        background: #f1f5f9;
        color: #94a3b8;
        filter: grayscale(1);
        border: 2px solid #e2e8f0;
    }

    .gameengine-lock-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #ef4444;
        color: #fff;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .gameengine-lvl-content {
        width: 100%;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .gameengine-lvl-title-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        width: 100%;
    }

    .gameengine-lvl-title {
        font-weight: 800;
        font-size: 20px;
        color: #1e293b;
        letter-spacing: -0.025em;
        line-height: 1.2;
    }

    .gameengine-lvl-status-label {
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 99px;
        letter-spacing: 0.08em;
        width: fit-content;
    }

    .unlocked .gameengine-lvl-status-label {
        background: #3b82f6;
        color: #fff;
    }

    .locked .gameengine-lvl-status-label {
        background: #e2e8f0;
        color: #64748b;
    }

    .gameengine-lvl-description {
        font-size: 14px;
        color: #475569;
        margin: 10px 0 20px 0;
        line-height: 1.5;
        min-height: 42px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .gameengine-lvl-meta {
        font-size: 13px;
        color: #64748b;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: auto;
        width: 100%;
    }

    .gameengine-lvl-date {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #f8fafc;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .gameengine-lvl-points-target {
        font-weight: 700;
        color: #3b82f6;
        background: #eff6ff;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid #dbeafe;
    }
</style>

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
                            '<strong>' . number_format_i18n($gameengine_next_lvl_data['points_needed']) . '</strong>',
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
                                                🎯 <?php echo number_format_i18n((int) $gameengine_lvl->min_points); ?> Points
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