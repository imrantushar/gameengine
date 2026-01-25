<?php

namespace Gamify;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Helper
 * Utility functions and centralized data for the Gamify plugin.
 */
class Helper
{

    /**
     * Sanitize a checkbox field to boolean.
     *
     * @param mixed $boolean Input value.
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
     * Centralized menu structure with dynamic taxonomy integration.
     *
     * @return array
     */
    public static function get_admin_menu_list()
    {
        $slug = 'gamify'; // Main plugin slug
        $menu = array();

        //  Dashboard
        $menu[$slug] = array(
            'parent_slug' => $slug,
            'title'       => __('Dashboard', 'gamify'),
            'capability'  => 'manage_options',
        );

        // Points System
        $menu[$slug . '-points'] = array(
            'parent_slug' => $slug,
            'title'       => __('Points System', 'gamify'),
            'capability'  => 'manage_options',
        );

        // Achievements with Nested Submenu
        $menu[$slug . '-achievements'] = array(
            'parent_slug' => $slug,
            'title'       => __('Achievements', 'gamify'),
            'capability'  => 'manage_options',
            'sub_items'   => array(
                array('title' => __('All Achievements', 'gamify'), 'slug' => ''),
                array('title' => __('Types', 'gamify'), 'slug' => 'achievement-types'),
            )
        );

        // Levels with Nested Submenu
        $menu[$slug . '-levels'] = array(
            'parent_slug' => $slug,
            'title'       => __('Levels', 'gamify'),
            'capability'  => 'manage_options',
            'sub_items'   => array(
                array('title' => __('All Levels', 'gamify'), 'slug' => ''),
                array('title' => __('Types', 'gamify'), 'slug' => 'level-types'),
            )
        );

        // Logs
        $menu[$slug . '-logs'] = array(
            'parent_slug' => $slug,
            'title'       => __('Logs', 'gamify'),
            'capability'  => 'manage_options',
        );

        // Leaderboards
        $menu[$slug . '-leaderboards'] = array(
            'parent_slug' => $slug,
            'title'       => __('Leaderboards', 'gamify'),
            'capability'  => 'manage_options',
        );

        // Addons
        $menu[$slug . '-addons'] = array(
            'parent_slug' => $slug,
            'title'       => __('Addons', 'gamify'),
            'capability'  => 'manage_options',
        );

        $menu[$slug . '-tools'] = array(
            'parent_slug' => $slug,
            'title'       => __('Tools', 'gamify'),
            'capability'  => 'manage_options',
            'slug'        => 'tools',
        );

        //  Settings
        $menu[$slug . '-settings'] = array(
            'parent_slug' => $slug,
            'title'       => __('Settings', 'gamify'),
            'capability'  => 'manage_options',
        );

        return apply_filters('gamify/admin_menu_list', $menu);
    }

    /**
     * Template loader for standardizing template parts.
     *
     * @param string $template_name Name of the template.
     * @param array  $args          Arguments to extract.
     * @param string $template_path Custom path.
     * @param string $default_path  Default path.
     */
    public static function get_template($template_name, $args = array(), $template_path = '', $default_path = '')
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
            extract($args, EXTR_SKIP); // phpcs:ignore WordPress.PHP.DontExtract.extract_extract
        }

        if ($template && file_exists($template)) {
            include $template;
        }
    }

    /**
     * Locate template path with theme override support.
     *
     * @param string $template_name Name of the template.
     * @param string $template_path Custom folder in theme.
     * @param string $default_path  Plugin template folder.
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

        $template = locate_template(array(trailingslashit($template_path) . $template_name));

        if (! $template) {
            $template = $default_path . $template_name;
        }

        return apply_filters('gamify_locate_template', $template, $template_name, $template_path, $default_path);
    }
}
