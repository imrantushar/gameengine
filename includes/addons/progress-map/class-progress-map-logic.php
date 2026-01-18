<?php

namespace Gamify\Addons\ProgressMap;

if (!defined('ABSPATH')) exit;

class Progress_Map_Logic
{

    /**
     * Get user progress data for levels
     */
    public static function get_progress_data($user_id)
    {
        global $wpdb;
        $levels = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC", ARRAY_A);

        // ইউজারের বর্তমান পয়েন্ট নিন (Grand Total)
        $points_manager = new \Gamify\Classes\PointsManager();
        $user_points = $points_manager->get_grand_total($user_id);

        $map_data = [];
        $current_level_found = false;

        foreach ($levels as $level) {
            $min = (int) $level['min_points'];
            $max = (int) $level['max_points'];

            $status = 'locked';
            $percentage = 0;

            if ($user_points >= $max) {
                $status = 'completed';
                $percentage = 100;
            } elseif ($user_points >= $min && $user_points < $max) {
                $status = 'current';
                $current_level_found = true;
                // পারসেন্টেজ ক্যালকুলেশন: ((বর্তমান - শুরু) / (শেষ - শুরু)) * ১০০
                $range = $max - $min;
                $progress = $user_points - $min;
                $percentage = ($range > 0) ? round(($progress / $range) * 100) : 0;
            }

            $map_data[] = [
                'title'      => $level['title'],
                'icon'       => $level['icon'],
                'status'     => $status,
                'percentage' => $percentage
            ];
        }

        return $map_data;
    }

    /**
     * Render the visual map HTML
     */
    public static function render_html($user_id)
    {
        $data = self::get_progress_data($user_id);
        if (empty($data)) return '';

        ob_start();
?>
        <div class="gamify-progress-map-container">
            <h4 class="gamify-map-title"><?php _e('Your Journey', 'gamify'); ?></h4>
            <div class="gamify-map-path">
                <?php foreach ($data as $step) : ?>
                    <div class="gamify-map-step <?php echo esc_attr($step['status']); ?>">
                        <div class="gamify-step-icon">
                            <?php if ($step['icon']) : ?>
                                <img src="<?php echo esc_url($step['icon']); ?>" alt="">
                            <?php else : ?>
                                <span><?php echo ($step['status'] === 'completed') ? '✅' : '🔒'; ?></span>
                            <?php endif; ?>
                        </div>
                        <div class="gamify-step-info">
                            <span class="gamify-step-name"><?php echo esc_html($step['title']); ?></span>
                            <?php if ($step['status'] === 'current') : ?>
                                <div class="gamify-mini-progress">
                                    <div class="gamify-mini-bar" style="width: <?php echo $step['percentage']; ?>%"></div>
                                    <span class="gamify-percentage"><?php echo $step['percentage']; ?>%</span>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
<?php
        return ob_get_clean();
    }
}
