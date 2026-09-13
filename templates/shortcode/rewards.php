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
<div class="gameengine-rewards-catalog">
    <?php if ($gameengine_rw_is_logged_in) : ?>
        <div class="gameengine-rewards-balance">
            <?php echo esc_html(sprintf(/* translators: %d: the member's points balance. */ __('Your balance: %d points', 'gameengine'), $gameengine_rw_balance)); ?>
        </div>
    <?php endif; ?>

    <div class="gameengine-rewards-notice" style="display:none;"></div>

    <?php if (empty($gameengine_rw_rewards)) : ?>
        <p><?php esc_html_e('No rewards are available right now. Check back soon!', 'gameengine'); ?></p>
    <?php else : ?>
        <div class="gameengine-rewards-grid">
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
                <div class="gameengine-reward-card" data-reward-card="<?php echo esc_attr($gameengine_rw_id); ?>">
                    <div class="gameengine-reward-icon-box">
                        <?php if (! empty($gameengine_rw_reward['image'])) : ?>
                            <img src="<?php echo esc_url($gameengine_rw_reward['image']); ?>" alt="<?php echo esc_attr($gameengine_rw_reward['title']); ?>">
                        <?php else : ?>
                            <span class="gameengine-default-icon">🎁</span>
                        <?php endif; ?>
                    </div>

                    <div class="gameengine-reward-details">
                        <span class="gameengine-reward-title"><?php echo esc_html($gameengine_rw_reward['title']); ?></span>

                        <?php if (! empty($gameengine_rw_reward['description'])) : ?>
                            <p class="gameengine-reward-desc"><?php echo esc_html($gameengine_rw_reward['description']); ?></p>
                        <?php endif; ?>

                        <span class="gameengine-reward-cost"><?php echo esc_html(sprintf(/* translators: %d: how many points the reward costs. */ __('%d points', 'gameengine'), $gameengine_rw_cost)); ?></span>

                        <?php if ($gameengine_rw_stock >= 0) : ?>
                            <span class="gameengine-reward-stock" data-stock-label>
                                <?php echo esc_html(sprintf(/* translators: %d: how many of the reward are left in stock. */ __('%d left', 'gameengine'), $gameengine_rw_stock)); ?>
                            </span>
                        <?php endif; ?>

                        <?php if (! $gameengine_rw_is_logged_in) : ?>
                            <a class="gameengine-reward-redeem-btn" href="<?php echo esc_url(wp_login_url(get_permalink())); ?>">
                                <?php echo esc_html($gameengine_rw_button_label); ?>
                            </a>
                        <?php else : ?>
                            <button
                                type="button"
                                class="gameengine-reward-redeem-btn"
                                data-reward-id="<?php echo esc_attr($gameengine_rw_id); ?>"
                                <?php disabled($gameengine_rw_disabled); ?>
                            >
                                <?php echo esc_html($gameengine_rw_button_label); ?>
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php if (! defined('GAMEENGINE_REWARDS_SHORTCODE_JS_PRINTED')) :
    define('GAMEENGINE_REWARDS_SHORTCODE_JS_PRINTED', true);
?>
<script>
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        var button = event.target.closest('.gameengine-reward-redeem-btn[data-reward-id]');
        if (! button || button.disabled) {
            return;
        }

        var rewardId = button.getAttribute('data-reward-id');
        var card = button.closest('[data-reward-card]');
        var notice = document.querySelector('.gameengine-rewards-notice');
        var originalLabel = button.textContent;

        button.disabled = true;
        button.textContent = '<?php echo esc_js(__('Redeeming…', 'gameengine')); ?>';

        fetch(window.GameEngineGlobal.rest_url + window.GameEngineGlobal.namespace + 'rewards/' + rewardId + '/redeem', {
            method: 'POST',
            headers: {
                'X-WP-Nonce': window.GameEngineGlobal.nonce,
                'Content-Type': 'application/json',
            },
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    return { ok: response.ok, data: data };
                });
            })
            .then(function (result) {
                if (notice) {
                    notice.style.display = 'block';
                    notice.textContent = result.data.message || '';
                    notice.className = 'gameengine-rewards-notice ' + (result.ok ? 'gameengine-rewards-notice--success' : 'gameengine-rewards-notice--error');
                }

                if (result.ok) {
                    button.textContent = '<?php echo esc_js(__('Redeemed', 'gameengine')); ?>';

                    var balanceEl = document.querySelector('.gameengine-rewards-balance');
                    if (balanceEl && typeof result.data.remaining_points !== 'undefined') {
                        balanceEl.textContent = '<?php echo esc_js(__('Your balance:', 'gameengine')); ?> ' + result.data.remaining_points + ' <?php echo esc_js(__('points', 'gameengine')); ?>';
                    }

                    if (card) {
                        var stockLabel = card.querySelector('[data-stock-label]');
                        if (stockLabel && typeof result.data.remaining_stock !== 'undefined' && result.data.remaining_stock >= 0) {
                            stockLabel.textContent = result.data.remaining_stock + ' <?php echo esc_js(__('left', 'gameengine')); ?>';
                            if (result.data.remaining_stock === 0) {
                                button.disabled = true;
                                button.textContent = '<?php echo esc_js(__('Out of Stock', 'gameengine')); ?>';
                            }
                        }
                    }

                    window.setTimeout(function () {
                        button.textContent = originalLabel;
                        if (! button.disabled) {
                            button.disabled = false;
                        }
                    }, 2000);
                } else {
                    button.disabled = false;
                    button.textContent = originalLabel;
                }
            })
            .catch(function () {
                button.disabled = false;
                button.textContent = originalLabel;
                if (notice) {
                    notice.style.display = 'block';
                    notice.textContent = '<?php echo esc_js(__('Something went wrong. Please try again.', 'gameengine')); ?>';
                    notice.className = 'gameengine-rewards-notice gameengine-rewards-notice--error';
                }
            });
    });
});
</script>
<?php endif; ?>
