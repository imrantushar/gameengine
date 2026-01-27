<?php
if (! defined('ABSPATH')) exit;
global $wpdb;
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
                    <?php if (! empty($gameengine_ach['badge_image'])) : ?>
                        <img src="<?php echo esc_url($gameengine_ach['badge_image']); ?>" alt="<?php echo esc_attr($gameengine_ach['title']); ?>">
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
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>