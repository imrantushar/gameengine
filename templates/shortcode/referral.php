<?php
/**
 * Referral Dashboard Template
 * 
 * @var string $referral_url
 * @var int    $total_referrals
 * @var int    $total_points
 * @var WP_User $user
 */
if (!defined('ABSPATH')) exit;
?>

<div class="gameengine-dashboard gameengine-referral-dashboard">
    <div class="gameengine-header">
        <div class="gameengine-user-meta-info">
            <div class="gameengine-icon" style="font-size: 40px; margin-right: 15px;">📣</div>
            <div class="gameengine-user-details">
                <h3><?php esc_html_e('Referral Dashboard', 'gameengine'); ?></h3>
                <p><?php esc_html_e('Invite your friends and earn rewards together!', 'gameengine'); ?></p>
            </div>
        </div>
    </div>

    <div class="gameengine-referral-stats-grid">
        <div class="gameengine-stat-card">
            <span class="stat-label"><?php esc_html_e('Total Referrals', 'gameengine'); ?></span>
            <span class="stat-value"><?php echo esc_html($total_referrals); ?></span>
            <span class="stat-icon">👥</span>
        </div>
        <div class="gameengine-stat-card">
            <span class="stat-label"><?php esc_html_e('Points Earned', 'gameengine'); ?></span>
            <span class="stat-value"><?php echo esc_html(number_format_i18n($total_points)); ?></span>
            <span class="stat-icon">🪙</span>
        </div>
    </div>

    <div class="gameengine-referral-link-section">
        <h4><?php esc_html_e('Your Unique Referral Link', 'gameengine'); ?></h4>
        <div class="gameengine-copy-wrapper">
            <input type="text" id="gameengine-ref-link" value="<?php echo esc_url($referral_url); ?>" readonly>
            <button id="gameengine-copy-btn" class="button button-primary">
                <?php esc_html_e('Copy Link', 'gameengine'); ?>
            </button>
        </div>
        <p class="copy-success-msg" style="display:none; color: #10b981; font-size: 13px; margin-top: 5px;">
            ✅ <?php esc_html_e('Link copied to clipboard!', 'gameengine'); ?>
        </p>
    </div>

    <div class="gameengine-share-section">
        <h4><?php esc_html_e('Share via Social Media', 'gameengine'); ?></h4>
        <div class="gameengine-social-icons">
            <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($referral_url); ?>" target="_blank" class="social-btn fb">Facebook</a>
            <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode($referral_url); ?>&text=<?php echo urlencode(__('Join me on this awesome platform!', 'gameengine')); ?>" target="_blank" class="social-btn tw">Twitter</a>
            <a href="https://wa.me/?text=<?php echo urlencode($referral_url); ?>" target="_blank" class="social-btn wa">WhatsApp</a>
        </div>
    </div>
</div>

<style>
.gameengine-referral-dashboard {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.gameengine-referral-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 24px 0;
}
.gameengine-stat-card {
    background: #f8fafc;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
}
.gameengine-stat-card .stat-label {
    display: block;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
}
.gameengine-stat-card .stat-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin-top: 5px;
}
.gameengine-stat-card .stat-icon {
    position: absolute;
    right: 15px;
    bottom: 15px;
    font-size: 32px;
    opacity: 0.1;
}
.gameengine-copy-wrapper {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}
.gameengine-copy-wrapper input {
    flex: 1;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 12px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
}
.gameengine-social-icons {
    display: flex;
    gap: 12px;
    margin-top: 15px;
}
.social-btn {
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
}
.social-btn.fb { background: #1877F2; }
.social-btn.tw { background: #1DA1F2; }
.social-btn.wa { background: #25D366; }

.gameengine-tab-btn {
    cursor: pointer;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('gameengine-copy-btn');
    const input = document.getElementById('gameengine-ref-link');
    const successMsg = document.querySelector('.copy-success-msg');

    if (copyBtn && input) {
        copyBtn.addEventListener('click', function() {
            input.select();
            document.execCommand('copy');
            copyBtn.innerText = '<?php esc_html_e('Copied!', 'gameengine'); ?>';
            successMsg.style.display = 'block';
            setTimeout(() => {
                copyBtn.innerText = '<?php esc_html_e('Copy Link', 'gameengine'); ?>';
                successMsg.style.display = 'none';
            }, 3000);
        });
    }
});
</script>
