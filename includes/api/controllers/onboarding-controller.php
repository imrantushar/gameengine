<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\PointsManager;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * The Dashboard's "Get started" checklist.
 *
 * Each step is worked out from the site's own data rather than a stored tick,
 * so the checklist stays true when something is created or removed elsewhere.
 * The only thing stored is what "See it work" awarded, kept per admin so it can
 * be undone row by row.
 */
class OnboardingController extends BaseController
{
    const TEST_POINTS    = 10;
    const TEST_CONTEXT   = 'onboarding_test';
    const TEST_META      = 'gameengine_onboarding_test';
    const DISMISSED_META = 'gameengine_onboarding_dismissed';
    const PAGE_OPTION    = 'gameengine_onboarding_page_id';

    /**
     * Tables a test award can add rows to. Each has an id and a user_id column.
     */
    const TEST_TABLES = array('points_log', 'user_achievements', 'user_levels', 'logs', 'notifications');

    /**
     * REST route base.
     */
    protected $rest_base = 'onboarding';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_status'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/test-points',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'award_test_points'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'undo_test_points'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/rewards-page',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'create_rewards_page'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/dismiss',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'set_dismissed'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * The checklist as it stands for the current admin.
     *
     * @return \WP_REST_Response
     */
    public function get_status()
    {
        return rest_ensure_response($this->build_status());
    }

    /**
     * Give the current admin test points through the normal award path, and
     * report what that unlocked.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function award_test_points()
    {
        global $wpdb;

        $user_id = get_current_user_id();
        $current = get_user_meta($user_id, self::TEST_META, true);

        // One test at a time: clicking again shows the first result rather than
        // piling more points onto the admin's account.
        if (is_array($current) && ! empty($current['ids'])) {
            return rest_ensure_response(
                array(
                    'result' => $this->public_result($current),
                    'status' => $this->build_status(),
                )
            );
        }

        $point_type_id = PointsManager::resolve_point_type_id(0);

        if (! $point_type_id) {
            return new \WP_Error('no_point_type', __('Create a point type first, then try again.', 'gameengine'), array('status' => 400));
        }

        $before  = $this->latest_ids($user_id);
        $manager = new PointsManager();

        // A test isn't news: no emails go out while it runs.
        add_filter('pre_wp_mail', array($this, 'skip_mail'));
        $log_id = $manager->add(
            $user_id,
            self::TEST_POINTS,
            self::TEST_CONTEXT,
            array(
                'point_type_id' => $point_type_id,
                'description'   => __('Test points from Get started', 'gameengine'),
            )
        );
        remove_filter('pre_wp_mail', array($this, 'skip_mail'));

        if (! $log_id) {
            return new \WP_Error('test_failed', __('The test points could not be added.', 'gameengine'), array('status' => 500));
        }

        $ids = $this->ids_since($user_id, $before);

        // A filter may change the amount, so report what was actually logged.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $points = (int) $wpdb->get_var($wpdb->prepare("SELECT points FROM {$wpdb->prefix}gameengine_points_log WHERE id = %d", $log_id));

        $test = array(
            'ids'             => $ids,
            'points'          => $points,
            'point_type_id'   => $point_type_id,
            'point_type'      => $this->point_type_name($point_type_id),
            'balance'         => $manager->get_total($user_id, $point_type_id),
            'achievement_ids' => $this->linked_ids('user_achievements', 'achievement_id', $ids['user_achievements']),
            'achievements'    => $this->titles('user_achievements', 'achievements', 'achievement_id', $ids['user_achievements']),
            'levels'          => $this->titles('user_levels', 'levels', 'level_id', $ids['user_levels']),
            'awarded_at'      => current_time('mysql'),
        );

        update_user_meta($user_id, self::TEST_META, $test);

        return rest_ensure_response(
            array(
                'result' => $this->public_result($test),
                'status' => $this->build_status(),
            )
        );
    }

    /**
     * Short-circuits wp_mail() while a test award runs.
     *
     * @return bool
     */
    public function skip_mail()
    {
        return false;
    }

    /**
     * Remove exactly the rows the test award created, and nothing else.
     *
     * @return \WP_REST_Response
     */
    public function undo_test_points()
    {
        global $wpdb;

        $user_id = get_current_user_id();
        $test    = get_user_meta($user_id, self::TEST_META, true);
        $removed = 0;

        if (is_array($test) && ! empty($test['ids'])) {
            foreach (self::TEST_TABLES as $table) {
                $ids = isset($test['ids'][$table]) ? array_values(array_filter(array_map('absint', (array) $test['ids'][$table]))) : array();

                if (empty($ids)) {
                    continue;
                }

                $placeholders = implode(',', array_fill(0, count($ids), '%d'));

                // Only this admin's rows, and only the ones the test created.
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
                $removed += (int) $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->prefix}gameengine_{$table} WHERE user_id = %d AND id IN ({$placeholders})", $user_id, ...$ids));
            }

            $point_type_id = isset($test['point_type_id']) ? absint($test['point_type_id']) : 0;

            wp_cache_delete("gameengine_user_points_{$user_id}_{$point_type_id}", 'gameengine');
            wp_cache_delete("gameengine_user_grand_total_{$user_id}", 'gameengine');
            wp_cache_delete("gameengine_all_levels_{$user_id}", 'gameengine');
            wp_cache_delete("gameengine_current_level_{$user_id}", 'gameengine');
            wp_cache_delete("gameengine_user_achs_{$user_id}", 'gameengine');

            foreach ((array) ($test['achievement_ids'] ?? array()) as $achievement_id) {
                wp_cache_delete('gameengine_ach_count_' . $user_id . '_' . absint($achievement_id), 'gameengine');
            }

            \GameEngine\Helper::clear_cache_group('leaderboard');
            \GameEngine\Helper::clear_cache_group('dashboard');
        }

        delete_user_meta($user_id, self::TEST_META);

        return rest_ensure_response(
            array(
                'removed' => $removed,
                'status'  => $this->build_status(),
            )
        );
    }

    /**
     * Create the draft "My Rewards" page, or return the one already created.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_rewards_page()
    {
        if (! current_user_can('publish_pages')) {
            return new \WP_Error('forbidden', __('You are not allowed to create pages.', 'gameengine'), array('status' => 403));
        }

        $post = $this->tracked_page();

        if (! $post) {
            $page_id = wp_insert_post(
                array(
                    'post_type'    => 'page',
                    'post_status'  => 'draft',
                    'post_title'   => __('My Rewards', 'gameengine'),
                    'post_content' => "<!-- wp:shortcode -->\n[gameengine_profile]\n<!-- /wp:shortcode -->\n\n<!-- wp:shortcode -->\n[gameengine_leaderboard]\n<!-- /wp:shortcode -->",
                ),
                true
            );

            if (is_wp_error($page_id)) {
                return new \WP_Error('page_failed', $page_id->get_error_message(), array('status' => 500));
            }

            update_option(self::PAGE_OPTION, (int) $page_id, false);
            $post = get_post($page_id);
        }

        return rest_ensure_response(
            array(
                'page'   => $this->page_summary($post),
                'status' => $this->build_status(),
            )
        );
    }

    /**
     * Hide the checklist for the current admin, or show it again.
     *
     * @param \WP_REST_Request $request Request; `dismissed` defaults to true.
     * @return \WP_REST_Response
     */
    public function set_dismissed(\WP_REST_Request $request)
    {
        $user_id   = get_current_user_id();
        $dismissed = null === $request->get_param('dismissed') ? true : rest_sanitize_boolean($request->get_param('dismissed'));

        if ($dismissed) {
            update_user_meta($user_id, self::DISMISSED_META, 1);
        } else {
            delete_user_meta($user_id, self::DISMISSED_META);
        }

        return rest_ensure_response($this->build_status());
    }

    /**
     * Steps and their state.
     *
     * @return array
     */
    private function build_status()
    {
        $user_id = get_current_user_id();
        $test    = get_user_meta($user_id, self::TEST_META, true);
        $page    = $this->members_page();
        $rule    = $this->first_rule();

        $steps = array(
            array(
                'key'        => 'points_rule',
                'done'       => null !== $rule,
                'rule'       => $rule,
                'point_type' => $this->first_point_type(),
            ),
            array(
                'key'    => 'see_it_work',
                'done'   => is_array($test) && ! empty($test['ids']),
                'result' => is_array($test) && ! empty($test['ids']) ? $this->public_result($test) : null,
            ),
            array(
                'key'  => 'members_page',
                'done' => null !== $page && 'publish' === $page['status'],
                'page' => $page,
            ),
        );

        /**
         * Filters the steps of the Dashboard's "Get started" checklist.
         *
         * @param array $steps Steps, each with a `key` and a boolean `done`.
         */
        $steps = array_values((array) apply_filters('gameengine_onboarding_steps', $steps));

        return array(
            'steps'           => $steps,
            'complete'        => ! in_array(false, array_map('boolval', wp_list_pluck($steps, 'done')), true),
            'dismissed'       => (bool) get_user_meta($user_id, self::DISMISSED_META, true),
            'setup_completed' => 'yes' === get_option('gameengine_setup_completed'),
        );
    }

    /**
     * The earliest active award rule that pays a published point type.
     *
     * @return array|null
     */
    private function first_rule()
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT r.trigger_key, r.parameters, p.id AS point_type_id, p.name
                 FROM {$wpdb->prefix}gameengine_requirements r
                 INNER JOIN {$wpdb->prefix}gameengine_point_types p ON p.id = r.reward_id
                 WHERE r.reward_type = %s AND r.action_type = %s AND r.is_active = 1 AND p.status = %s
                 ORDER BY r.id ASC
                 LIMIT 1",
                'point_type',
                'award',
                'publish'
            ),
            ARRAY_A
        );

        if (! $row) {
            return null;
        }

        $params  = json_decode((string) $row['parameters'], true);
        $trigger = class_exists('\GameEngine\Classes\TriggerRegistry') ? \GameEngine\Classes\TriggerRegistry::get((string) $row['trigger_key']) : null;

        return array(
            'point_type_id' => (int) $row['point_type_id'],
            'point_type'    => $row['name'],
            'points'        => is_array($params) && isset($params['points']) ? (int) $params['points'] : null,
            'trigger'       => is_array($trigger) && ! empty($trigger['label']) ? $trigger['label'] : $row['trigger_key'],
        );
    }

    /**
     * The point type a test award would use, if there is one.
     *
     * @return array|null
     */
    private function first_point_type()
    {
        $point_type_id = PointsManager::resolve_point_type_id(0);

        return $point_type_id ? array(
            'id'   => $point_type_id,
            'name' => $this->point_type_name($point_type_id),
        ) : null;
    }

    /**
     * A point type's name.
     *
     * @param int $point_type_id Point type id.
     * @return string
     */
    private function point_type_name($point_type_id)
    {
        foreach (PointsManager::get_point_types() as $row) {
            $row = (array) $row;
            if ((int) ($row['id'] ?? 0) === (int) $point_type_id) {
                return (string) ($row['name'] ?? '');
            }
        }

        return '';
    }

    /**
     * The page members can see: the one created here once it is published,
     * otherwise any published page or post that already carries a GameEngine
     * shortcode, otherwise the draft created here.
     *
     * @return array|null
     */
    private function members_page()
    {
        global $wpdb;

        $tracked = $this->tracked_page();

        if ($tracked && 'publish' === $tracked->post_status) {
            return $this->page_summary($tracked);
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $found = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_type IN ('page', 'post') AND post_status = %s AND post_content LIKE %s ORDER BY ID DESC LIMIT 1",
                'publish',
                '%' . $wpdb->esc_like('[gameengine_') . '%'
            )
        );

        if ($found) {
            return $this->page_summary(get_post($found));
        }

        return $tracked ? $this->page_summary($tracked) : null;
    }

    /**
     * The page created by this checklist, while it still exists.
     *
     * @return \WP_Post|null
     */
    private function tracked_page()
    {
        $page_id = absint(get_option(self::PAGE_OPTION));
        $post    = $page_id ? get_post($page_id) : null;

        return $post && 'page' === $post->post_type && 'trash' !== $post->post_status ? $post : null;
    }

    /**
     * What the checklist shows about a page.
     *
     * @param \WP_Post $post Page or post.
     * @return array
     */
    private function page_summary($post)
    {
        return array(
            'id'        => (int) $post->ID,
            'title'     => get_the_title($post),
            'status'    => $post->post_status,
            'edit_link' => get_edit_post_link($post->ID, 'raw'),
            'view_link' => 'publish' === $post->post_status ? get_permalink($post) : get_preview_post_link($post),
        );
    }

    /**
     * The newest row id per test table for a user.
     *
     * @param int $user_id User id.
     * @return array<string, int>
     */
    private function latest_ids($user_id)
    {
        global $wpdb;

        $latest = array();

        foreach (self::TEST_TABLES as $table) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $latest[$table] = (int) $wpdb->get_var($wpdb->prepare("SELECT COALESCE(MAX(id), 0) FROM {$wpdb->prefix}gameengine_{$table} WHERE user_id = %d", $user_id));
        }

        return $latest;
    }

    /**
     * Row ids added for a user since `latest_ids()` was taken.
     *
     * @param int   $user_id User id.
     * @param array $before  Result of latest_ids().
     * @return array<string, int[]>
     */
    private function ids_since($user_id, array $before)
    {
        global $wpdb;

        $ids = array();

        foreach (self::TEST_TABLES as $table) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $ids[$table] = array_map('intval', $wpdb->get_col($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_{$table} WHERE user_id = %d AND id > %d ORDER BY id ASC", $user_id, $before[$table] ?? 0)));
        }

        return $ids;
    }

    /**
     * Ids a set of link rows point at, e.g. the achievement ids of user_achievements rows.
     *
     * @param string $link_table Link table without prefix.
     * @param string $column     Column holding the linked id.
     * @param int[]  $ids        Link row ids.
     * @return int[]
     */
    private function linked_ids($link_table, $column, array $ids)
    {
        global $wpdb;

        if (empty($ids)) {
            return array();
        }

        $placeholders = implode(',', array_fill(0, count($ids), '%d'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
        return array_map('intval', $wpdb->get_col($wpdb->prepare("SELECT {$column} FROM {$wpdb->prefix}gameengine_{$link_table} WHERE id IN ({$placeholders})", ...array_map('absint', $ids))));
    }

    /**
     * Titles of the achievements or levels a set of link rows point at.
     *
     * @param string $link_table Link table without prefix.
     * @param string $item_table Item table without prefix.
     * @param string $column     Column holding the item id.
     * @param int[]  $ids        Link row ids.
     * @return string[]
     */
    private function titles($link_table, $item_table, $column, array $ids)
    {
        global $wpdb;

        if (empty($ids)) {
            return array();
        }

        $placeholders = implode(',', array_fill(0, count($ids), '%d'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
        return $wpdb->get_col($wpdb->prepare("SELECT i.title FROM {$wpdb->prefix}gameengine_{$link_table} l INNER JOIN {$wpdb->prefix}gameengine_{$item_table} i ON i.id = l.{$column} WHERE l.id IN ({$placeholders}) ORDER BY l.id ASC", ...array_map('absint', $ids)));
    }

    /**
     * A test result without the row ids, for the browser.
     *
     * @param array $test Stored test.
     * @return array
     */
    private function public_result(array $test)
    {
        return array(
            'points'       => (int) ($test['points'] ?? 0),
            'point_type'   => (string) ($test['point_type'] ?? ''),
            'balance'      => (int) ($test['balance'] ?? 0),
            'achievements' => array_values((array) ($test['achievements'] ?? array())),
            'levels'       => array_values((array) ($test['levels'] ?? array())),
            'awarded_at'   => (string) ($test['awarded_at'] ?? ''),
        );
    }
}
