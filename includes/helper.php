<?php

namespace GameEngine;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Helper
 * Utility functions and centralized data for the GameEngine plugin.
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
     * Check if a specific plugin is active.
     *
     * @param string $plugin_class The main class of the plugin to check.
     * @return bool
     */

    public static function is_plugin_active($plugin_class)
    {
        return class_exists($plugin_class);
    }

    /**
     * Check if a academy lms plugin is active.
     *
     * @param string $plugin_class The main class of the plugin to check.
     * @return bool
     */

    public static function is_academylms_active()
    {

        if (defined('ACADEMY_VERSION') || class_exists('\Academy\Academy') || function_exists('academy_start')) {
            return true;
        }
        return false;
    }

    /**
     * Check if a tutor lms plugin is active.
     *
     * @return bool
     */
    public static function is_tutorlms_active()
    {

        if (defined('TUTOR_VERSION') || function_exists('tutor_lms') || class_exists('TUTOR\Tutor')) {
            return true;
        }
        return false;
    }

    public static function is_pro()
    {
        return defined('GAMEENGINE_PRO_VERSION');
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

    public static function is_addon_active($addon_name)
    {
        $active_addons = get_option('gameengine_active_addons', []);
        return in_array($addon_name, (array) $active_addons, true);
    }

    /**
     * List of admin menu items.
     * Centralized menu structure with dynamic taxonomy integration.
     *
     * @return array
     */
    public static function get_admin_menu_list()
    {
        $slug = 'gameengine'; // Main plugin slug
        $menu = array();

        //  Dashboard
        $menu[$slug] = array(
            'parent_slug' => $slug,
            'title' => __('Dashboard', 'gameengine'),
            'capability' => 'manage_options',
        );

        // Points System
        $menu[$slug . '-points'] = array(
            'parent_slug' => $slug,
            'title' => __('Points System', 'gameengine'),
            'capability' => 'manage_options',
        );

        // Achievements with Nested Submenu
        $menu[$slug . '-achievements'] = array(
            'parent_slug' => $slug,
            'title' => __('Achievements', 'gameengine'),
            'capability' => 'manage_options',
            'sub_items' => array(
                array('title' => __('All Achievements', 'gameengine'), 'slug' => ''),
                array('title' => __('Types', 'gameengine'), 'slug' => 'achievement-types'),
            )
        );

        // Levels with Nested Submenu
        $menu[$slug . '-levels'] = array(
            'parent_slug' => $slug,
            'title' => __('Levels', 'gameengine'),
            'capability' => 'manage_options',
            'sub_items' => array(
                array('title' => __('All Levels', 'gameengine'), 'slug' => ''),
                array('title' => __('Types', 'gameengine'), 'slug' => 'level-types'),
            )
        );

        // Badge Editor (standalone page)
        $menu[$slug . '-badge-editor'] = array(
            'parent_slug' => $slug,
            'title' => __('Badge Editor', 'gameengine'),
            'capability' => 'manage_options',
        );

        // Ranks
        $menu[$slug . '-ranks'] = array(
            'parent_slug' => $slug,
            'title' => __('Ranks', 'gameengine'),
            'capability' => 'manage_options',
        );

        // Streaks
        $menu[$slug . '-streaks'] = array(
            'parent_slug' => $slug,
            'title' => __('Streaks', 'gameengine'),
            'capability' => 'manage_options',
        );

        // Logs
        $menu[$slug . '-logs'] = array(
            'parent_slug' => $slug,
            'title' => __('Logs', 'gameengine'),
            'capability' => 'manage_options',
        );

        // Leaderboards
        $menu[$slug . '-leaderboards'] = array(
            'parent_slug' => $slug,
            'title' => __('Leaderboards', 'gameengine'),
            'capability' => 'manage_options',
        );
        
        // Referrals
        if (self::is_addon_active('referrals')) {
            $menu[$slug . '-referrals'] = array(
                'parent_slug' => $slug,
                'title' => __('Referrals', 'gameengine'),
                'capability' => 'manage_options',
            );
        }

        // Wallet System
        if (self::is_addon_active('wallet')) {
            $menu[$slug . '-wallet'] = array(
                'parent_slug' => $slug,
                'title' => __('Wallet', 'gameengine'),
                'capability' => 'manage_options',
            );
        }

        // Lucky Wheels
        if (self::is_addon_active('lucky-wheels')) {
            $menu[$slug . '-lucky-wheels'] = array(
                'parent_slug' => $slug,
                'title' => __('Lucky Wheels', 'gameengine'),
                'capability' => 'manage_options',
            );
        }

        // Addons
        $menu[$slug . '-addons'] = array(
            'parent_slug' => $slug,
            'title' => __('Addons', 'gameengine'),
            'capability' => 'manage_options',
        );

        $menu[$slug . '-tools'] = array(
            'parent_slug' => $slug,
            'title' => __('Tools', 'gameengine'),
            'capability' => 'manage_options',
        );

        //  Settings
        $menu[$slug . '-settings'] = array(
            'parent_slug' => $slug,
            'title' => __('Settings', 'gameengine'),
            'capability' => 'manage_options',
        );

        return apply_filters('gameengine/admin_menu_list', $menu);
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
            'located' => $template,
            'args' => $args,
        );

        do_action('gameengine_before_get_template', $action_args);

        if (!empty($args) && is_array($args)) {
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
        if (!$template_path) {
            $template_path = 'gameengine/';
        }

        if (!$default_path) {
            $default_path = trailingslashit(GAMEENGINE_PATH) . 'templates/';
        }

        $template = locate_template(array(trailingslashit($template_path) . $template_name));

        if (!$template) {
            $template = $default_path . $template_name;
        }

        return apply_filters('gameengine_locate_template', $template, $template_name, $template_path, $default_path);
    }
    /**
     * Get the current cache version for a group.
     *
     * @param string $group Cache group name.
     * @return int
     */
    public static function get_cache_version($group)
    {
        $version = wp_cache_get('gameengine_v_' . $group, 'gameengine');
        return $version ? (int) $version : 1;
    }

    /**
     * Increment cache version to effectively flush a group.
     *
     * @param string $group Cache group name.
     */
    public static function clear_cache_group($group)
    {
        $version = self::get_cache_version($group);
        wp_cache_set('gameengine_v_' . $group, $version + 1, 'gameengine');

        do_action('gameengine_cache_flushed', $group);
    }
}
