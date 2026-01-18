<?php

namespace Gamify\Addons\ProgressMap;

if (!defined('ABSPATH')) exit;

class Progress_Map_Logic
{

    public static function get_combined_journey($user_id)
    {
        global $wpdb;

        // ১. সব লেভেল নিন (নতুন ৩টি কলামসহ)
        $levels = $wpdb->get_results("SELECT id, title, icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'level' as type, priority FROM {$wpdb->prefix}gamify_levels ORDER BY priority ASC", ARRAY_A);

        // ২. সব অ্যাচিভমেন্ট নিন (নতুন ৩টি কলামসহ)
        $achievements = $wpdb->get_results("SELECT id, title, badge_image as icon, congratulations_message as congrats, restriction_message, required_achievement_id, required_level_id, 'achievement' as type, created_at FROM {$wpdb->prefix}gamify_achievements ORDER BY created_at ASC", ARRAY_A);

        // ৩. ইউজারের অর্জিত ডাটা নিন
        $user_levels = $wpdb->get_col($wpdb->prepare("SELECT level_id FROM {$wpdb->prefix}gamify_user_levels WHERE user_id = %d", $user_id));
        $user_achievements = $wpdb->get_col($wpdb->prepare("SELECT achievement_id FROM {$wpdb->prefix}gamify_user_achievements WHERE user_id = %d", $user_id));

        // ৪. প্রসেস ডাটা
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

                    $line_class = ($is_completed && $next_completed) ? 'line-blue' : 'line-gray';
                    $side_class = ($index % 2 === 0) ? 'node-left' : 'node-right';
                ?>
                    <div class="gamify-timeline-node <?php echo $side_class; ?> <?php echo $is_completed ? 'is-active' : 'is-locked'; ?>">

                        <div class="gamify-node-circle"><?php echo $index + 1; ?></div>

                        <?php if (!$is_last) : ?>
                            <div class="gamify-connector <?php echo $line_class; ?>"></div>
                        <?php endif; ?>

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

                                    <?php if ($is_completed) : ?>
                                        <p class="gf-congrats"><?php echo esc_html($node['congrats']); ?></p>
                                    <?php else : ?>
                                        <!-- রেস্ট্রিকশন মেসেজ এখানে দেখাবে -->
                                        <div class="gf-restriction-info">
                                            <span class="gf-lock-label">🔒 <?php _e('Locked', 'gamify'); ?></span>
                                            <p class="gf-lock-msg"><?php echo !empty($node['restriction_message']) ? esc_html($node['restriction_message']) : __('Earn pre-requisites to unlock.', 'gamify'); ?></p>
                                        </div>
                                    <?php endif; ?>
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
