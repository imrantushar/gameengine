<?php
if (! defined('ABSPATH')) {
    exit;
}

$gamify_points_manager = new \Gamify\Classes\PointsManager();
$gamify_user_id        = get_current_user_id();
$gamify_points_val     = $gamify_points_manager->get_grand_total($gamify_user_id);
?>
<span class="gamify-pill-points">
    <span class="icon">🪙</span>
    <?php echo esc_html(number_format_i18n($gamify_points_val)); ?>
    <?php esc_html_e('Points', 'gamify'); ?>
</span>