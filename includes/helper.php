<?php

namespace Gamify;

if (! defined('ABSPATH')) {
    exit;
}

class Helper
{
    /**
     * Sanitize a checkbox field to boolean.
     * 
     * @param mixed $boolean
     * @return bool
     */
    public static function sanitize_checkbox_field($boolean)
    {
        return filter_var(sanitize_text_field($boolean), FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Get the client IP address.
     * 
     * @return string
     */
    public static function get_client_ip_address()
    {
        $ip_address = '';
        if (getenv('HTTP_CLIENT_IP')) {
            $ip_address = getenv('HTTP_CLIENT_IP');
        } elseif (getenv('REMOTE_ADDR')) {
            $ip_address = getenv('REMOTE_ADDR');
        } elseif (getenv('HTTP_FORWARDED_FOR')) {
            $ip_address = getenv('HTTP_FORWARDED_FOR');
        } elseif (getenv('HTTP_FORWARDED')) {
            $ip_address = getenv('HTTP_FORWARDED');
        } elseif (getenv('HTTP_X_FORWARDED_FOR')) {
            $ip_address = getenv('HTTP_X_FORWARDED_FOR');
        } elseif (getenv('HTTP_X_FORWARDED')) {
            $ip_address = getenv('HTTP_X_FORWARDED');
        }

        return $ip_address;
    }

    /**
     * Get current time with offset.
     * 
     * @return int
     */
    public static function get_time()
    {
        return time() + (get_option('gmt_offset') * HOUR_IN_SECONDS);
    }

    /**
     * List of admin menu items.
     * This centralizes the menu structure for the plugin.
     * 
     * @return array
     */
    public static function get_admin_menu_list()
    {
        $slug = 'gamify'; // Main plugin slug

        $menu = [];

        // Dashboard (matches parent slug)
        $menu[$slug] = [
            'parent_slug' => $slug,
            'title'       => __('Dashboard', 'gamify'),
            'capability'  => 'manage_options',
        ];

        // Points System
        $menu[$slug . '-points'] = [
            'parent_slug' => $slug,
            'title'       => __('Points System', 'gamify'),
            'capability'  => 'manage_options',
        ];

        // Achievements
        $menu[$slug . '-achievements'] = [
            'parent_slug' => $slug,
            'title'       => __('Achievements', 'gamify'),
            'capability'  => 'manage_options',
        ];

        // Levels
        $menu[$slug . '-levels'] = [
            'parent_slug' => $slug,
            'title'       => __('Levels', 'gamify'),
            'capability'  => 'manage_options',
        ];

        // Logs
        $menu[$slug . '-logs'] = [
            'parent_slug' => $slug,
            'title'       => __('Logs', 'gamify'),
            'capability'  => 'manage_options',
        ];

        // Leaderboards
        $menu[$slug . '-leaderboards'] = [
            'parent_slug' => $slug,
            'title'       => __('Leaderboards', 'gamify'),
            'capability'  => 'manage_options',
        ];

        // Settings
        $menu[$slug . '-settings'] = [
            'parent_slug' => $slug,
            'title'       => __('Settings', 'gamify'),
            'capability'  => 'manage_options',
        ];

        return apply_filters('gamify/admin_menu_list', $menu);
    }

    /**
     * Template loader similar to gamify.
     * 
     * @param string $template_name
     * @param array $args
     * @param string $template_path
     * @param string $default_path
     */
    public static function get_template($template_name, $args = [], $template_path = '', $default_path = '')
    {
        $template = self::locate_template($template_name, $template_path, $default_path);

        $action_args = array(
            'template_name' => $template_name,
            'template_path' => $template_path,
            'located'       => $template,
            'args'          => $args,
        );

        do_action('gamify_before_get_template', $action_args);

        if (! empty($args) && is_array($args)) {
            extract($args, EXTR_SKIP);
        }

        if ($template && file_exists($template)) {
            include $template;
        }
    }

    /**
     * Locate template path.
     * 
     * @param string $template_name
     * @param string $template_path
     * @param string $default_path
     * @return string
     */
    public static function locate_template($template_name, $template_path = '', $default_path = '')
    {
        if (! $template_path) {
            $template_path = 'gamify/';
        }

        if (! $default_path) {
            $default_path = trailingslashit(GAMIFY_PATH) . 'templates/';
        }

        $template = locate_template([trailingslashit($template_path) . $template_name]);

        if (! $template) {
            $template = $default_path . $template_name;
        }

        return apply_filters('gamify_locate_template', $template, $template_name, $template_path, $default_path);
    }
}
