<?php
if (! defined('ABSPATH')) {
    exit;
}

$gamify_map_user_id = get_current_user_id();

if (class_exists('\Gamify\Addons\ProgressMap\Progress_Map_Logic')) {
    echo \Gamify\Addons\ProgressMap\Progress_Map_Logic::render_html($gamify_map_user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
?>
    <p class="gf-addon-notice">
        <?php esc_html_e('Progress Map addon is not active.', 'gamify'); ?>
    </p>
<?php
}
