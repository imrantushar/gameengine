<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class AddonsController
 * Handles API requests for fetching and toggling addon statuses.
 */
class AddonsController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'addons';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        // Route to get active status map: { "email": true, ... }
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_addons'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        // NEW Route to get detailed list for UI cards
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/list',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_detailed_addons_list'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        // Route to update/toggle addon status
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'update_addons'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Returns current status of all addons as a boolean map.
     *
     * @return \WP_REST_Response
     */
    public function get_addons()
    {
        return new \WP_REST_Response($this->get_addons_status_mapped(), 200);
    }

    /**
     * Returns detailed list of addons with metadata for frontend UI.
     *
     * @return \WP_REST_Response
     */
    public function get_detailed_addons_list()
    {
        $active_addons = get_option('gameengine_active_addons', array());
        $is_pro_installed = class_exists('\GameEngine\Pro\Pro_Init');
        $addons = array(
            array(
                'slug'   => 'academylms',
                'name'   => __('Academy LMS', 'gameengine'),
                'desc'   => __('Reward users for course completions and quiz attempts.', 'gameengine'),
                'icon'   => 'dashicons-welcome-learn-more',
                'active' => in_array('academylms', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'tutorlms',
                'name'   => __('Tutor LMS', 'gameengine'),
                'desc'   => __('Reward users for course completions, lessons, and quizzes.', 'gameengine'),
                'icon'   => 'dashicons-welcome-learn-more',
                'active' => in_array('tutorlms', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'woocommerce',
                'name'   => __('WooCommerce', 'gameengine'),
                'desc'   => __('Integrate gamification with your e-commerce store activities.', 'gameengine'),
                'icon'   => 'dashicons-cart',
                'active' => in_array('woocommerce', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'storeengine',
                'name'   => __('StoreEngine', 'gameengine'),
                'desc'   => __('Advanced WooCommerce features and rewards integration.', 'gameengine'),
                'icon'   => 'dashicons-store',
                'active' => in_array('storeengine', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'restrict_unlock',
                'name'   => __('Restrict Unlock', 'gameengine'),
                'desc'   => __('Set dependencies between achievements and levels.', 'gameengine'),
                'icon'   => 'dashicons-lock',
                'active' => in_array('restrict_unlock', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'progress_map',
                'name'   => __('Progress Map', 'gameengine'),
                'desc'   => __('Display a visual roadmap of user progress on frontend.', 'gameengine'),
                'icon'   => 'dashicons-location-alt',
                'active' => in_array('progress_map', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'restrict_content',
                'name'   => __('Restrict Content', 'gameengine'),
                'desc'   => __('Lock specific posts, pages, images or links based on points and badges.', 'gameengine'),
                'icon'   => 'dashicons-visibility',
                'active' => in_array('restrict_content', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),

            array(
                'slug'      => 'wallet',
                'name'      => __('Wallet & Payouts', 'gameengine'),
                'desc'      => __('Manage withdrawal requests and user wallet balance from a dedicated menu.', 'gameengine'),
                'icon'      => 'dashicons-wallet',
                'active'    => $is_pro_installed && in_array('wallet', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'referrals',
                'name'      => __('Referrals & Affiliates', 'gameengine'),
                'desc'      => __('Manage referral links, clicks, and affiliate earnings.', 'gameengine'),
                'icon'      => 'dashicons-groups',
                'active'    => $is_pro_installed && in_array('referrals', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'lucky-wheels',
                'name'      => __('Spin the Wheel', 'gameengine'),
                'desc'      => __('Allow users to spin a lucky wheel to win points and rewards.', 'gameengine'),
                'icon'      => 'dashicons-update',
                'active'    => $is_pro_installed && in_array('lucky-wheels', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),

            // ── New free addons ─────────────────────────────────────────────
            array(
                'slug'   => 'points_expiration',
                'name'   => __('Points Expiration', 'gameengine'),
                'desc'   => __('Automatically expire awarded points after a configurable number of days.', 'gameengine'),
                'icon'   => 'dashicons-calendar-alt',
                'active' => in_array('points_expiration', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'enhanced_email_notifications',
                'name'   => __('Enhanced Email Notifications', 'gameengine'),
                'desc'   => __('Send customisable HTML emails on points, achievements, levels, birthdays, and anniversaries.', 'gameengine'),
                'icon'   => 'dashicons-email-alt',
                'active' => in_array('enhanced_email_notifications', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'new_engagement_triggers',
                'name'   => __('New Engagement Triggers', 'gameengine'),
                'desc'   => __('Award points for link clicks, video watches, birthdays, and anniversaries.', 'gameengine'),
                'icon'   => 'dashicons-video-alt3',
                'active' => in_array('new_engagement_triggers', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'social_sharing',
                'name'   => __('Social Sharing', 'gameengine'),
                'desc'   => __('Let users share achievement unlocks and level-ups on social networks.', 'gameengine'),
                'icon'   => 'dashicons-share',
                'active' => in_array('social_sharing', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'bulk_admin_tools',
                'name'   => __('Bulk Admin Tools', 'gameengine'),
                'desc'   => __('Award or revoke points, badges, and levels in bulk by role or CSV upload.', 'gameengine'),
                'icon'   => 'dashicons-editor-table',
                'active' => in_array('bulk_admin_tools', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'data_import_export',
                'name'   => __('Data Import / Export', 'gameengine'),
                'desc'   => __('Export and import point balances and plugin configuration as CSV or JSON.', 'gameengine'),
                'icon'   => 'dashicons-database-import',
                'active' => in_array('data_import_export', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'progress_bar',
                'name'   => __('Progress Bar', 'gameengine'),
                'desc'   => __('Display a visual progress bar toward the next level or an achievement.', 'gameengine'),
                'icon'   => 'dashicons-minus',
                'active' => in_array('progress_bar', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'buddypress_integration',
                'name'   => __('BuddyPress / BuddyBoss', 'gameengine'),
                'desc'   => __('Award points for forum posts, group joins, friendships, and profile updates.', 'gameengine'),
                'icon'   => 'dashicons-groups',
                'active' => in_array('buddypress_integration', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'learndash_integration',
                'name'   => __('LearnDash', 'gameengine'),
                'desc'   => __('Award points for course, lesson, and quiz completions in LearnDash.', 'gameengine'),
                'icon'   => 'dashicons-welcome-learn-more',
                'active' => in_array('learndash_integration', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),
            array(
                'slug'   => 'bbpress_integration',
                'name'   => __('bbPress', 'gameengine'),
                'desc'   => __('Award points for bbPress forum topics, replies, and first posts.', 'gameengine'),
                'icon'   => 'dashicons-format-chat',
                'active' => in_array('bbpress_integration', $active_addons, true),
                'is_pro' => false,
                'is_locked' => false,
            ),

            // ── New pro addons ──────────────────────────────────────────────
            array(
                'slug'      => 'point_transfers',
                'name'      => __('Point Transfers', 'gameengine'),
                'desc'      => __('Allow users to send points to each other with configurable fees and limits.', 'gameengine'),
                'icon'      => 'dashicons-arrow-right-alt',
                'active'    => $is_pro_installed && in_array('point_transfers', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'buy_points',
                'name'      => __('Buy Points', 'gameengine'),
                'desc'      => __('Sell point packages via PayPal and Stripe with admin order management.', 'gameengine'),
                'icon'      => 'dashicons-cart',
                'active'    => $is_pro_installed && in_array('buy_points', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'point_exchange',
                'name'      => __('Point Exchange', 'gameengine'),
                'desc'      => __('Let users convert one point type to another at a configured rate.', 'gameengine'),
                'icon'      => 'dashicons-randomize',
                'active'    => $is_pro_installed && in_array('point_exchange', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'points_cap',
                'name'      => __('Points Cap', 'gameengine'),
                'desc'      => __('Enforce a maximum point balance per type with global and per-role overrides.', 'gameengine'),
                'icon'      => 'dashicons-shield',
                'active'    => $is_pro_installed && in_array('points_cap', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'sell_content',
                'name'      => __('Sell Content', 'gameengine'),
                'desc'      => __('Lock posts and pages behind a points paywall with permanent unlock support.', 'gameengine'),
                'icon'      => 'dashicons-lock',
                'active'    => $is_pro_installed && in_array('sell_content', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'analytics_charts',
                'name'      => __('Analytics Charts', 'gameengine'),
                'desc'      => __('Visualise gain/loss, top earners, balance distribution, and circulation data.', 'gameengine'),
                'icon'      => 'dashicons-chart-area',
                'active'    => $is_pro_installed && in_array('analytics_charts', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'toast_notifications',
                'name'      => __('Toast Notifications', 'gameengine'),
                'desc'      => __('Show real-time browser toasts when users earn points, badges, or levels.', 'gameengine'),
                'icon'      => 'dashicons-bell',
                'active'    => $is_pro_installed && in_array('toast_notifications', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
            array(
                'slug'      => 'open_badges',
                'name'      => __('Open Badges', 'gameengine'),
                'desc'      => __('Issue IMS Open Badges v2.0 assertions when users earn achievements.', 'gameengine'),
                'icon'      => 'dashicons-awards',
                'active'    => $is_pro_installed && in_array('open_badges', (array) $active_addons, true),
                'is_pro'    => true,
                'is_locked' => ! $is_pro_installed,
            ),
        );

        return new \WP_REST_Response($addons, 200);
    }

    /**
     * Updates the status of a specific addon.
     */
    public function update_addons($request)
    {
        $params     = $request->get_json_params();
        $addon_name = isset($params['addon']) ? sanitize_key($params['addon']) : '';
        $status     = isset($params['status']) ? (bool) $params['status'] : false;

        if (empty($addon_name)) {
            return new \WP_Error('missing_data', 'Addon name is required.', array('status' => 400));
        }


        $is_pro_installed = class_exists('\GameEngine\Pro\Pro_Init');

        if (true === $status) {
            // Referrals (Pro only)
            if ('referrals' === $addon_name && ! $is_pro_installed) {
                return new \WP_Error(
                    'pro_required',
                    __('Referrals addon requires GameEngine Pro.', 'gameengine'),
                    array('status' => 403)
                );
            }

            // Academy LMS Check
            if ('academylms' === $addon_name) {
                if (! \GameEngine\Helper::is_academylms_active()) {
                    return new \WP_Error(
                        'dependency_missing',
                        __('Academy LMS is required.', 'gameengine'),
                        array('status' => 424)
                    );
                }
            }

            // Tutor LMS Check
            if ('tutorlms' === $addon_name) {
                if (! \GameEngine\Helper::is_tutorlms_active()) {
                    return new \WP_Error(
                        'dependency_missing',
                        __('Tutor LMS is required.', 'gameengine'),
                        array('status' => 424)
                    );
                }
            }

            // StoreEngine Check 
            if ('storeengine' === $addon_name && ! defined('STOREENGINE_VERSION')) {
                return new \WP_Error('dependency_missing', __('StoreEngine plugin is required.', 'gameengine'), array('status' => 424));
            }

            // WooCommerce Check
            if ('woocommerce' === $addon_name) {
                if (! class_exists('WooCommerce')) {
                    return new \WP_Error(
                        'dependency_missing',
                        __('WooCommerce is required.', 'gameengine'),
                        array('status' => 424)
                    );
                }
            }
        }

        $active_addons = get_option('gameengine_active_addons', array());

        if ($status) {
            if (! in_array($addon_name, $active_addons, true)) {
                $active_addons[] = $addon_name;
            }
        } else {
            $active_addons = array_diff($active_addons, array($addon_name));
        }

        update_option('gameengine_active_addons', array_values($active_addons));

        // Reset Triggers and Regenerate JSON
        if (class_exists('\GameEngine\Classes\TriggerRegistry')) {
            \GameEngine\Classes\TriggerRegistry::reset();
        }

        if (class_exists('\GameEngine\Classes\JsonGenerator')) {
            \GameEngine\Classes\JsonGenerator::generate();
        }

        return new \WP_REST_Response(
            array(
                'message'       => 'Addon status updated.',
                'active_addons' => $this->get_addons_status_mapped(),
            ),
            200
        );
    }

    /**
     * Helper to map active addons to a Key-Value pair boolean object.
     */
    private function get_addons_status_mapped()
    {
        $active_addons = get_option('gameengine_active_addons', array());
        $is_pro_installed = class_exists('\GameEngine\Pro\Pro_Init');
        $all_addons    = array(
            'storeengine',
            'woocommerce',
            'academylms',
            'tutorlms',
            'restrict_unlock',
            'progress_map',
            'restrict_content',
            // New free addons.
            'points_expiration',
            'enhanced_email_notifications',
            'new_engagement_triggers',
            'social_sharing',
            'bulk_admin_tools',
            'data_import_export',
            'progress_bar',
            'buddypress_integration',
            'learndash_integration',
            'bbpress_integration',
            // Pro addons.
            'wallet',
            'referrals',
            'lucky-wheels',
            'point_transfers',
            'buy_points',
            'point_exchange',
            'points_cap',
            'sell_content',
            'analytics_charts',
            'toast_notifications',
            'open_badges',
        );

        $pro_only = array('wallet', 'referrals', 'lucky-wheels', 'point_transfers', 'buy_points', 'point_exchange', 'points_cap', 'sell_content', 'analytics_charts', 'toast_notifications', 'open_badges');

        $mapped = array();
        foreach ($all_addons as $slug) {
            if (! $is_pro_installed && in_array($slug, $pro_only, true)) {
                $mapped[$slug] = false;
                continue;
            }
            $mapped[$slug] = in_array($slug, $active_addons, true);
        }

        return $mapped;
    }
}
