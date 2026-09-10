<?php

namespace GameEngine\Addons\AcademyLMS;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Achievements & levels lists for the Academy course-builder dropdowns
 * (the "GameEngine Unlock" rule editor and the free "Content Restriction"
 * box). Served under the `gameengine_academy/*` AJAX namespace.
 *
 * Extends Academy's own AbstractAjaxHandler so the `security` nonce the
 * course-builder React bundle already sends (`academy_nonce`) is verified
 * with the exact same logic as every other Academy course-builder request —
 * this class only loads when Academy is present, so the base class is safe
 * to rely on.
 */
class Ajax extends \Academy\Classes\AbstractAjaxHandler
{
    protected $namespace = 'gameengine_academy';

    public function __construct()
    {
        $this->actions = array(
            'get_achievements' => array(
                'callback'   => array($this, 'get_all_achievements'),
                'capability' => 'edit_academy_courses',
            ),
            'get_levels'       => array(
                'callback'   => array($this, 'get_all_levels'),
                'capability' => 'edit_academy_courses',
            ),
        );
    }

    public static function init()
    {
        (new self())->dispatch_actions();
    }

    public function get_all_achievements()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gameengine_achievements ORDER BY title ASC");

        $args = array();
        foreach ((array) $rows as $row) {
            $args[] = array(
                'value' => (int) $row->id,
                'label' => $row->title,
            );
        }
        wp_send_json_success($args);
    }

    public function get_all_levels()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gameengine_levels ORDER BY priority ASC");

        $args = array();
        foreach ((array) $rows as $row) {
            $args[] = array(
                'value' => (int) $row->id,
                'label' => $row->title,
            );
        }
        wp_send_json_success($args);
    }
}
