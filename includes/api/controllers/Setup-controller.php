<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SetupController
 * Handles the Template-based Onboarding Wizard and Smart Banners for individual module imports.
 */
class SetupController extends BaseController
{

    /**
     * REST route base.
     */
    protected $rest_base = 'setup';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        // Option A: Complete the Full Wizard.
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/complete',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'finish_wizard_setup'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        // Option B: Individual Module Import (Banners).
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/import-module',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'import_single_module'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        // Option B: Dismiss Banners.
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/dismiss-banner',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'dismiss_banner'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * OPTION A: Finalize the 3-step wizard with preset data.
     */
    public function finish_wizard_setup($request)
    {
        $params = $request->get_json_params();
        $preset = isset($params['preset']) ? sanitize_key($params['preset']) : 'author';

        //  Save Active Addons.
        if (! empty($params['addons'])) {
            update_option('gameengine_active_addons', array_map('sanitize_key', $params['addons']));
        }

        //  Perform full preset import.
        $this->process_preset_import($preset);

        update_option('gameengine_hide_banner_points', 'yes');
        update_option('gameengine_hide_banner_achievements', 'yes');
        update_option('gameengine_hide_banner_levels', 'yes');

        //  Mark setup as completed.
        update_option('gameengine_setup_completed', 'yes');

        return new \WP_REST_Response(array('message' => 'Setup completed successfully with ' . esc_html($preset) . ' preset.'), 200);
    }

    /**
     * OPTION B: Handles single module imports from page banners.
     */
    public function import_single_module($request)
    {
        $params = $request->get_json_params();
        $module = isset($params['module']) ? sanitize_key($params['module']) : '';

        if (empty($module)) {
            return new \WP_Error('missing_module', 'Module slug is required.', array('status' => 400));
        }

        // Default to 'author' preset for individual banner imports.
        $this->process_preset_import('author', $module);

        update_option('gameengine_hide_banner_' . $module, 'yes');

        return new \WP_REST_Response(array('message' => ucfirst($module) . ' default data imported.'), 200);
    }

    /**
     * OPTION B: Permanently hide specific page banners.
     */
    public function dismiss_banner($request)
    {
        $params = $request->get_json_params();
        $module = isset($params['module']) ? sanitize_key($params['module']) : '';

        if (! empty($module)) {
            update_option('gameengine_hide_banner_' . $module, 'yes');
        }

        return new \WP_REST_Response(array('success' => true), 200);
    }

    /**
     * Core Logic: Injects Data and establishes relationships between Points, Achievements, and Levels.
     */
    private function process_preset_import($preset_slug, $only_module = null)
    {
        global $wpdb;

        $presets = array(
            'author'      => array(
                'point'   => 'Author Points',
                'trigger' => 'publish_post',
                'ach'     => array('First Draft', 'Published Author', 'Consistent Writer', 'Trusted Author'),
                'lvl'     => array('New Author', 'Regular Author', 'Senior Author', 'Master Author'),
            ),
            'blogger'     => array(
                'point'   => 'Reader Credits',
                'trigger' => 'comment_post',
                'ach'     => array('First Post', 'Active Blogger', 'Growing Blog', 'Blog Authority'),
                'lvl'     => array('Beginner Blogger', 'Active Blogger', 'Pro Blogger', 'Top Blogger'),
            ),
            'shop'        => array(
                'point'   => 'Shop Points',
                'trigger' => 'woocommerce_new_purchase',
                'ach'     => array('First Purchase', 'Repeat Buyer', 'Loyal Customer', 'VIP Shopper'),
                'lvl'     => array('Shopper', 'Regular Buyer', 'Loyal Buyer', 'VIP Member'),
            ),
            'performance' => array(
                'point'   => 'Performance Points',
                'trigger' => 'publish_page',
                'ach'     => array('Onboarded', 'Task Completed', 'Consistent Performer', 'Top Performer'),
                'lvl'     => array('Junior', 'Associate', 'Senior', 'Lead'),
            ),
            'community'   => array(
                'point'   => 'Community Points',
                'trigger' => 'user_register',
                'ach'     => array('Welcome Member', 'First Contribution', 'Active Member', 'Trusted Voice'),
                'lvl'     => array('Newcomer', 'Member', 'Contributor', 'Community Leader'),
            ),
            'growth'      => array(
                'point'   => 'Growth Points',
                'trigger' => 'publish_post',
                'ach'     => array('Campaign Launched', 'Lead Generator', 'Growth Booster', 'Growth Champion'),
                'lvl'     => array('Marketer', 'Growth Specialist', 'Growth Manager', 'Growth Leader'),
            ),
        );

        $data = isset($presets[$preset_slug]) ? $presets[$preset_slug] : $presets['author'];

        /**
         * 1. PROCESS POINT TYPE
         */
        $point_type_id = 0;
        if (! $only_module || 'points' === $only_module) {
            $slug = sanitize_title($data['point']);
            
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard; caching would serve stale rows while seeding.
            $existing_point = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s", $slug));

            if ($existing_point) {
                $point_type_id = $existing_point->id;
            } else {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->insert(
                    "{$wpdb->prefix}gameengine_point_types",
                    array(
                        'name'        => $data['point'],
                        'plural_name' => $data['point'] . 's',
                        'slug'        => $slug,
                        'status'      => 'publish',
                        'created_at'  => current_time('mysql'),
                    )
                );
                $point_type_id = $wpdb->insert_id;
            }

            // Register Point Trigger Rule.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert(
                "{$wpdb->prefix}gameengine_requirements",
                array(
                    'reward_type' => 'point_type',
                    'reward_id'   => $point_type_id,
                    'trigger_key' => $data['trigger'],
                    'action_type' => 'award',
                    'parameters'  => wp_json_encode(array('points' => 10, 'limit' => 'unlimited', 'log_label' => 'Imported Starter Reward')),
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql'),
                )
            );
        }

        /**
         *  PROCESS ACHIEVEMENTS
         */
        if (! $only_module || 'achievements' === $only_module) {
            $term = term_exists('General', 'achievement_type') ?: wp_insert_term('General', 'achievement_type');
            $tid  = is_array($term) ? $term['term_id'] : $term;

            foreach ($data['ach'] as $ach_title) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard; caching would serve stale rows while seeding.
                $existing_ach = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_achievements WHERE title = %s", $ach_title));

                if ($existing_ach) {
                    $achievement_id = $existing_ach->id;
                } else {
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $wpdb->insert(
                        "{$wpdb->prefix}gameengine_achievements",
                        array(
                            'title'                   => $ach_title,
                            'plural_name'             => $ach_title . 's',
                            'category'                => absint($tid),
                            'status'                  => 'publish',
                            'congratulations_message' => 'Congratulations! You have unlocked the ' . $ach_title . ' badge!',
                            'created_at'              => current_time('mysql'),
                        )
                    );
                    $achievement_id = $wpdb->insert_id;
                }

                // Link Achievement to a Trigger.
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->insert(
                    "{$wpdb->prefix}gameengine_requirements",
                    array(
                        'reward_type' => 'achievement',
                        'reward_id'   => $achievement_id,
                        'trigger_key' => $data['trigger'],
                        'action_type' => 'award',
                        'parameters'  => wp_json_encode(array('log_label' => 'Unlocked ' . $ach_title)),
                        'is_active'   => 1,
                        'created_at'  => current_time('mysql'),
                    )
                );
            }
        }

        /**
         *  PROCESS LEVELS
         */
        if (! $only_module || 'levels' === $only_module) {
            $term = term_exists('Main', 'level_type') ?: wp_insert_term('Main', 'level_type');
            $tid  = is_array($term) ? $term['term_id'] : $term;

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
                $point_type_id = (int) $wpdb->get_var("SELECT id FROM {$wpdb->prefix}gameengine_point_types LIMIT 1");

            $ranges = array(array(0, 100), array(101, 500), array(501, 1000), array(1001, 5000));

            foreach ($data['lvl'] as $i => $lvl_title) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard; caching would serve stale rows while seeding.
                $existing_lvl = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_levels WHERE title = %s", $lvl_title));

                if ($existing_lvl) continue;

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $wpdb->insert(
                    "{$wpdb->prefix}gameengine_levels",
                    array(
                        'title'                      => $lvl_title,
                        'plural_name'                => $lvl_title . 's',
                        'category'                   => absint($tid),
                        'min_points'                 => $ranges[$i][0],
                        'max_points'                 => $ranges[$i][1],
                        'status'                     => 'publish',
                        'priority'                   => $i + 1,
                        'unlock_with_points_enabled' => 1, // Default ON for demo
                        'point_type_id'              => absint($point_type_id), // Link to Point Type
                        'created_at'                 => current_time('mysql'),
                    )
                );
            }
        }

        // Clear Transients to refresh UI.
        delete_transient('gameengine_point_types_list');
        delete_transient('gameengine_achievements_list');
        delete_transient('gameengine_levels_list');
    }
}
