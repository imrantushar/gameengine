<?php
if (! defined('ABSPATH')) exit;
global $wpdb;

$gameengine_rw_current_user_id = get_current_user_id();
$gameengine_rw_is_logged_in    = is_user_logged_in();
// Each reward is priced in its own point type, resolved exactly as redemption
// resolves it. The header shows the balance in the site's default type.
$gameengine_rw_point_type_id   = \GameEngine\Addons\RewardsStore\Rewards_Manager::resolve_point_type_id(0);
$gameengine_rw_balance         = $gameengine_rw_is_logged_in ? (int) gameengine_get_total_points($gameengine_rw_current_user_id, $gameengine_rw_point_type_id) : 0;
$gameengine_rw_balances        = array($gameengine_rw_point_type_id => $gameengine_rw_balance);

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$gameengine_rw_rewards = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}gameengine_rewards WHERE status = 'publish' ORDER BY cost_points ASC",
    ARRAY_A
);

$gameengine_rw_redeemed_counts = array();
if ($gameengine_rw_is_logged_in && ! empty($gameengine_rw_rewards)) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $gameengine_rw_rows = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT reward_id, COUNT(id) as cnt FROM {$wpdb->prefix}gameengine_reward_redemptions WHERE user_id = %d AND status = 'completed' GROUP BY reward_id",
            $gameengine_rw_current_user_id
        ),
        ARRAY_A
    );
    foreach ($gameengine_rw_rows as $gameengine_rw_row) {
        $gameengine_rw_redeemed_counts[(int) $gameengine_rw_row['reward_id']] = (int) $gameengine_rw_row['cnt'];
    }
}
?>
<div class="gameengine-ui gameengine-rewards" data-gameengine-rewards>
    <?php if ($gameengine_rw_is_logged_in) : ?>
        <div class="gameengine-rewards__bar">
            <p class="gameengine-rewards__balance">
                <?php \GameEngine\Icons::render('coin'); ?>
                <span><?php esc_html_e('Your balance', 'gameengine'); ?></span>
                <strong data-gameengine-balance>
                    <?php
                    /* translators: %s: required point amount */
                    echo esc_html(sprintf(__('%s points', 'gameengine'), number_format_i18n($gameengine_rw_balance)));
                    ?>
                </strong>
            </p>
        </div>
    <?php endif; ?>

    <div class="gameengine-notice" role="status" aria-live="polite" data-gameengine-notice hidden></div>

    <?php if (empty($gameengine_rw_rewards)) : ?>
        <div class="gameengine-empty">
            <span class="gameengine-empty__icon"><?php \GameEngine\Icons::render('gift'); ?></span>
            <p class="gameengine-empty__title"><?php esc_html_e('No rewards are available right now. Check back soon!', 'gameengine'); ?></p>
        </div>
    <?php else : ?>
        <ul class="gameengine-reward-grid">
            <?php foreach ($gameengine_rw_rewards as $gameengine_rw_reward) :
                $gameengine_rw_id             = (int) $gameengine_rw_reward['id'];
                $gameengine_rw_cost           = (int) $gameengine_rw_reward['cost_points'];
                $gameengine_rw_stock          = (int) $gameengine_rw_reward['stock'];
                $gameengine_rw_limit          = (int) $gameengine_rw_reward['limit_per_user'];
                $gameengine_rw_redeemed_count = $gameengine_rw_redeemed_counts[$gameengine_rw_id] ?? 0;

                $gameengine_rw_out_of_stock   = 0 === $gameengine_rw_stock;
                $gameengine_rw_limit_reached  = $gameengine_rw_limit > 0 && $gameengine_rw_redeemed_count >= $gameengine_rw_limit;
                $gameengine_rw_type           = \GameEngine\Addons\RewardsStore\Rewards_Manager::resolve_point_type_id((int) $gameengine_rw_reward['point_type_id']);
                if ($gameengine_rw_is_logged_in && ! isset($gameengine_rw_balances[$gameengine_rw_type])) {
                    $gameengine_rw_balances[$gameengine_rw_type] = (int) gameengine_get_total_points($gameengine_rw_current_user_id, $gameengine_rw_type);
                }
                $gameengine_rw_cant_afford    = $gameengine_rw_is_logged_in && ($gameengine_rw_balances[$gameengine_rw_type] ?? 0) < $gameengine_rw_cost;

                $gameengine_rw_disabled = ! $gameengine_rw_is_logged_in || $gameengine_rw_out_of_stock || $gameengine_rw_limit_reached || $gameengine_rw_cant_afford;

                if (! $gameengine_rw_is_logged_in) {
                    $gameengine_rw_button_label = __('Log in to Redeem', 'gameengine');
                } elseif ($gameengine_rw_out_of_stock) {
                    $gameengine_rw_button_label = __('Out of Stock', 'gameengine');
                } elseif ($gameengine_rw_limit_reached) {
                    $gameengine_rw_button_label = __('Already Redeemed', 'gameengine');
                } elseif ($gameengine_rw_cant_afford) {
                    $gameengine_rw_button_label = __('Not Enough Points', 'gameengine');
                } else {
                    $gameengine_rw_button_label = __('Redeem', 'gameengine');
                }
            ?>
                <li class="gameengine-reward" data-reward-card="<?php echo esc_attr($gameengine_rw_id); ?>">
                    <div class="gameengine-reward__media<?php echo empty($gameengine_rw_reward['image']) ? ' gameengine-reward__media--placeholder' : ''; ?>">
                        <?php if (! empty($gameengine_rw_reward['image'])) : ?>
                            <img src="<?php echo esc_url($gameengine_rw_reward['image']); ?>" alt="" loading="lazy">
                        <?php else : ?>
                            <?php \GameEngine\Icons::render('gift'); ?>
                        <?php endif; ?>
                    </div>

                    <div class="gameengine-reward__body">
                        <h3 class="gameengine-reward__title"><?php echo esc_html($gameengine_rw_reward['title']); ?></h3>
                        <?php if (! empty($gameengine_rw_reward['description'])) : ?>
                            <p class="gameengine-reward__desc"><?php echo esc_html($gameengine_rw_reward['description']); ?></p>
                        <?php endif; ?>
                    </div>

                    <div class="gameengine-reward__footer">
                        <div class="gameengine-reward__meta">
                            <span class="gameengine-reward__cost">
                                <?php \GameEngine\Icons::render('coin'); ?>
                                <?php
                                /* translators: %s: required point amount */
                                echo esc_html(sprintf(__('%s points', 'gameengine'), number_format_i18n($gameengine_rw_cost)));
                                ?>
                            </span>
                            <?php if ($gameengine_rw_stock > 0) : ?>
                                <span class="gameengine-reward__stock" data-stock-label>
                                    <?php echo esc_html(sprintf(/* translators: %d: how many of the reward are left in stock. */ __('%d left', 'gameengine'), $gameengine_rw_stock)); ?>
                                </span>
                            <?php endif; ?>
                        </div>

                        <?php if (! $gameengine_rw_is_logged_in) : ?>
                            <a class="gameengine-button gameengine-button--block" href="<?php echo esc_url(wp_login_url(get_permalink())); ?>">
                                <?php echo esc_html($gameengine_rw_button_label); ?>
                            </a>
                        <?php else : ?>
                            <button
                                type="button"
                                class="gameengine-button gameengine-button--primary gameengine-button--block"
                                data-reward-id="<?php echo esc_attr($gameengine_rw_id); ?>"
                                <?php disabled($gameengine_rw_disabled); ?>
                            >
                                <?php echo esc_html($gameengine_rw_button_label); ?>
                            </button>
                        <?php endif; ?>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</div>
