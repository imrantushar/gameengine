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
    <div class="gameengine-ui gameengine-achievements">
        <div class="gameengine-empty">
            <span class="gameengine-empty__icon"><?php \GameEngine\Icons::render('medal'); ?></span>
            <p class="gameengine-empty__title"><?php esc_html_e('No achievements created yet.', 'gameengine'); ?></p>
        </div>
    </div>
<?php else : ?>
    <?php
    $gameengine_earned_ids      = array_map('strval', (array) $gameengine_earned_ids);
    $gameengine_ach_total       = count($gameengine_all_achievements);
    $gameengine_ach_unlocked    = count(array_intersect(array_map('strval', wp_list_pluck($gameengine_all_achievements, 'id')), $gameengine_earned_ids));
    $gameengine_ach_unlocked_pc = (int) round(($gameengine_ach_unlocked / $gameengine_ach_total) * 100);
    ?>
    <div class="gameengine-ui gameengine-achievements">
        <div class="gameengine-achievements__summary">
            <p class="gameengine-achievements__count">
                <?php
                printf(
                    /* translators: 1: achievements the member has unlocked, 2: all achievements */
                    esc_html__('%1$s of %2$s unlocked', 'gameengine'),
                    '<strong>' . esc_html(number_format_i18n($gameengine_ach_unlocked)) . '</strong>',
                    esc_html(number_format_i18n($gameengine_ach_total))
                );
                ?>
            </p>
            <div class="gameengine-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="<?php echo esc_attr($gameengine_ach_unlocked_pc); ?>" aria-label="<?php esc_attr_e('Achievements unlocked', 'gameengine'); ?>">
                <span class="gameengine-progress__bar" style="width: <?php echo esc_attr($gameengine_ach_unlocked_pc); ?>%;"></span>
            </div>
        </div>

        <ul class="gameengine-achievement-grid">
            <?php
            foreach ($gameengine_all_achievements as $gameengine_ach) :
                $gameengine_is_earned = in_array((string) $gameengine_ach['id'], $gameengine_earned_ids, true);

                $gameengine_badge_icon = '';
                if (! empty($gameengine_ach['badge_id'])) {
                    $gameengine_badge_icon = get_post_meta((int) $gameengine_ach['badge_id'], '_ge_badge_icon', true);
                }
                $gameengine_is_dashicon = ! empty($gameengine_badge_icon) && strpos($gameengine_badge_icon, 'dashicons-') === 0;
                if ($gameengine_is_dashicon) {
                    wp_enqueue_style('dashicons');
                }
            ?>
                <li class="gameengine-achievement <?php echo $gameengine_is_earned ? 'gameengine-achievement--unlocked' : 'gameengine-achievement--locked'; ?>">
                    <span class="gameengine-achievement__media">
                        <?php if (! empty($gameengine_ach['badge_image'])) : ?>
                            <img src="<?php echo esc_url($gameengine_ach['badge_image']); ?>" alt="" loading="lazy">
                        <?php elseif ($gameengine_is_dashicon) : ?>
                            <span class="dashicons <?php echo esc_attr($gameengine_badge_icon); ?>" aria-hidden="true"></span>
                        <?php elseif (! empty($gameengine_badge_icon)) : ?>
                            <img src="<?php echo esc_url($gameengine_badge_icon); ?>" alt="" loading="lazy">
                        <?php else : ?>
                            <?php \GameEngine\Icons::render('medal'); ?>
                        <?php endif; ?>

                        <?php if (! $gameengine_is_earned) : ?>
                            <span class="gameengine-achievement__lock"><?php \GameEngine\Icons::render('lock'); ?></span>
                        <?php endif; ?>
                    </span>

                    <h4 class="gameengine-achievement__title"><?php echo esc_html($gameengine_ach['title']); ?></h4>

                    <?php if (! $gameengine_is_earned && ! empty($gameengine_ach['restriction_message'])) : ?>
                        <p class="gameengine-achievement__hint"><?php echo esc_html($gameengine_ach['restriction_message']); ?></p>
                    <?php endif; ?>

                    <div class="gameengine-achievement__footer">
                        <?php if ($gameengine_is_earned) : ?>
                            <span class="gameengine-badge gameengine-badge--success"><?php \GameEngine\Icons::render('check'); ?><?php esc_html_e('Unlocked', 'gameengine'); ?></span>
                        <?php else : ?>
                            <span class="gameengine-badge"><?php esc_html_e('Locked', 'gameengine'); ?></span>
                        <?php endif; ?>

                        <?php if ($gameengine_is_earned && $gameengine_ach_sharing_enabled && ! empty($gameengine_ach['slug'])) : ?>
                            <a
                                class="gameengine-button gameengine-button--ghost gameengine-button--sm"
                                href="<?php echo esc_url(add_query_arg('gameengine_achievement', $gameengine_ach['slug'], home_url('/'))); ?>"
                                data-gameengine-share="<?php echo esc_attr($gameengine_ach['title']); ?>"
                            >
                                <?php \GameEngine\Icons::render('share'); ?>
                                <span data-gameengine-share-label><?php esc_html_e('Share', 'gameengine'); ?></span>
                            </a>
                        <?php endif; ?>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>
