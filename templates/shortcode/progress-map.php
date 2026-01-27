<?php
if (! defined('ABSPATH')) exit;
$gameengine_map_user_id = get_current_user_id();

if (class_exists('\GameEngine\Addons\ProgressMap\Progress_Map_Logic')) {
    echo \GameEngine\Addons\ProgressMap\Progress_Map_Logic::render_html($gameengine_map_user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
?>
    <p class="gameengine-addon-notice">
        <?php esc_html_e('Progress Map addon is not active.', 'gameengine'); ?>
    </p>
<?php
}
