<?php
if (! defined('ABSPATH')) exit;
$gameengine_map_user_id = get_current_user_id();

if (class_exists('\GameEngine\Addons\ProgressMap\Progress_Map_Logic')) {
    echo \GameEngine\Addons\ProgressMap\Progress_Map_Logic::render_html($gameengine_map_user_id); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
?>
    <div class="gameengine-ui">
        <p class="gameengine-notice">
            <?php \GameEngine\Icons::render('info'); ?>
            <span><?php esc_html_e('Progress Map addon is not active.', 'gameengine'); ?></span>
        </p>
    </div>
<?php
}
