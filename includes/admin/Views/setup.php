<?php
if (! defined('ABSPATH')) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php
    /**
     * wp_head handles all CSS and JS enqueued in Setup.php
     */
    wp_head();
    ?>
</head>

<body <?php body_class(); ?>>

    <div id="gameengine-setup-app">
        <div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
            <h2><?php esc_html_e('Loading Setup Wizard...', 'gameengine'); ?></h2>
        </div>
    </div>

    <?php wp_footer(); ?>
</body>

</html>