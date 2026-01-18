<?php

namespace Gamify\Addons\ProgressMap;

if (!defined('ABSPATH')) exit;

class Progress_Map_Logic
{

    public static function get_combined_journey($user_id)
    {
        global $wpdb;

        // 1. Fetch all Levels & Achievements
        $levels = $wpdb->get_results("SELECT id, title, icon, congratulations_message as congrats, 'level' as type, priority FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC", ARRAY_A);
        $achievements = $wpdb->get_results("SELECT id, title, badge_image as icon, congratulations_message as congrats, 'achievement' as type, created_at FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A);

        // 2. Fetch User Earned Data
        $user_levels = $wpdb->get_col($wpdb->prepare("SELECT level_id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d", $user_id));
        $user_achievements = $wpdb->get_col($wpdb->prepare("SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", $user_id));

        // 3. Process Status
        $journey = array_merge($levels, $achievements);
        $unlocked = [];
        $locked = [];

        foreach ($journey as $item) {
            $is_completed = ($item['type'] === 'level') ? in_array($item['id'], $user_levels) : in_array($item['id'], $user_achievements);
            $item['status'] = $is_completed ? 'completed' : 'locked';

            if ($is_completed) {
                $unlocked[] = $item;
            } else {
                $locked[] = $item;
            }
        }

        // অর্জিতগুলো আগে, তারপর লক করাগুলো
        return array_merge($unlocked, $locked);
    }

    public static function render_html($user_id)
    {
        $journey = self::get_combined_journey($user_id);
        if (empty($journey)) return '';

        ob_start();
?>
        <div class="gamify-roadmap-v2">
            <div class="gamify-timeline">
                <?php
                $total = count($journey);
                foreach ($journey as $index => $node) :
                    $is_last = ($index === $total - 1);
                    $is_completed = ($node['status'] === 'completed');
                    $next_completed = (!$is_last && $journey[$index + 1]['status'] === 'completed');

                    // লাইন কালার লজিক: যদি বর্তমান এবং পরেরটি উভয়ই কমপ্লিট হয় তবে নীল লাইন
                    $line_class = ($is_completed && $next_completed) ? 'line-blue' : 'line-gray';
                    $side_class = ($index % 2 === 0) ? 'node-left' : 'node-right';
                ?>
                    <div class="gamify-timeline-node <?php echo $side_class; ?> <?php echo $is_completed ? 'is-active' : 'is-locked'; ?>">

                        <!-- The Number Circle on Line -->
                        <div class="gamify-node-circle">
                            <?php echo $index + 1; ?>
                        </div>

                        <!-- The Connecting Line -->
                        <?php if (!$is_last) : ?>
                            <div class="gamify-connector <?php echo $line_class; ?>"></div>
                        <?php endif; ?>

                        <!-- Content Card -->
                        <div class="gamify-node-card">
                            <div class="gamify-card-inner">
                                <div class="gamify-card-media">
                                    <?php if ($node['icon']) : ?>
                                        <img src="<?php echo esc_url($node['icon']); ?>" alt="">
                                    <?php else : ?>
                                        <span class="icon-placeholder"><?php echo ($node['type'] === 'level') ? '🏆' : '🏅'; ?></span>
                                    <?php endif; ?>
                                </div>
                                <div class="gamify-card-info">
                                    <div class="gamify-type-badge <?php echo $node['type']; ?>">
                                        <?php echo strtoupper($node['type']); ?>
                                    </div>
                                    <h5><?php echo esc_html($node['title']); ?></h5>
                                    <p><?php echo $is_completed ? esc_html($node['congrats']) : __('Complete tasks to unlock this milestone.', 'gamify'); ?></p>
                                </div>
                            </div>
                        </div>

                    </div>
                <?php endforeach; ?>
            </div>
        </div>
<?php
        return ob_get_clean();
    }
}
