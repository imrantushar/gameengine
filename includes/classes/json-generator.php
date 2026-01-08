<?php

namespace Gamify\Classes;

if (!defined('ABSPATH')) exit;

class JsonGenerator
{
    /**
     * generator method
     */
    public static function generate()
    {

        \Gamify\Classes\TriggerRegistry::init();

        $integrations_data = \Gamify\Classes\TriggerRegistry::get_all_integrations();

        $manifest = [
            'version'      => defined('GAMIFY_VERSION') ? GAMIFY_VERSION : '1.0.0',
            'generated_at' => current_time('mysql'),
            'integrations' => $integrations_data
        ];

        $dir  = GAMIFY_PATH . 'assets/json';
        $file = $dir . '/integrations.json';

        if (!file_exists($dir)) {
            wp_mkdir_p($dir);
        }

        $status = file_put_contents($file, wp_json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return $status !== false;
    }
}
