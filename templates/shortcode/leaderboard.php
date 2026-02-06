<?php
if (! defined('ABSPATH')) exit;

$ge_users = isset($args['users']) ? $args['users'] : array();
?>

<div class="gameengine-leaderboard-card">
    <h4 class="gameengine-lb-title">🏆 <?php esc_html_e('Top Performers', 'gameengine'); ?></h4>

    <table class="gameengine-lb-table">
        <thead>
            <tr>
                <th><?php esc_html_e('Rank', 'gameengine'); ?></th>
                <th><?php esc_html_e('User', 'gameengine'); ?></th>
                <th><?php esc_html_e('Level', 'gameengine'); ?></th>
                <th style="text-align:right;"><?php esc_html_e('Points', 'gameengine'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if (! empty($ge_users)) : ?>
                <?php foreach ($ge_users as $index => $user) : ?>
                    <tr class="rank-<?php echo esc_attr($index + 1); ?>">
                        <td class="rank-col">#<?php echo esc_html($index + 1); ?></td>
                        <td class="user-col">
                            <div class="ge-user-meta">
                                <?php echo get_avatar($user['user_id'], 32); ?>
                                <span><?php echo esc_html($user['name']); ?></span>
                            </div>
                        </td>
                        <td><span class="ge-lvl-badge"><?php echo esc_html($user['top_level'] ?: '-'); ?></span></td>
                        <td class="ge-points-col"><?php echo esc_html(number_format_i18n($user['total_points'])); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php else : ?>
                <tr>
                    <td colspan="4" class="ge-empty"><?php esc_html_e('No data found.', 'gameengine'); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>