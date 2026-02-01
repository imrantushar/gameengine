<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SetupController
 * Handles the Onboarding Wizard (Option A) and Smart Import Banners (Option B).
 */
class SetupController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'setup';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        // Route for the Full Wizard completion (Option A).
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

        // Route for Individual Module Import (Option B Banners).
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

        // Route to dismiss individual page banners.
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
     * OPTION A: Finalize the 3-step onboarding wizard.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
     */
    public function finish_wizard_setup($request)
    {
        $params = $request->get_json_params();

        // 1. Save Active Addons.
        if (! empty($params['addons'])) {
            update_option('gamify_active_addons', array_map('sanitize_key', $params['addons']));
        }

        // 2. Process Chosen Rewards (Points, Achievements, Levels).
        if (! empty($params['rewards'])) {
            $this->process_custom_onboarding_data($params['rewards']);
        }

        // 3. Mark setup as completed.
        update_option('gameengine_setup_completed', 'yes');

        // Clear necessary transients/caches.
        delete_transient('gameengine_point_types_list');
        delete_transient('gamify_achievements_list');
        delete_transient('gamify_levels_list');

        return new \WP_REST_Response(array('message' => 'Wizard setup completed successfully.'), 200);
    }

    /**
     * OPTION B: Handles single module imports from page-specific banners.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
     */
    public function import_single_module($request)
    {
        $params = $request->get_json_params();
        $module = isset($params['module']) ? sanitize_key($params['module']) : '';

        if (empty($module)) {
            return new \WP_Error('missing_module', 'Module slug is required.', array('status' => 400));
        }

        $dummy_payload = array();

        if ('points' === $module) {
            $dummy_payload['points'] = array(
                'enabled' => true,
                'name'    => 'XP',
                'trigger' => 'wp_login',
                'amount'  => 10,
            );
        } elseif ('achievements' === $module) {
            $dummy_payload['achievements'] = array(
                'enabled' => true,
                'title'   => 'Starter Badge',
                'message' => 'Welcome to our community!',
            );
        } elseif ('levels' === $module) {
            $dummy_payload['levels'] = array(
                'enabled' => true,
                'title'   => 'Beginner Level',
                'min'     => 0,
                'max'     => 100,
            );
        }

        $this->process_custom_onboarding_data($dummy_payload);

        return new \WP_REST_Response(array('message' => ucfirst($module) . ' default data imported successfully.'), 200);
    }

    /**
     * Permanently hide specific onboarding banners.
     *
     * @param \WP_REST_Request $request API request object.
     * @return \WP_REST_Response
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
     * Core Logic: Inserts Wizard data into respective tables and Taxonomies.
     *
     * @param array $rewards Payload containing points, achievements, and levels.
     */
    private function process_custom_onboarding_data($rewards)
    {
        global $wpdb;

        //  Process Point Type & Its Initial Requirement.
        if (! empty($rewards['points']['enabled'])) {
            $pt_name = sanitize_text_field($rewards['points']['name'] ?? 'XP');

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert(
                "{$wpdb->prefix}gameengine_point_types",
                array(
                    'name'        => $pt_name,
                    'plural_name' => $pt_name . 's',
                    'slug'        => sanitize_title($pt_name),
                    'status'      => 'publish',
                    'created_at'  => current_time('mysql'),
                ),
                array('%s', '%s', '%s', '%s', '%s')
            );

            $point_type_id = $wpdb->insert_id;
            $trigger_key   = sanitize_key($rewards['points']['trigger'] ?? 'wp_login');
            $amount        = absint($rewards['points']['amount'] ?? 10);

            // Insert the requirement logic for this point type.
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert(
                "{$wpdb->prefix}gameengine_requirements",
                array(
                    'reward_type' => 'point_type',
                    'reward_id'   => $point_type_id,
                    'trigger_key' => $trigger_key,
                    'action_type' => 'award',
                    'parameters'  => wp_json_encode(
                        array(
                            'points'    => $amount,
                            'limit'     => 'unlimited',
                            'log_label' => 'Starter Reward',
                        )
                    ),
                    'is_active'   => 1,
                    'created_at'  => current_time('mysql'),
                ),
                array('%s', '%d', '%s', '%s', '%s', '%d', '%s')
            );
        }

        //  Process Achievement & Connect to Taxonomy.
        if (! empty($rewards['achievements']['enabled'])) {
            // Ensure "General" category exists in Taxonomy.
            $term = term_exists('General', 'achievement_type');
            if (! $term) {
                $term = wp_insert_term('General', 'achievement_type');
            }
            $term_id = is_array($term) ? $term['term_id'] : $term;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert(
                "{$wpdb->prefix}gameengine_achievements",
                array(
                    'title'                   => sanitize_text_field($rewards['achievements']['title'] ?? 'Welcome Explorer'),
                    'plural_name'             => sanitize_text_field($rewards['achievements']['title'] ?? 'Welcome Explorer') . 's',
                    'category'                => absint($term_id),
                    'status'                  => 'publish',
                    'congratulations_message' => sanitize_textarea_field($rewards['achievements']['message'] ?? 'Congrats!'),
                    'created_at'              => current_time('mysql'),
                )
            );
        }

        //  Process Level & Connect to Taxonomy.
        if (! empty($rewards['levels']['enabled'])) {
            // Ensure "Main" category exists in Taxonomy.
            $term = term_exists('Main', 'level_type');
            if (! $term) {
                $term = wp_insert_term('Main', 'level_type');
            }
            $term_id = is_array($term) ? $term['term_id'] : $term;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->insert(
                "{$wpdb->prefix}gameengine_levels",
                array(
                    'title'       => sanitize_text_field($rewards['levels']['title'] ?? 'Level 1'),
                    'plural_name' => sanitize_text_field($rewards['levels']['title'] ?? 'Level 1') . 's',
                    'category'    => absint($term_id),
                    'min_points'  => absint($rewards['levels']['min'] ?? 0),
                    'max_points'  => absint($rewards['levels']['max'] ?? 100),
                    'status'      => 'publish',
                    'priority'    => 1,
                    'created_at'  => current_time('mysql'),
                )
            );
        }
    }
}
