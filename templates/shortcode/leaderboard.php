<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Expected:
 * $args['users'] => leaderboard data
 */

$gameengine_users_data = array();
if (isset($args['users']) && is_array($args['users'])) {
    $gameengine_users_data = $args['users'];
}

$gameengine_rank_index = 1;
?>

<div class="gameengine-leaderboard-card">
    <h4 class="gameengine-lb-title">
        🏆 <?php esc_html_e('Top Performers', 'gameengine'); ?>
    </h4>

    <table class="gameengine-lb-table">
        <thead>
            <tr>
                <th><?php esc_html_e('Rank', 'gameengine'); ?></th>
                <th><?php esc_html_e('User', 'gameengine'); ?></th>
                <th><?php esc_html_e('Level', 'gameengine'); ?></th>
                <th style="text-align:right;">
                    <?php esc_html_e('Points', 'gameengine'); ?>
                </th>
            </tr>
        </thead>

        <tbody>
            <?php if (! empty($gameengine_users_data)) : ?>
                <?php foreach ($gameengine_users_data as $gameengine_user_row) : ?>
                    <?php
                    $gameengine_user_id     = isset($gameengine_user_row['user_id'])
                        ? absint($gameengine_user_row['user_id'])
                        : 0;

                    $gameengine_user_name   = isset($gameengine_user_row['name'])
                        ? $gameengine_user_row['name']
                        : '';

                    $gameengine_user_level  = ! empty($gameengine_user_row['top_level'])
                        ? $gameengine_user_row['top_level']
                        : '-';

                    $gameengine_user_points = isset($gameengine_user_row['total_points'])
                        ? (float) $gameengine_user_row['total_points']
                        : 0;
                    ?>
                    <tr class="rank-<?php echo esc_attr($gameengine_rank_index); ?>">
                        <td class="rank-col">
                            #<?php echo esc_html($gameengine_rank_index); ?>
                        </td>

                        <td class="user-col">
                            <div class="ge-user-meta">
                                <?php echo get_avatar($gameengine_user_id, 32); ?>
                                <span><?php echo esc_html($gameengine_user_name); ?></span>
                            </div>
                        </td>

                        <td>
                            <span class="ge-lvl-badge">
                                <?php echo esc_html($gameengine_user_level); ?>
                            </span>
                        </td>

                        <td class="ge-points-col" style="text-align:right;">
                            <?php echo esc_html(number_format_i18n($gameengine_user_points)); ?>
                        </td>
                    </tr>
                    <?php $gameengine_rank_index++; ?>
                <?php endforeach; ?>
            <?php else : ?>
                <tr>
                    <td colspan="4" class="ge-empty">
                        <?php esc_html_e('No data found.', 'gameengine'); ?>
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>