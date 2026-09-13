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
$gameengine_viewer_id  = get_current_user_id();
$gameengine_podium     = array(
    1 => 'gameengine-leaderboard__row--first',
    2 => 'gameengine-leaderboard__row--second',
    3 => 'gameengine-leaderboard__row--third',
);
?>
<div class="gameengine-ui gameengine-leaderboard">
    <div class="gameengine-card">
        <div class="gameengine-card__header">
            <div class="gameengine-card__heading">
                <span class="gameengine-card__icon"><?php \GameEngine\Icons::render('trophy'); ?></span>
                <h3 class="gameengine-card__title"><?php esc_html_e('Top Performers', 'gameengine'); ?></h3>
            </div>
        </div>

        <?php if (! empty($gameengine_users_data)) : ?>
            <ol class="gameengine-leaderboard__list">
                <?php foreach ($gameengine_users_data as $gameengine_user_row) : ?>
                    <?php
                    $gameengine_user_id     = isset($gameengine_user_row['user_id']) ? absint($gameengine_user_row['user_id']) : 0;
                    $gameengine_user_name   = isset($gameengine_user_row['name']) ? $gameengine_user_row['name'] : '';
                    $gameengine_user_level  = ! empty($gameengine_user_row['top_level']) ? $gameengine_user_row['top_level'] : '';
                    $gameengine_user_points = isset($gameengine_user_row['total_points']) ? (float) $gameengine_user_row['total_points'] : 0;

                    // The row carries its own standing: a season snapshot stores
                    // the competition position it was captured with, and ties
                    // share a place. Falling back to the loop index only covers
                    // a caller that supplies neither.
                    $gameengine_rank = isset($gameengine_user_row['position'])
                        ? (int) $gameengine_user_row['position']
                        : $gameengine_rank_index;

                    $gameengine_is_viewer   = $gameengine_viewer_id && $gameengine_user_id === $gameengine_viewer_id;
                    $gameengine_row_classes = array('gameengine-leaderboard__row');
                    if (isset($gameengine_podium[$gameengine_rank])) {
                        $gameengine_row_classes[] = $gameengine_podium[$gameengine_rank];
                    }
                    if ($gameengine_is_viewer) {
                        $gameengine_row_classes[] = 'gameengine-leaderboard__row--you';
                    }
                    ?>
                    <li class="<?php echo esc_attr(implode(' ', $gameengine_row_classes)); ?>">
                        <span class="gameengine-leaderboard__rank">
                            <span class="gameengine-screen-reader-text"><?php esc_html_e('Rank', 'gameengine'); ?></span>
                            <?php echo esc_html(number_format_i18n($gameengine_rank)); ?>
                        </span>
                        <?php echo wp_kses_post(get_avatar($gameengine_user_id, 40, '', '', array('class' => 'gameengine-avatar'))); ?>
                        <span class="gameengine-leaderboard__member">
                            <span class="gameengine-leaderboard__name">
                                <span class="gameengine-leaderboard__name-text"><?php echo esc_html($gameengine_user_name); ?></span>
                                <?php if ($gameengine_is_viewer) : ?>
                                    <span class="gameengine-badge gameengine-badge--primary"><?php esc_html_e('You', 'gameengine'); ?></span>
                                <?php endif; ?>
                            </span>
                            <?php if ('' !== $gameengine_user_level) : ?>
                                <span class="gameengine-leaderboard__level"><?php echo esc_html($gameengine_user_level); ?></span>
                            <?php endif; ?>
                        </span>
                        <span class="gameengine-leaderboard__points">
                            <?php echo esc_html(number_format_i18n($gameengine_user_points)); ?><span class="gameengine-leaderboard__points-unit"><?php esc_html_e('points', 'gameengine'); ?></span>
                        </span>
                    </li>
                    <?php $gameengine_rank_index++; ?>
                <?php endforeach; ?>
            </ol>
        <?php else : ?>
            <div class="gameengine-empty">
                <span class="gameengine-empty__icon"><?php \GameEngine\Icons::render('trophy'); ?></span>
                <p class="gameengine-empty__title"><?php esc_html_e('No data found.', 'gameengine'); ?></p>
                <p class="gameengine-empty__text"><?php esc_html_e('Members show up here once they earn points.', 'gameengine'); ?></p>
            </div>
        <?php endif; ?>
    </div>
</div>
