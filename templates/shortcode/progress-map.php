<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Template for [gamify_progress_map] shortcode.
 */
$user_id = get_current_user_id();

if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) {
    // অ্যাডনের লজিক ক্লাস থেকে ম্যাপটি রেন্ডার করা হচ্ছে
    echo \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html($user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
?>
    <p class="gf-addon-notice">
        <?php esc_html_e('Progress Map addon is not active.', 'gamify'); ?>
    </p>
<?php
}
