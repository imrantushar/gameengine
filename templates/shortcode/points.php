<?php
if (! defined('ABSPATH')) {
    exit;
}

$gameengine_points_manager = new \GameEngine\Classes\PointsManager();
$gameengine_user_id        = get_current_user_id();
$gameengine_points_val     = $gameengine_points_manager->get_grand_total($gameengine_user_id);
?>
<span class="gameengine-pill-points">
    <span class="icon">🪙</span>
    <?php echo esc_html(number_format_i18n($gameengine_points_val)); ?>
    <?php esc_html_e('Points', 'gameengine'); ?>
</span>