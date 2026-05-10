<?php

namespace GameEngine\Admin;

if (! defined('ABSPATH')) {
    exit;
}

use GameEngine\Classes\PointsManager;

/**
 * Adds GameEngine section to WordPress User Profile page.
 */
class UserProfile
{
    /**
     * Initialize User Profile hooks.
     */
    public static function init()
    {
        $self = new self();
        add_action('show_user_profile', [$self, 'render_profile_fields']);
        add_action('edit_user_profile', [$self, 'render_profile_fields']);
        add_action('personal_options_update', [$self, 'save_profile_fields']);
        add_action('edit_user_profile_update', [$self, 'save_profile_fields']);
        add_action('admin_enqueue_scripts', [$self, 'enqueue_profile_styles']);
    }

    /**
     * Enqueue CSS for Profile Page
     */
    public function enqueue_profile_styles($hook)
    {
        if ('profile.php' !== $hook && 'user-edit.php' !== $hook) {
            return;
        }

        $css = "
            .gameengine-profile-section { margin-top: 30px; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .gameengine-items-grid { display: flex; gap: 20px; flex-wrap: wrap; background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; max-width: 700px; }
            .gameengine-item-box { text-align: center; width: 80px; }
            .gameengine-item-img { width: 50px; height: 50px; object-fit: contain; margin-bottom: 5px; display: block; margin: 0 auto; }
            .gameengine-item-placeholder { width: 50px; height: 50px; background: #f0f0f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-size: 20px; }
            .gameengine-item-title { display: block; font-weight: 500; font-size: 12px; line-height: 1.4; }
            .gameengine-item-sub { display: block; font-size: 11px; color: #888; }
            .gameengine-input-box { background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; max-width: 600px; }
            .gameengine-label-bold { font-weight: 600; display: block; margin-bottom: 5px; }
            .gameengine-readonly-points { font-size: 18px; font-weight: bold; color: #2271b1; }
            .gameengine-rank-icon { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 22px; color: #fff; font-weight: bold; }
            .gameengine-streak-card { background: #fff8f0; border: 1px solid #f0d9b5; border-radius: 6px; padding: 10px 14px; min-width: 140px; }
            .gameengine-streak-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
            .gameengine-streak-count { font-size: 20px; font-weight: bold; color: #e65c00; }
            .gameengine-streak-best { font-size: 11px; color: #888; margin-top: 2px; }
            .gameengine-streak-interval { font-size: 11px; color: #aaa; text-transform: capitalize; }
        ";

        wp_add_inline_style('admin-bar', $css);
    }

    /**
     * Render the custom profile fields.
     */
    public function render_profile_fields($user)
    {
        $user_id = $user->ID;

        $points       = $this->get_user_points($user_id);
        $achievements = $this->get_user_achievements($user_id);
        $levels       = $this->get_user_levels($user_id);
        $ranks        = $this->get_user_ranks($user_id);
        $streaks      = $this->get_user_streaks($user_id);

        $is_admin = current_user_can('manage_options');

        wp_nonce_field('gameengine_update_user_points', 'gameengine_points_nonce');
?>
        <h2 class="gameengine-profile-section"><?php esc_html_e('GameEngine Profile', 'gameengine'); ?></h2>

        <table class="form-table" role="presentation">
            <!-- Level Section -->
            <tr>
                <th><label><?php esc_html_e('Level', 'gameengine'); ?></label></th>
                <td>
                    <div class="gameengine-items-grid">
                        <?php if (!empty($levels)) : ?>
                            <?php foreach ($levels as $level) : ?>
                                <div class="gameengine-item-box">
                                    <?php if (!empty($level->icon)) : ?>
                                        <img src="<?php echo esc_url($level->icon); ?>" class="gameengine-item-img" alt="">
                                    <?php else : ?>
                                        <div class="gameengine-item-placeholder">🏆</div>
                                    <?php endif; ?>
                                    <span class="gameengine-item-title"><?php echo esc_html($level->title); ?></span>
                                </div>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <p class="description"><?php esc_html_e('No levels earned yet.', 'gameengine'); ?></p>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>

            <!-- Points Section -->
            <tr>
                <th><label for="gameengine_points"><?php esc_html_e('Points', 'gameengine'); ?></label></th>
                <td>
                    <div class="gameengine-input-box">
                        <label class="gameengine-label-bold"><?php esc_html_e('Total Points', 'gameengine'); ?></label>

                        <?php if ($is_admin) : ?>
                            <input type="number" name="gameengine_points" id="gameengine_points" value="<?php echo esc_attr($points); ?>" class="regular-text" />
                            <p class="description"><?php esc_html_e('Update user points manually. Differences will be logged.', 'gameengine'); ?></p>
                        <?php else : ?>
                            <span class="gameengine-readonly-points"><?php echo esc_html(number_format_i18n($points)); ?></span>
                            <p class="description"><?php esc_html_e('Your current total points.', 'gameengine'); ?></p>
                        <?php endif; ?>

                    </div>
                </td>
            </tr>

            <!-- Achievements Section -->
            <tr>
                <th><label><?php esc_html_e('Achievements', 'gameengine'); ?></label></th>
                <td>
                    <div class="gameengine-items-grid">
                        <?php if (!empty($achievements)) : ?>
                            <?php foreach ($achievements as $ach) : ?>
                                <div class="gameengine-item-box">
                                    <?php if (!empty($ach->badge_image)) : ?>
                                        <img src="<?php echo esc_url($ach->badge_image); ?>" class="gameengine-item-img" alt="">
                                    <?php else : ?>
                                        <div class="gameengine-item-placeholder">🎖️</div>
                                    <?php endif; ?>
                                    <span class="gameengine-item-title"><?php echo esc_html($ach->title); ?></span>
                                </div>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <p class="description"><?php esc_html_e('No achievements earned yet.', 'gameengine'); ?></p>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>

            <!-- Ranks Section -->
            <tr>
                <th><label><?php esc_html_e('Ranks', 'gameengine'); ?></label></th>
                <td>
                    <div class="gameengine-items-grid">
                        <?php if (!empty($ranks)) : ?>
                            <?php foreach ($ranks as $rank) : ?>
                                <div class="gameengine-item-box">
                                    <?php
                                    $rank_color = !empty($rank->color) ? $rank->color : '#6c5ce7';
                                    if (!empty($rank->icon) && strpos($rank->icon, 'dashicons-') === 0) : ?>
                                        <div class="gameengine-rank-icon" style="background-color: <?php echo esc_attr($rank_color); ?>;">
                                            <span class="<?php echo esc_attr($rank->icon); ?>" style="font-size:22px;color:#fff;"></span>
                                        </div>
                                    <?php elseif (!empty($rank->icon)) : ?>
                                        <img src="<?php echo esc_url($rank->icon); ?>" class="gameengine-item-img" alt="">
                                    <?php else : ?>
                                        <div class="gameengine-rank-icon" style="background-color: <?php echo esc_attr($rank_color); ?>;">
                                            <?php echo esc_html(mb_strtoupper(mb_substr($rank->title, 0, 1))); ?>
                                        </div>
                                    <?php endif; ?>
                                    <span class="gameengine-item-title"><?php echo esc_html($rank->title); ?></span>
                                    <span class="gameengine-item-sub"><?php echo esc_html(number_format_i18n((int) $rank->points_required)); ?> pts</span>
                                </div>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <p class="description"><?php esc_html_e('No ranks earned yet.', 'gameengine'); ?></p>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>

            <!-- Streaks Section -->
            <tr>
                <th><label><?php esc_html_e('Streaks', 'gameengine'); ?></label></th>
                <td>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; max-width: 700px;">
                        <?php if (!empty($streaks)) : ?>
                            <?php foreach ($streaks as $streak) : ?>
                                <div class="gameengine-streak-card">
                                    <div class="gameengine-streak-title"><?php echo esc_html($streak->title); ?></div>
                                    <div class="gameengine-streak-count">
                                        🔥 <?php
                                        /* translators: %d: streak count */
                                        printf(esc_html(_n('%d day', '%d days', (int) $streak->current_count, 'gameengine')), (int) $streak->current_count);
                                        ?>
                                    </div>
                                    <div class="gameengine-streak-best">
                                        <?php
                                        /* translators: %d: longest streak count */
                                        printf(esc_html__('Best: %d', 'gameengine'), (int) $streak->longest_count);
                                        ?>
                                    </div>
                                    <div class="gameengine-streak-interval"><?php echo esc_html($streak->interval_type); ?></div>
                                </div>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <p class="description"><?php esc_html_e('No active streaks.', 'gameengine'); ?></p>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>
        </table>
<?php
    }

    /**
     * Save the custom profile fields.
     */
    public function save_profile_fields($user_id)
    {
        if (! isset($_POST['gameengine_points_nonce']) || ! wp_verify_nonce(sanitize_key($_POST['gameengine_points_nonce']), 'gameengine_update_user_points')) {
            return false;
        }

        if (! current_user_can('manage_options') || ! current_user_can('edit_user', $user_id)) {
            return false;
        }

        if (isset($_POST['gameengine_points'])) {
            $new_points     = intval($_POST['gameengine_points']);
            $current_points = $this->get_user_points($user_id);
            $diff           = $new_points - $current_points;

            if ($diff !== 0) {
                $manager = new PointsManager();
                if ($diff > 0) {
                    $manager->add($user_id, $diff, 'manual_profile_update', ['description' => 'Updated via User Profile']);
                } else {
                    $manager->deduct($user_id, abs($diff), 'manual_profile_update', ['description' => 'Updated via User Profile']);
                }
            }
        }
    }

    private function get_user_points($user_id)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $total = $wpdb->get_var($wpdb->prepare("SELECT SUM(points) FROM {$wpdb->prefix}gameengine_points_log WHERE user_id = %d", (int) $user_id));
        return intval($total);
    }

    private function get_user_achievements($user_id)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        return $wpdb->get_results($wpdb->prepare(
            "SELECT a.title, a.badge_image FROM {$wpdb->prefix}gameengine_user_achievements ua
             JOIN {$wpdb->prefix}gameengine_achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = %d ORDER BY ua.achieved_at DESC",
            (int) $user_id
        ));
    }

    private function get_user_levels($user_id)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        return $wpdb->get_results($wpdb->prepare(
            "SELECT l.title, l.icon FROM {$wpdb->prefix}gameengine_user_levels ul
             JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id
             WHERE ul.user_id = %d ORDER BY ul.achieved_at DESC",
            (int) $user_id
        ));
    }

    private function get_user_ranks($user_id): array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_results($wpdb->prepare(
            "SELECT r.title, r.icon, r.color, r.points_required
             FROM {$wpdb->prefix}gameengine_user_ranks ur
             JOIN {$wpdb->prefix}gameengine_ranks r ON ur.rank_id = r.id
             WHERE ur.user_id = %d
             ORDER BY r.points_required DESC",
            (int) $user_id
        )) ?: array();
    }

    private function get_user_streaks($user_id): array
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_results($wpdb->prepare(
            "SELECT s.title, s.interval_type, us.current_count, us.longest_count
             FROM {$wpdb->prefix}gameengine_user_streaks us
             JOIN {$wpdb->prefix}gameengine_streaks s ON us.streak_id = s.id
             WHERE us.user_id = %d AND s.status = 'publish'
             ORDER BY us.current_count DESC",
            (int) $user_id
        )) ?: array();
    }
}
