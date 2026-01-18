<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\LevelsManager;

/**
 * Class Shortcodes
 * Handles frontend display via modern styled WordPress shortcodes.
 */
class Shortcodes
{

    /**
     * Initialize Shortcodes.
     */
    public static function init()
    {
        $self = new self();
        add_shortcode('gamify_profile', array($self, 'render_profile'));
        add_shortcode('gamify_points', array($self, 'render_points'));
        add_shortcode('gamify_achievements', array($self, 'render_achievements'));
        add_shortcode('gamify_level', array($self, 'render_level'));
        add_shortcode('gamify_progress_map', array($self, 'render_progress_map')); // 🔥 নতুন শর্টকোড
    }

    /**
     * [gamify_profile] - Full modern dashboard.
     */
    public function render_profile($atts)
    {
        if (! is_user_logged_in()) {
            return '';
        }

        $user_id   = get_current_user_id();
        $user_data = get_userdata($user_id);

        $points_manager       = new PointsManager();
        $achievements_manager = new AchievementsManager();
        $levels_manager       = new LevelsManager();

        $points     = $points_manager->get_grand_total($user_id);
        $badges     = $achievements_manager->get_user_achievements($user_id);
        $all_levels = $levels_manager->get_all_user_levels($user_id);

        ob_start();
?>
        <div class="gamify-dashboard-v3">
            <div class="gamify-v3-header">
                <div class="gamify-v3-user">
                    <?php echo get_avatar($user_id, 60); ?>
                    <div class="gamify-v3-user-info">
                        <h3><?php echo esc_html($user_data->display_name); ?></h3>
                        <span class="gamify-v3-points-tag">🪙 <?php echo number_format_i18n($points); ?> <?php _e('Points', 'gamify'); ?></span>
                    </div>
                </div>
                <div class="gamify-v3-actions">
                    <div class="gamify-notification-bell">
                        <span>🔔</span>
                        <span class="noti-dot"></span>
                    </div>
                </div>
            </div>

            <div class="gamify-v3-main">
                <div class="gamify-v3-sidebar">
                    <button class="gamify-tab-btn active" data-tab="progress-map">
                        <span class="icon">🗺️</span> <?php _e('Progress Map', 'gamify'); ?>
                    </button>
                    <button class="gamify-tab-btn" data-tab="achievements">
                        <span class="icon">🏅</span> <?php _e('Achievements', 'gamify'); ?>
                    </button>
                    <button class="gamify-tab-btn" data-tab="levels">
                        <span class="icon">🏆</span> <?php _e('Levels', 'gamify'); ?>
                    </button>
                </div>

                <div class="gamify-v3-content">
                    <div class="gamify-tab-content active" id="progress-map">
                        <?php
                        if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) {
                            echo \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html($user_id);
                        }
                        ?>
                    </div>

                    <div class="gamify-tab-content" id="achievements">
                        <h4><?php _e('My Achievements', 'gamify'); ?></h4>
                        <div class="gamify-v3-badge-grid">
                            <?php if (! empty($badges)) : ?>
                                <?php foreach ($badges as $badge) : ?>
                                    <div class="badge-card">
                                        <img src="<?php echo esc_url($badge['badge_image'] ?: GAMIFY_URL . 'assets/images/default.png'); ?>">
                                        <p><?php echo esc_html($badge['title']); ?></p>
                                    </div>
                                <?php endforeach; ?>
                            <?php else : ?>
                                <p><?php _e('No achievements yet.', 'gamify'); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="gamify-tab-content" id="levels">
                        <h4><?php _e('Unlocked Levels', 'gamify'); ?></h4>
                        <div class="gamify-level-list">
                            <?php foreach ($all_levels as $lvl) : ?>
                                <div class="gamify-level-item">
                                    <span class="lvl-icon">🏆</span>
                                    <span class="lvl-name"><?php echo esc_html($lvl->title); ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php
        return ob_get_clean();
    }

    /**
     * [gamify_points] - Styled point display.
     */
    public function render_points()
    {
        if (! is_user_logged_in()) {
            return '0';
        }
        $manager = new PointsManager();
        $points  = $manager->get_grand_total(get_current_user_id());
        return sprintf(
            '<span class="gamify-pill-points"><span class="icon">🪙</span> %s %s</span>',
            number_format_i18n($points),
            __('Points', 'gamify')
        );
    }

    /**
     * [gamify_level] - Styled level display with icon.
     */
    public function render_level()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        $manager = new LevelsManager();
        $levels  = $manager->get_all_user_levels(get_current_user_id());

        if (empty($levels)) {
            return sprintf('<span class="gamify-pill-level no-lvl">%s</span>', __('No Level', 'gamify'));
        }

        // Get the highest level (assuming last one is highest)
        $current = end($levels);

        return sprintf(
            '<div class="gamify-pill-level">
                <span class="lvl-icon">🏆</span>
                <span class="lvl-text">%s</span>
            </div>',
            esc_html($current->title)
        );
    }

    /**
     * [gamify_achievements] - Clean responsive grid of badges.
     */
    public function render_achievements()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        $manager = new AchievementsManager();
        $badges  = $manager->get_user_achievements(get_current_user_id());

        if (empty($badges)) {
            return sprintf('<p class="gamify-empty-msg">%s</p>', __('No achievements earned yet.', 'gamify'));
        }

        ob_start();
    ?>
        <div class="gamify-badges-grid-standalone">
            <?php foreach ($badges as $badge) : ?>
                <div class="gamify-standalone-badge" title="<?php echo esc_attr($badge['title']); ?>">
                    <div class="badge-wrapper">
                        <?php if (! empty($badge['badge_image'])) : ?>
                            <img src="<?php echo esc_url($badge['badge_image']); ?>" alt="">
                        <?php else : ?>
                            <span class="badge-default">🏅</span>
                        <?php endif; ?>
                    </div>
                    <span class="badge-title"><?php echo esc_html($badge['title']); ?></span>
                </div>
            <?php endforeach; ?>
        </div>
<?php
        return ob_get_clean();
    }

    /**
     * [gamify_progress_map] - Dedicated shortcode for roadmap.
     */
    public function render_progress_map()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) {
            return \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html(get_current_user_id());
        }
        return sprintf('<p>%s</p>', __('Progress Map addon is not active.', 'gamify'));
    }
}
