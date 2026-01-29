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
    <?php wp_head(); ?>
    <style>
        /* Basic reset for a clean full-screen setup experience */
        body {
            background: #f0f2f5;
            margin: 0;
            padding: 0;
        }

        #gameengine-setup-app {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>

<body <?php body_class(); ?>>

    <!-- React App Container -->
    <div id="gameengine-setup-app">
        <div class="gf-setup-loading">
            <h2><?php esc_html_e('Initializing Setup Wizard...', 'gameengine'); ?></h2>
        </div>
    </div>

    <?php wp_footer(); ?>
</body>

</html>