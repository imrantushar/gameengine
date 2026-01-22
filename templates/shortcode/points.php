<?php
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Template for [gamify_points] shortcode.
 */
$points_manager = new \Gamify\Classes\PointsManager();
$user_id        = get_current_user_id();
$points         = $points_manager->get_grand_total($user_id);
?>

<span class="gamify-pill-points">
    <span class="icon">🪙</span>
    <?php echo esc_html(number_format_i18n($points)); ?>
    <?php esc_html_e('Points', 'gamify'); ?>
</span>