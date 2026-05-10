<?php
if (! defined('ABSPATH')) exit;
global $wpdb;
$gameengine_ach_general_settings = get_option('gameengine_general_settings', array());
$gameengine_ach_sharing_enabled  = ! isset($gameengine_ach_general_settings['social_sharing']) || ! empty($gameengine_ach_general_settings['social_sharing']);
$gameengine_current_user_id = get_current_user_id();

$gameengine_all_ach_cache_key = 'gameengine_all_achievements_list';
$gameengine_all_achievements  = wp_cache_get($gameengine_all_ach_cache_key, 'gameengine');

if (false === $gameengine_all_achievements) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $gameengine_all_achievements = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gameengine_achievements ORDER BY created_at ASC", ARRAY_A);
    wp_cache_set($gameengine_all_ach_cache_key, $gameengine_all_achievements, 'gameengine', 3600);
}

$gameengine_user_earned_cache_key = 'gameengine_user_earned_ids_' . $gameengine_current_user_id;
$gameengine_earned_ids            = wp_cache_get($gameengine_user_earned_cache_key, 'gameengine');

if (false === $gameengine_earned_ids) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $gameengine_earned_ids = $wpdb->get_col($wpdb->prepare("SELECT achievement_id FROM {$wpdb->prefix}gameengine_user_achievements WHERE user_id = %d", (int) $gameengine_current_user_id));
    wp_cache_set($gameengine_user_earned_cache_key, $gameengine_earned_ids, 'gameengine', 600);
}

if (empty($gameengine_all_achievements)) : ?>
    <p><?php esc_html_e('No achievements created yet.', 'gameengine'); ?></p>
<?php else : ?>
    <div class="gameengine-achievements-grid">
        <?php
        foreach ($gameengine_all_achievements as $gameengine_ach) :
            $gameengine_is_earned    = in_array((string) $gameengine_ach['id'], (array) $gameengine_earned_ids, true);
            $gameengine_status_class = $gameengine_is_earned ? 'gameengine-is-unlocked' : 'gameengine-is-locked';
        ?>
            <div class="gameengine-achievement-card <?php echo esc_attr($gameengine_status_class); ?>">
                <div class="gameengine-achievement-icon-box">
                    <?php
                    $gameengine_badge_icon = '';
                    if (! empty($gameengine_ach['badge_id'])) {
                        $gameengine_badge_icon = get_post_meta((int) $gameengine_ach['badge_id'], '_ge_badge_icon', true);
                    }
                    if (! empty($gameengine_badge_icon) && strpos($gameengine_badge_icon, 'dashicons-') === 0) {
                        wp_enqueue_style('dashicons');
                    }
                    ?>
                    <?php if (! empty($gameengine_ach['badge_image'])) : ?>
                        <img src="<?php echo esc_url($gameengine_ach['badge_image']); ?>" alt="<?php echo esc_attr($gameengine_ach['title']); ?>">
                    <?php elseif (! empty($gameengine_badge_icon) && strpos($gameengine_badge_icon, 'dashicons-') === 0) : ?>
                        <span class="dashicons <?php echo esc_attr($gameengine_badge_icon); ?>" style="font-size:32px;width:32px;height:32px;"></span>
                    <?php elseif (! empty($gameengine_badge_icon)) : ?>
                        <img src="<?php echo esc_url($gameengine_badge_icon); ?>" alt="<?php echo esc_attr($gameengine_ach['title']); ?>">
                    <?php else : ?>
                        <span class="gameengine-default-icon">🏅</span>
                    <?php endif; ?>

                    <?php if (! $gameengine_is_earned) : ?>
                        <div class="gameengine-lock-overlay">🔒</div>
                    <?php endif; ?>
                </div>
                <div class="gameengine-achievement-details">
                    <span class="gameengine-ach-title"><?php echo esc_html($gameengine_ach['title']); ?></span>
                    <?php if (! $gameengine_is_earned && ! empty($gameengine_ach['restriction_message'])) : ?>
                        <div class="gameengine-ach-hint" title="<?php echo esc_attr($gameengine_ach['restriction_message']); ?>">
                            ℹ️ <?php esc_html_e('How to unlock', 'gameengine'); ?>
                        </div>
                    <?php endif; ?>
                    <?php if ($gameengine_is_earned && $gameengine_ach_sharing_enabled && ! empty($gameengine_ach['slug'])) : ?>
                        <a
                            href="<?php echo esc_url(add_query_arg('gameengine_achievement', esc_attr($gameengine_ach['slug']), home_url('/'))); ?>"
                            class="gameengine-share-link"
                            style="font-size:11px;color:#6c5ce7;text-decoration:none;display:inline-flex;align-items:center;gap:3px;margin-top:4px;"
                            onclick="event.preventDefault();if(navigator.share){navigator.share({title:<?php echo wp_json_encode($gameengine_ach['title']); ?>,url:this.href});}else{navigator.clipboard&&navigator.clipboard.writeText(this.href);this.textContent='✓ Copied!';}"
                        >
                            🔗 <?php esc_html_e('Share', 'gameengine'); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>