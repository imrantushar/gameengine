<?php
/**
 * Referral Dashboard Template
 * 
 * @var string $referral_url
 * @var int    $total_referrals
 * @var int    $total_clicks
 * @var int    $total_points
 * @var array  $recent_referrals
 * @var WP_User $user
 */
if (!defined('ABSPATH')) exit;

// Helper to obfuscate name
$gameengine_obfuscate_name = function($name) {
    if (empty($name)) return __('Anonymous', 'gameengine');
    $parts = explode(' ', $name);
    if (count($parts) > 1) {
        return $parts[0] . ' ' . substr($parts[1], 0, 1) . '.';
    }
    return substr($name, 0, 1) . str_repeat('*', strlen($name) - 1);
};
?>

<div class="ge-referral-container">
    <!-- Header Section -->
    <div class="ge-referral-header">
        <div class="ge-header-content">
            <div class="ge-header-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="ge-header-text">
                <h1><?php esc_html_e('Referral Dashboard', 'gameengine'); ?></h1>
                <p><?php esc_html_e('Share your link and earn rewards for every friend who joins.', 'gameengine'); ?></p>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="ge-stats-grid">
        <div class="ge-stat-card">
            <div class="ge-stat-icon clicks">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 3 3 7-7"/><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/><path d="M15 2H9a2 2 0 0 0-2 2v2h10V4a2 2 0 0 0-2-2Z"/></svg>
            </div>
            <div class="ge-stat-info">
                <span class="ge-stat-label"><?php esc_html_e('Total Clicks', 'gameengine'); ?></span>
                <span class="ge-stat-value"><?php echo esc_html(number_format_i18n($total_clicks)); ?></span>
            </div>
        </div>
        <div class="ge-stat-card">
            <div class="ge-stat-icon referrals">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="ge-stat-info">
                <span class="ge-stat-label"><?php esc_html_e('Total Joined', 'gameengine'); ?></span>
                <span class="ge-stat-value"><?php echo esc_html(number_format_i18n($total_referrals)); ?></span>
            </div>
        </div>
        <div class="ge-stat-card">
            <div class="ge-stat-icon points">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 16v-8"/><path d="M8 12h8"/></svg>
            </div>
            <div class="ge-stat-info">
                <span class="ge-stat-label"><?php esc_html_e('Points Earned', 'gameengine'); ?></span>
                <span class="ge-stat-value"><?php echo esc_html(number_format_i18n($total_points)); ?></span>
            </div>
        </div>
    </div>

    <!-- Referral Link Section -->
    <div class="ge-section ge-link-section">
        <h3><?php esc_html_e('Your Personal Referral Link', 'gameengine'); ?></h3>
        <p class="ge-section-subtitle"><?php esc_html_e('Copy this link and share it with your friends to start earning.', 'gameengine'); ?></p>
        
        <div class="ge-link-wrapper">
            <input type="text" id="ge-ref-link-input" value="<?php echo esc_url($referral_url); ?>" readonly>
            <button id="ge-copy-btn" class="ge-btn ge-btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span><?php esc_html_e('Copy Link', 'gameengine'); ?></span>
            </button>
        </div>
        <div id="ge-copy-toast" class="ge-toast"><?php esc_html_e('Copied to clipboard!', 'gameengine'); ?></div>

        <div class="ge-share-grid">
            <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($referral_url); ?>" target="_blank" class="ge-share-btn facebook" title="Share on Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode($referral_url); ?>&text=<?php echo urlencode(__('Join me on this awesome platform!', 'gameengine')); ?>" target="_blank" class="ge-share-btn twitter" title="Share on Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="https://wa.me/?text=<?php echo urlencode($referral_url); ?>" target="_blank" class="ge-share-btn whatsapp" title="Share on WhatsApp">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a href="mailto:?subject=<?php echo rawurlencode(__('Join me on GameEngine!', 'gameengine')); ?>&body=<?php
                /* translators: %s: The user's personal referral link. */
                echo rawurlencode(sprintf(__('Check out this awesome platform: %s', 'gameengine'), $referral_url));
            ?>" class="ge-share-btn email" title="Share via Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
        </div>
    </div>

    <!-- Recent Referrals Section -->
    <div class="ge-section ge-referrals-list">
        <div class="ge-section-header">
            <h3><?php esc_html_e('Recent Referrals', 'gameengine'); ?></h3>
            <span class="ge-count-badge"><?php echo count($recent_referrals); ?> <?php esc_html_e('new', 'gameengine'); ?></span>
        </div>

        <?php if (!empty($recent_referrals)) : ?>
            <div class="ge-table-responsive">
                <table class="ge-table">
                    <thead>
                        <tr>
                            <th><?php esc_html_e('User', 'gameengine'); ?></th>
                            <th><?php esc_html_e('Date', 'gameengine'); ?></th>
                            <th><?php esc_html_e('Status', 'gameengine'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_referrals as $gameengine_ref) : ?>
                            <tr>
                                <td>
                                    <div class="ge-user-name">
                                        <div class="ge-avatar"><?php echo esc_html(substr($gameengine_ref->display_name, 0, 1)); ?></div>
                                        <span><?php echo esc_html($gameengine_obfuscate_name($gameengine_ref->display_name)); ?></span>
                                    </div>
                                </td>
                                <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($gameengine_ref->created_at))); ?></td>
                                <td><span class="ge-status-pill converted"><?php esc_html_e('Converted', 'gameengine'); ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php else : ?>
            <div class="ge-empty-state">
                <div class="ge-empty-icon">🌱</div>
                <p><?php esc_html_e('No referrals yet. Share your link to get started!', 'gameengine'); ?></p>
            </div>
        <?php endif; ?>
    </div>
</div>

<style>
:root {
    --ge-primary: #6366f1;
    --ge-primary-hover: #4f46e5;
    --ge-bg: #ffffff;
    --ge-surface: #f8fafc;
    --ge-border: #e2e8f0;
    --ge-text: #1e293b;
    --ge-text-muted: #64748b;
    --ge-success: #10b981;
    --ge-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --ge-glass: rgba(255, 255, 255, 0.8);
}

.ge-referral-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--ge-text);
    max-width: 1000px;
    margin: 0 auto;
    background: var(--ge-bg);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    border: 1px solid var(--ge-border);
}

.ge-referral-header {
    margin-bottom: 32px;
}

.ge-header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.ge-header-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
}

.ge-header-text h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: var(--ge-text);
}

.ge-header-text p {
    margin: 4px 0 0;
    color: var(--ge-text-muted);
    font-size: 16px;
}

/* Stats Grid */
.ge-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.ge-stat-card {
    background: var(--ge-surface);
    padding: 24px;
    border-radius: 16px;
    border: 1px solid var(--ge-border);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.ge-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--ge-shadow);
}

.ge-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ge-stat-icon.clicks { background: #fee2e2; color: #ef4444; }
.ge-stat-icon.referrals { background: #dcfce7; color: #22c55e; }
.ge-stat-icon.points { background: #fef9c3; color: #ca8a04; }

.ge-stat-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--ge-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.ge-stat-value {
    display: block;
    font-size: 24px;
    font-weight: 800;
    color: var(--ge-text);
}

/* Sections */
.ge-section {
    background: var(--ge-surface);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
    border: 1px solid var(--ge-border);
}

.ge-section h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
}

.ge-section-subtitle {
    margin: 0 0 20px;
    color: var(--ge-text-muted);
    font-size: 14px;
}

/* Link Wrapper */
.ge-link-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.ge-link-wrapper input {
    flex: 1;
    background: white;
    border: 2px solid var(--ge-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-family: inherit;
    font-size: 14px;
    color: var(--ge-text);
    outline: none;
    transition: border-color 0.2s;
}

.ge-link-wrapper input:focus {
    border-color: var(--ge-primary);
}

.ge-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.ge-btn-primary {
    background: var(--ge-primary);
    color: white;
}

.ge-btn-primary:hover {
    background: var(--ge-primary-hover);
    transform: translateY(-1px);
}

/* Toast */
.ge-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: #1e293b;
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 9999;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

.ge-toast.show {
    transform: translateX(-50%) translateY(0);
}

/* Sharing */
.ge-share-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.ge-share-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-decoration: none;
    transition: transform 0.2s, filter 0.2s;
}

.ge-share-btn:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
}

.ge-share-btn.facebook { background: #1877f2; }
.ge-share-btn.twitter { background: #1da1f2; }
.ge-share-btn.whatsapp { background: #25d366; }
.ge-share-btn.email { background: #64748b; }

/* Table */
.ge-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.ge-count-badge {
    background: var(--ge-primary);
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
}

.ge-table-responsive {
    overflow-x: auto;
}

.ge-table {
    width: 100%;
    border-collapse: collapse;
}

.ge-table th {
    text-align: left;
    padding: 12px;
    color: var(--ge-text-muted);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    border-bottom: 1px solid var(--ge-border);
}

.ge-table td {
    padding: 16px 12px;
    border-bottom: 1px solid var(--ge-border);
    font-size: 14px;
}

.ge-user-name {
    display: flex;
    align-items: center;
    gap: 12px;
}

.ge-avatar {
    width: 32px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--ge-text-muted);
}

.ge-status-pill {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

.ge-status-pill.converted {
    background: #dcfce7;
    color: #166534;
}

.ge-empty-state {
    text-align: center;
    padding: 40px 20px;
}

.ge-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

@media (max-width: 640px) {
    .ge-referral-container { padding: 20px; }
    .ge-link-wrapper { flex-direction: column; }
    .ge-btn { width: 100%; justify-content: center; }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('ge-copy-btn');
    const input = document.getElementById('ge-ref-link-input');
    const toast = document.getElementById('ge-copy-toast');

    if (copyBtn && input) {
        copyBtn.addEventListener('click', function() {
            input.select();
            document.execCommand('copy');
            
            // Show toast
            toast.classList.add('show');
            
            // Button feedback
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span><?php esc_html_e('Copied!', 'gameengine'); ?></span>';
            
            setTimeout(() => {
                toast.classList.remove('show');
                copyBtn.innerHTML = originalHtml;
            }, 3000);
        });
    }
});
</script>
