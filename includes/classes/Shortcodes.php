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
 * Handles frontend display via WordPress shortcodes.
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
    }

    /**
     * [gamify_profile] - Displays a modern user dashboard including progress map.
     *
     * @return string HTML Output.
     */
    public function render_profile()
    {
        if (! is_user_logged_in()) {
            return sprintf('<p>%s</p>', __('Please log in to view your profile.', 'gamify'));
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
        <div class="gamify-user-profile-card">
            <!-- Header Section -->
            <div class="gamify-profile-header">
                <div class="gamify-profile-user">
                    <div class="gamify-avatar">
                        <?php echo get_avatar($user_id, 80); ?>
                    </div>
                    <div class="gamify-details">
                        <h3 class="gamify-username"><?php echo esc_html($user_data->display_name); ?></h3>
                        <p class="gamify-points-total">
                            <span class="gamify-icon">🪙</span>
                            <strong><?php echo esc_html(number_format_i18n($points)); ?></strong> <?php _e('Points Earned', 'gamify'); ?>
                        </p>
                    </div>
                </div>

                <!-- Notification Bell Placeholder -->
                <div class="gamify-notifications">
                    <div class="gamify-bell-icon" title="<?php esc_attr_e('Notifications', 'gamify'); ?>">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span class="gamify-bell-dot"></span>
                    </div>
                </div>
            </div>

            <!-- Journey / Progress Map Section -->
            <?php if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) : ?>
                <div class="gamify-profile-journey">
                    <?php echo \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html($user_id); ?>
                </div>
            <?php endif; ?>

            <!-- Achievements Section -->
            <div class="gamify-profile-achievements">
                <h4 class="gamify-sub-title"><?php _e('My Badges', 'gamify'); ?></h4>
                <?php if (! empty($badges)) : ?>
                    <div class="gamify-badges-list">
                        <?php foreach ($badges as $badge) : ?>
                            <div class="gamify-badge-card" title="<?php echo esc_attr($badge['title']); ?>">
                                <div class="gamify-badge-img">
                                    <?php if (! empty($badge['badge_image'])) : ?>
                                        <img src="<?php echo esc_url($badge['badge_image']); ?>" alt="">
                                    <?php else : ?>
                                        <span class="gamify-badge-placeholder">🎖️</span>
                                    <?php endif; ?>
                                </div>
                                <span class="gamify-badge-label"><?php echo esc_html($badge['title']); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else : ?>
                    <p class="gamify-empty"><?php _e('No achievements yet. Start interacting to earn badges!', 'gamify'); ?></p>
                <?php endif; ?>
            </div>
        </div>

        <style>
            /* Profile Card Base Styles */
            .gamify-user-profile-card {
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                font-family: 'Roboto', sans-serif;
                margin-bottom: 20px;
                border: 1px solid #eee;
            }

            .gamify-profile-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
                border-bottom: 1px solid #f0f0f0;
            }

            .gamify-profile-user {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .gamify-avatar img {
                border-radius: 50%;
                border: 3px solid #006BFF;
                padding: 2px;
            }

            .gamify-username {
                margin: 0;
                font-size: 20px;
                color: #1e293b;
                font-weight: 700;
            }

            .gamify-points-total {
                margin: 4px 0 0;
                color: #64748b;
                font-size: 14px;
            }

            /* Notification Bell */
            .gamify-bell-icon {
                position: relative;
                color: #64748b;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .gamify-bell-icon:hover {
                background: #f1f5f9;
                color: #006BFF;
            }

            .gamify-bell-dot {
                position: absolute;
                top: 8px;
                right: 10px;
                width: 8px;
                height: 8px;
                background: #ef4444;
                border-radius: 50%;
                border: 2px solid #fff;
            }

            /* Progress Map Container */
            .gamify-profile-journey {
                padding: 0 24px;
                border-bottom: 1px solid #f0f0f0;
            }

            /* Achievements Area */
            .gamify-profile-achievements {
                padding: 24px;
            }

            .gamify-sub-title {
                margin: 0 0 16px;
                font-size: 16px;
                color: #1e293b;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .gamify-badges-list {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
            }

            .gamify-badge-card {
                text-align: center;
                width: 80px;
            }

            .gamify-badge-img {
                width: 60px;
                height: 60px;
                background: #f8fafc;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 8px;
                border: 1px solid #e2e8f0;
                transition: transform 0.2s;
            }

            .gamify-badge-card:hover .gamify-badge-img {
                transform: translateY(-5px);
                border-color: #006BFF;
            }

            .gamify-badge-img img {
                width: 40px;
                height: 40px;
                object-fit: contain;
            }

            .gamify-badge-label {
                font-size: 12px;
                color: #475569;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .gamify-empty {
                font-size: 14px;
                color: #94a3b8;
                font-style: italic;
            }
        </style>
<?php
        return ob_get_clean();
    }

    /**
     * [gamify_points] - Simple display of user points.
     */
    public function render_points()
    {
        if (! is_user_logged_in()) {
            return '0';
        }
        $manager = new PointsManager();
        $points  = $manager->get_grand_total(get_current_user_id());
        return '<span class="gamify-points-inline">' . esc_html(number_format_i18n($points)) . '</span>';
    }

    /**
     * [gamify_level] - Simple display of user level.
     */
    public function render_level()
    {
        if (! is_user_logged_in()) {
            return __('Guest', 'gamify');
        }
        $manager = new LevelsManager();
        $levels  = $manager->get_all_user_levels(get_current_user_id());

        if (empty($levels)) {
            return __('No Level', 'gamify');
        }

        $titles = array_map(function ($level) {
            return $level->title;
        }, $levels);

        return esc_html(implode(', ', $titles));
    }

    /**
     * [gamify_achievements] - Simple badge grid.
     */
    public function render_achievements()
    {
        if (! is_user_logged_in()) {
            return '';
        }
        $manager = new AchievementsManager();
        $badges  = $manager->get_user_achievements(get_current_user_id());

        if (empty($badges)) {
            return sprintf('<p>%s</p>', __('No achievements earned yet.', 'gamify'));
        }

        ob_start();
        echo '<div class="gamify-badges-grid-simple">';
        foreach ($badges as $badge) {
            echo '<div class="gamify-badge-icon" title="' . esc_attr($badge['title']) . '">';
            if (! empty($badge['badge_image'])) {
                echo '<img src="' . esc_url($badge['badge_image']) . '" alt="">';
            } else {
                echo '🎖️';
            }
            echo '</div>';
        }
        echo '</div>';
        return ob_get_clean();
    }
}
