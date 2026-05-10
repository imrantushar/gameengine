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
                <?php
                $gameengine_rank_icon = $gameengine_user_rank['icon'] ?? '';
                if (! empty($gameengine_rank_icon) && strpos($gameengine_rank_icon, 'dashicons-') === 0) {
                    wp_enqueue_style('dashicons');
                }
                ?>
                <span class="gameengine-rank-tag" style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;">
                    <?php if (! empty($gameengine_rank_icon) && strpos($gameengine_rank_icon, 'dashicons-') === 0) : ?>
                        <span class="dashicons <?php echo esc_attr($gameengine_rank_icon); ?>" style="font-size:16px;width:16px;height:16px;"></span>
                    <?php elseif (! empty($gameengine_rank_icon)) : ?>
                        <img src="<?php echo esc_url($gameengine_rank_icon); ?>" alt="" style="width:16px;height:16px;object-fit:contain;">
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

    <?php
    // Send Points (Pro Points Transfer)
    $gameengine_transfer_settings = get_option('gameengine_pro_transfer_settings', array());
    if (class_exists('\GameEngine\Pro\Pro_Init') && ! empty($gameengine_transfer_settings['enable_transfer'])) :
        $gameengine_point_types = \GameEngine\Classes\PointsManager::get_point_types();
    ?>
    <div class="gameengine-send-points" style="margin-top:24px;padding:20px;background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <h4 style="margin:0 0 16px;"><?php esc_html_e('Send Points', 'gameengine'); ?></h4>
        <div id="ge-transfer-msg" style="display:none;margin-bottom:12px;padding:8px 12px;border-radius:6px;font-size:13px;"></div>
        <form id="ge-transfer-form" style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
            <label style="font-size:13px;font-weight:500;">
                <?php esc_html_e('Recipient (username or email)', 'gameengine'); ?>
                <input type="text" id="ge-transfer-recipient" class="gameengine-input" style="margin-top:4px;width:100%;" placeholder="<?php esc_attr_e('Enter username or email', 'gameengine'); ?>" required>
            </label>
            <?php if (count((array) $gameengine_point_types) > 1) : ?>
            <label style="font-size:13px;font-weight:500;">
                <?php esc_html_e('Point Type', 'gameengine'); ?>
                <select id="ge-transfer-type" class="gameengine-input" style="margin-top:4px;width:100%;">
                    <?php foreach ((array) $gameengine_point_types as $gameengine_pt) : ?>
                    <option value="<?php echo esc_attr($gameengine_pt->id ?? $gameengine_pt['id'] ?? 1); ?>">
                        <?php echo esc_html($gameengine_pt->title ?? $gameengine_pt['title'] ?? ''); ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </label>
            <?php endif; ?>
            <label style="font-size:13px;font-weight:500;">
                <?php esc_html_e('Points Amount', 'gameengine'); ?>
                <input type="number" id="ge-transfer-points" class="gameengine-input" style="margin-top:4px;width:100%;" min="1" placeholder="<?php esc_attr_e('e.g. 100', 'gameengine'); ?>" required>
            </label>
            <label style="font-size:13px;font-weight:500;">
                <?php esc_html_e('Message (optional)', 'gameengine'); ?>
                <input type="text" id="ge-transfer-message" class="gameengine-input" style="margin-top:4px;width:100%;" placeholder="<?php esc_attr_e('A note to the recipient', 'gameengine'); ?>" maxlength="255">
            </label>
            <button type="submit" class="gameengine-btn gameengine-btn-primary" style="align-self:flex-start;">
                <?php esc_html_e('Send Points', 'gameengine'); ?>
            </button>
        </form>
    </div>
    <script>
    (function() {
        var form = document.getElementById('ge-transfer-form');
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var recipient = document.getElementById('ge-transfer-recipient').value.trim();
            var points    = parseInt(document.getElementById('ge-transfer-points').value, 10);
            var message   = document.getElementById('ge-transfer-message').value.trim();
            var typeEl    = document.getElementById('ge-transfer-type');
            var typeId    = typeEl ? parseInt(typeEl.value, 10) : 1;
            var msgEl     = document.getElementById('ge-transfer-msg');
            var btn       = form.querySelector('button[type="submit"]');
            btn.disabled  = true;

            var lookup = fetch('<?php echo esc_url(rest_url('wp/v2/users')); ?>?search=' + encodeURIComponent(recipient) + '&context=edit', {
                headers: { 'X-WP-Nonce': '<?php echo esc_js(wp_create_nonce('wp_rest')); ?>' }
            }).then(function(r) { return r.json(); });

            lookup.then(function(users) {
                var userId = (users && users.length) ? users[0].id : 0;
                if (!userId) throw new Error('<?php echo esc_js(__('Recipient not found.', 'gameengine')); ?>');
                return fetch('<?php echo esc_url(rest_url('gameengine/v1/pro/transfers')); ?>', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': '<?php echo esc_js(wp_create_nonce('wp_rest')); ?>' },
                    body: JSON.stringify({ to_user_id: userId, point_type_id: typeId, points: points, message: message })
                }).then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); });
            }).then(function(res) {
                msgEl.style.display = 'block';
                if (res.ok) {
                    msgEl.style.background = '#f0fdf4';
                    msgEl.style.color = '#166534';
                    msgEl.textContent = '<?php echo esc_js(__('Points sent successfully!', 'gameengine')); ?>';
                    form.reset();
                } else {
                    msgEl.style.background = '#fef2f2';
                    msgEl.style.color = '#991b1b';
                    msgEl.textContent = res.data.message || '<?php echo esc_js(__('An error occurred.', 'gameengine')); ?>';
                }
            }).catch(function(err) {
                msgEl.style.display = 'block';
                msgEl.style.background = '#fef2f2';
                msgEl.style.color = '#991b1b';
                msgEl.textContent = err.message || '<?php echo esc_js(__('An error occurred.', 'gameengine')); ?>';
            }).finally(function() {
                btn.disabled = false;
            });
        });
    })();
    </script>
    <?php endif; ?>
</div>