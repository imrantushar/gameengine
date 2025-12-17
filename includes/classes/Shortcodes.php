<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) {
    exit;
}

use Gamify\Classes\PointsManager;
use Gamify\Classes\AchievementsManager;
use Gamify\Classes\LevelsManager;

/**
 * Handles Frontend Shortcodes.
 */
class Shortcodes
{
    /**
     * Initialize Shortcodes.
     */
    public static function init()
    {
        $self = new self();
        add_shortcode('gamify_profile', [$self, 'render_profile']);
        add_shortcode('gamify_points', [$self, 'render_points']);
        add_shortcode('gamify_achievements', [$self, 'render_achievements']);
        add_shortcode('gamify_level', [$self, 'render_level']);
    }

    /**
     * [gamify_profile] - Displays full user profile card.
     *
     * @param array $atts Shortcode attributes.
     * @return string HTML output.
     */
    public function render_profile($atts)
    {
        if (!is_user_logged_in()) {
            return '';
        }

        $user_id   = get_current_user_id();
        $user_data = get_userdata($user_id);

        $points_manager       = new PointsManager();
        $levels_manager       = new LevelsManager();
        $achievements_manager = new AchievementsManager();

        //$points        = $points_manager->get_total($user_id);
        $points = $points_manager->get_grand_total($user_id);
        $current_level = $levels_manager->get_current_level($user_id);
        $badges        = $achievements_manager->get_user_achievements($user_id);
        $all_levels = $levels_manager->get_all_user_levels($user_id);
        ob_start();
?>
        <div class="gamify-frontend-card">
            <!-- Header: User Info -->
            <div class="gamify-card-header">
                <div class="gamify-user-avatar">
                    <?php echo get_avatar($user_id, 64); ?>
                </div>
                <div class="gamify-user-info">
                    <h3><?php echo esc_html($user_data->display_name); ?></h3>
                    <div class="gamify-user-meta">
                        <span class="gamify-badge-pill">
                            <?php
                            if (!empty($all_levels)) {
                                $level_names = array_map(function ($l) {
                                    return $l->title;
                                }, $all_levels);
                                echo '🏆 ' . esc_html(implode(', ', $level_names));
                            } else {
                                echo '🏆 ' . esc_html__('No Level', 'gamify');
                            }
                            ?>
                        </span>
                        <span class="gamify-points-pill">
                            🪙 <?php echo number_format_i18n($points); ?> <?php esc_html_e('Points', 'gamify'); ?>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Body: Achievements Grid -->
            <div class="gamify-card-body">
                <h4 class="gamify-section-title"><?php esc_html_e('Achievements Unlocked', 'gamify'); ?></h4>

                <?php if (!empty($badges)) : ?>
                    <div class="gamify-badges-grid">
                        <?php foreach ($badges as $badge) : ?>
                            <?php
                            // Ensure array access for badges (since get_results uses ARRAY_A)
                            $title = isset($badge['title']) ? $badge['title'] : '';
                            $image = isset($badge['badge_image']) ? $badge['badge_image'] : '';
                            ?>
                            <div class="gamify-badge-item" title="<?php echo esc_attr($title); ?>">
                                <?php if (!empty($image)) : ?>
                                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>">
                                <?php else : ?>
                                    <div class="gamify-default-icon">🎖️</div>
                                <?php endif; ?>
                                <span class="gamify-badge-name"><?php echo esc_html($title); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else : ?>
                    <p class="gamify-empty-state"><?php esc_html_e('No achievements earned yet. Keep going!', 'gamify'); ?></p>
                <?php endif; ?>
            </div>
        </div>
<?php
        return ob_get_clean();
    }

    /**
     * [gamify_points] - Displays current points.
     */
    public function render_points($atts)
    {
        if (!is_user_logged_in()) {
            return '';
        }
        $manager = new PointsManager();
        //$points  = $manager->get_total(get_current_user_id());
        $points  = $manager->get_grand_total(get_current_user_id());
        return '<span class="gamify-points-text">' . number_format_i18n($points) . '</span>';
    }

    /**
     * [gamify_level] - Displays current level title.
     */
    public function render_level($atts)
    {
        if (!is_user_logged_in()) {
            return '';
        }

        $manager = new LevelsManager();

        // 🔥 Use the new function to get ALL levels
        $levels = $manager->get_all_user_levels(get_current_user_id());

        if (empty($levels)) {
            return esc_html__('No Level', 'gamify');
        }

        // Extract titles
        $titles = array_map(function ($level) {
            return $level->title;
        }, $levels);

        // Join with comma
        return esc_html(implode(', ', $titles));
    }

    /**
     * [gamify_achievements] - Displays badge grid.
     */
    public function render_achievements($atts)
    {
        if (!is_user_logged_in()) {
            return '';
        }
        $manager = new AchievementsManager();
        $badges  = $manager->get_user_achievements(get_current_user_id());

        if (empty($badges)) {
            return '<p>' . esc_html__('No achievements yet.', 'gamify') . '</p>';
        }

        ob_start();
        echo '<div class="gamify-badges-grid">';
        foreach ($badges as $badge) {
            $title = isset($badge['title']) ? $badge['title'] : '';
            $image = isset($badge['badge_image']) ? $badge['badge_image'] : '';

            echo '<div class="gamify-badge-item" title="' . esc_attr($title) . '">';

            if (!empty($image)) {
                echo '<img src="' . esc_url($image) . '" alt="' . esc_attr($title) . '">';
            } else {
                echo '<div class="gamify-default-icon">🎖️</div>';
            }

            echo '<span class="gamify-badge-name">' . esc_html($title) . '</span>';
            echo '</div>';
        }
        echo '</div>';
        return ob_get_clean();
    }
}
