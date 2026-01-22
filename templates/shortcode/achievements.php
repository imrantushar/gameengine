<?php
if (! defined('ABSPATH')) {
    exit;
}

global $wpdb;
$gamify_current_user_id = get_current_user_id();

// Fetch and Cache all available achievements.
$gamify_all_ach_cache_key = 'gamify_all_achievements_list';
$gamify_all_achievements  = wp_cache_get($gamify_all_ach_cache_key, 'gamify');

if (false === $gamify_all_achievements) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $gamify_all_achievements = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A);
    wp_cache_set($gamify_all_ach_cache_key, $gamify_all_achievements, 'gamify', 3600);
}

//  Fetch and Cache earned achievement IDs for current user.
$gamify_user_earned_cache_key = 'gamify_user_earned_ids_' . $gamify_current_user_id;
$gamify_earned_ids            = wp_cache_get($gamify_user_earned_cache_key, 'gamify');

if (false === $gamify_earned_ids) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $gamify_earned_ids = $wpdb->get_col($wpdb->prepare("SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", (int) $gamify_current_user_id));
    wp_cache_set($gamify_user_earned_cache_key, $gamify_earned_ids, 'gamify', 600);
}

if (empty($gamify_all_achievements)) : ?>
    <p><?php esc_html_e('No achievements created yet.', 'gamify'); ?></p>
<?php else : ?>
    <div class="gamify-achievements-grid">
        <?php
        foreach ($gamify_all_achievements as $gamify_ach) :
            $gamify_is_earned    = in_array((string) $gamify_ach['id'], (array) $gamify_earned_ids, true);
            $gamify_status_class = $gamify_is_earned ? 'is-unlocked' : 'is-locked';
        ?>
            <div class="gamify-achievement-card <?php echo esc_attr($gamify_status_class); ?>">
                <div class="achievement-icon-box">
                    <?php if (! empty($gamify_ach['badge_image'])) : ?>
                        <img src="<?php echo esc_url($gamify_ach['badge_image']); ?>" alt="<?php echo esc_attr($gamify_ach['title']); ?>">
                    <?php else : ?>
                        <span class="default-icon">🏅</span>
                    <?php endif; ?>

                    <?php if (! $gamify_is_earned) : ?>
                        <div class="lock-overlay">🔒</div>
                    <?php endif; ?>
                </div>
                <div class="achievement-details">
                    <span class="ach-title"><?php echo esc_html($gamify_ach['title']); ?></span>
                    <?php if (! $gamify_is_earned && ! empty($gamify_ach['restriction_message'])) : ?>
                        <div class="ach-hint" title="<?php echo esc_attr($gamify_ach['restriction_message']); ?>">
                            ℹ️ <?php esc_html_e('How to unlock', 'gamify'); ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>