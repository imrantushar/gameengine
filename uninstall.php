<?php
/**
 * Runs when GameEngine is deleted from the Plugins screen.
 *
 * Nothing is removed unless "Delete all data when GameEngine is deleted" is on
 * in GameEngine's Settings. By default every point, achievement,
 * level and log survives, so deleting and reinstalling the plugin loses
 * nothing. See GameEngine\Core\Uninstaller for exactly what goes when it is on.
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

require_once __DIR__ . '/includes/core/uninstaller.php';

\GameEngine\Core\Uninstaller::run();
