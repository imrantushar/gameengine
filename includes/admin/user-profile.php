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
            .gameengine-items-grid { display: flex; gap: 20px; flex-wrap: wrap; background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; max-width: 600px; }
            .gameengine-item-box { text-align: center; width: 80px; }
            .gameengine-item-img { width: 50px; height: 50px; object-fit: contain; margin-bottom: 5px; display: block; margin: 0 auto; }
            .gameengine-item-placeholder { width: 50px; height: 50px; background: #f0f0f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-size: 20px; }
            .gameengine-item-title { display: block; font-weight: 500; font-size: 12px; line-height: 1.4; }
            .gameengine-input-box { background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; max-width: 600px; }
            .gameengine-label-bold { font-weight: 600; display: block; margin-bottom: 5px; }
            .gameengine-readonly-points { font-size: 18px; font-weight: bold; color: #2271b1; }
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

        $is_admin = current_user_can('manage_options');


        // Add Nonce for security
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
        </table>
<?php
    }

    /**
     * Save the custom profile fields.
     */
    public function save_profile_fields($user_id)
    {
        //  Nonce Verification
        if (! isset($_POST['gameengine_points_nonce']) || ! wp_verify_nonce(sanitize_key($_POST['gameengine_points_nonce']), 'gameengine_update_user_points')) {
            return false;
        }

        //  Permission Check
        if (! current_user_can('manage_options') || ! current_user_can('edit_user', $user_id)) {
            return false;
        }

        //  Handle Points Update
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
}
