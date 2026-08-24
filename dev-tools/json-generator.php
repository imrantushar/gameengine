<?php

namespace GameEngine\Dev;

if (!defined('ABSPATH')) exit;

class JsonGenerator
{
    /**
     * generator method
     */
    public static function generate()
    {

        \GameEngine\Classes\TriggerRegistry::init();

        $integrations_data = \GameEngine\Classes\TriggerRegistry::get_all_integrations();

        $manifest = [
            'version'      => defined('GAMEENGINE_VERSION') ? GAMEENGINE_VERSION : '1.0.0',
            'generated_at' => current_time('mysql'),
            'integrations' => $integrations_data
        ];

        $dir  = GAMEENGINE_PATH . 'assets/json';
        $file = $dir . '/integrations.json';

        if (!file_exists($dir)) {
            wp_mkdir_p($dir);
        }

        global $wp_filesystem;

        if (! $wp_filesystem) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        if (! $wp_filesystem) {
            return false;
        }

        return $wp_filesystem->put_contents(
            $file,
            wp_json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            FS_CHMOD_FILE
        );
    }
}
