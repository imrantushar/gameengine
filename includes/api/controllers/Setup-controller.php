<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SetupController
 * Handles the Onboarding Wizard and Smart Import Banners.
 */
class SetupController extends BaseController
{

    protected $rest_base = 'setup';

    public function register_routes()
    {
        // Route for the Full Wizard completion
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

        // Route for Individual Module Import (The Banners in Option B)
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

        // Route to dismiss banners
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
     * OPTION A: Finalize the 3-step wizard.
     */
    public function finish_wizard_setup($request)
    {
        $params = $request->get_json_params();

        //  Save Addons
        if (! empty($params['addons'])) {
            update_option('gamify_active_addons', array_map('sanitize_key', $params['addons']));
        }

        //  Process Chosen Rewards (Points/Achievements/Levels)
        $this->process_custom_onboarding_data($params['rewards']);

        //  Mark setup as completed
        update_option('gameengine_setup_completed', 'yes');

        return new \WP_REST_Response(array('message' => 'Wizard setup completed successfully.'), 200);
    }

    /**
     * OPTION B: Handles single module imports from page banners.
     */
    public function import_single_module($request)
    {
        $params = $request->get_json_params();
        $module = sanitize_key($params['module']); // 'points', 'achievements', or 'levels'

        $dummy_data = array(
            'enabled' => true,
            'name'    => ('points' === $module) ? 'XP' : '',
            'title'   => ('achievements' === $module) ? 'Starter Badge' : (('levels' === $module) ? 'Level 1' : ''),
        );

        $this->process_custom_onboarding_data(array($module => $dummy_data));

        return new \WP_REST_Response(array('message' => ucfirst($module) . ' default data imported.'), 200);
    }

    /**
     * Dismiss specific banners for Option B.
     */
    public function dismiss_banner($request)
    {
        $params = $request->get_json_params();
        $module = sanitize_key($params['module']);
        update_option('gameengine_hide_banner_' . $module, 'yes');

        return new \WP_REST_Response(array('success' => true), 200);
    }

    /**
     * Core Logic: Inserts data and links to Taxonomies.
     */
    private function process_custom_onboarding_data($rewards)
    {
        global $wpdb;

        //  Handle Point Type
        if (! empty($rewards['points']['enabled'])) {
            $wpdb->insert("{$wpdb->prefix}gameengine_point_types", array(
                'name'        => sanitize_text_field($rewards['points']['name'] ?? 'XP'),
                'plural_name' => sanitize_text_field($rewards['points']['name'] ?? 'XP') . 's',
                'slug'        => sanitize_title($rewards['points']['name'] ?? 'xp'),
                'status'      => 'publish'
            ));
        }

        // Handle Achievement & Taxonomy
        if (! empty($rewards['achievements']['enabled'])) {
            // Ensure "General" term exists
            $term = term_exists('General', 'achievement_type');
            if (! $term) {
                $term = wp_insert_term('General', 'achievement_type');
            }
            $term_id = is_array($term) ? $term['term_id'] : $term;

            $wpdb->insert("{$wpdb->prefix}gameengine_achievements", array(
                'title'       => sanitize_text_field($rewards['achievements']['title'] ?? 'Welcome Badge'),
                'plural_name' => sanitize_text_field($rewards['achievements']['title'] ?? 'Welcome Badge') . 's',
                'category'    => $term_id, // Link to Taxonomy ID
                'status'      => 'publish',
                'created_at'  => current_time('mysql')
            ));
        }

        //  Handle Level & Taxonomy
        if (! empty($rewards['levels']['enabled'])) {
            $term = term_exists('Main', 'level_type');
            if (! $term) {
                $term = wp_insert_term('Main', 'level_type');
            }
            $term_id = is_array($term) ? $term['term_id'] : $term;

            $wpdb->insert("{$wpdb->prefix}gameengine_levels", array(
                'title'      => sanitize_text_field($rewards['levels']['title'] ?? 'Level 1'),
                'category'   => $term_id, // Link to Taxonomy ID
                'min_points' => 0,
                'max_points' => 100,
                'status'     => 'publish',
                'created_at' => current_time('mysql')
            ));
        }
    }
}
