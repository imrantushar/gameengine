<?php
if (! defined('ABSPATH')) exit;

global $wpdb;
$user_id = get_current_user_id();
$all_achievements = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A);
$earned_ids = $wpdb->get_col($wpdb->prepare("SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", $user_id));

if (empty($all_achievements)) : ?>
    <p><?php esc_html_e('No achievements created yet.', 'gamify'); ?></p>
<?php else : ?>
    <div class="gamify-achievements-grid-v3">
        <?php foreach ($all_achievements as $ach) :
            $is_earned = in_array((string) $ach['id'], $earned_ids, true);
            $status_class = $is_earned ? 'is-unlocked' : 'is-locked';
        ?>
            <div class="gamify-achievement-card <?php echo esc_attr($status_class); ?>">
                <div class="achievement-icon-box">
                    <?php if (! empty($ach['badge_image'])) : ?>
                        <img src="<?php echo esc_url($ach['badge_image']); ?>" alt="<?php echo esc_attr($ach['title']); ?>">
                    <?php else : ?>
                        <span class="default-icon">🏅</span>
                    <?php endif; ?>
                    <?php if (! $is_earned) : ?><div class="lock-overlay">🔒</div><?php endif; ?>
                </div>
                <div class="achievement-details">
                    <span class="ach-title"><?php echo esc_html($ach['title']); ?></span>
                    <?php if (! $is_earned && ! empty($ach['restriction_message'])) : ?>
                        <div class="ach-hint" title="<?php echo esc_attr($ach['restriction_message']); ?>">
                            ℹ️ <?php esc_html_e('How to unlock', 'gamify'); ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>