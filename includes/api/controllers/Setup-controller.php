<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class SetupController
 * Handles Template-based Onboarding (Option A) and Smart Banners (Option B).
 */
class SetupController extends BaseController
{

    protected $rest_base = 'setup';

    public function register_routes()
    {
        // Option A: Complete the 3-step Wizard
        register_rest_route($this->namespace, '/' . $this->rest_base . '/complete', array(
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'finish_wizard_setup'),
                'permission_callback' => array($this, 'admin_permission_check'),
            ),
        ));

        // Option B: Individual Module Import (From Banners)
        register_rest_route($this->namespace, '/' . $this->rest_base . '/import-module', array(
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'import_single_module'),
                'permission_callback' => array($this, 'admin_permission_check'),
            ),
        ));

        // Option B: Dismiss Banners
        register_rest_route($this->namespace, '/' . $this->rest_base . '/dismiss-banner', array(
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'dismiss_banner'),
                'permission_callback' => array($this, 'admin_permission_check'),
            ),
        ));
    }

    /**
     * OPTION A: Finalize the Wizard using Presets.
     */
    public function finish_wizard_setup($request)
    {
        $params = $request->get_json_params();
        $preset = sanitize_key($params['preset'] ?? 'author');

        //  Activate Selected Addons
        if (! empty($params['addons'])) {
            update_option('gamify_active_addons', array_map('sanitize_key', $params['addons']));
        }

        // Import Data based on Preset (Points + 4 Badges + 4 Levels)
        $this->process_preset_import($preset);

        //  Mark Setup as Completed
        update_option('gameengine_setup_completed', 'yes');

        return new \WP_REST_Response(array('message' => 'Wizard setup completed successfully!'), 200);
    }

    /**
     * OPTION B: Individual imports from page banners.
     */
    public function import_single_module($request)
    {
        $params = $request->get_json_params();
        $module = sanitize_key($params['module']);
        $this->process_preset_import('author', $module); // Default to author preset for individual imports
        return new \WP_REST_Response(array('message' => ucfirst($module) . ' data imported.'), 200);
    }

    /**
     * OPTION B: Dismiss specific banners.
     */
    public function dismiss_banner($request)
    {
        $params = $request->get_json_params();
        update_option('gameengine_hide_banner_' . sanitize_key($params['module']), 'yes');
        return new \WP_REST_Response(array('success' => true), 200);
    }

    /**
     * Core Data Import Logic using the Preset Sheet.
     */
    private function process_preset_import($preset_slug, $only_module = null)
    {
        global $wpdb;

        $presets = array(
            'author' => array(
                'point' => 'Author Points',
                'trigger' => 'publish_post',
                'ach'   => array('First Draft', 'Published Author', 'Consistent Writer', 'Trusted Author'),
                'lvl'   => array('New Author', 'Regular Author', 'Senior Author', 'Master Author'),
            ),
            'blogger' => array(
                'point' => 'Reader Credits',
                'trigger' => 'comment_post',
                'ach'   => array('First Post', 'Active Blogger', 'Growing Blog', 'Blog Authority'),
                'lvl'   => array('Beginner Blogger', 'Active Blogger', 'Pro Blogger', 'Top Blogger'),
            ),
            'shop' => array(
                'point' => 'Shop Points',
                'trigger' => 'woocommerce_new_purchase',
                'ach'   => array('First Purchase', 'Repeat Buyer', 'Loyal Customer', 'VIP Shopper'),
                'lvl'   => array('Shopper', 'Regular Buyer', 'Loyal Buyer', 'VIP Member'),
            ),
            'performance' => array(
                'point' => 'Performance Points',
                'trigger' => 'publish_page',
                'ach'   => array('Onboarded', 'Task Completed', 'Consistent Performer', 'Top Performer'),
                'lvl'   => array('Junior', 'Associate', 'Senior', 'Lead'),
            ),
            'community' => array(
                'point' => 'Community Points',
                'trigger' => 'user_register',
                'ach'   => array('Welcome Member', 'First Contribution', 'Active Member', 'Trusted Voice'),
                'lvl'   => array('Newcomer', 'Member', 'Contributor', 'Community Leader'),
            ),
            'growth' => array(
                'point' => 'Growth Points',
                'trigger' => 'publish_post',
                'ach'   => array('Campaign Launched', 'Lead Generator', 'Growth Booster', 'Growth Champion'),
                'lvl'   => array('Marketer', 'Growth Specialist', 'Growth Manager', 'Growth Leader'),
            ),
        );

        $data = $presets[$preset_slug] ?? $presets['author'];

        // ---  Point Type ---
        if (! $only_module || 'points' === $only_module) {
            $wpdb->insert("{$wpdb->prefix}gameengine_point_types", array(
                'name' => $data['point'],
                'plural_name' => $data['point'] . 's',
                'slug' => sanitize_title($data['point']),
                'status' => 'publish'
            ));
            $pid = $wpdb->insert_id;
            $wpdb->insert("{$wpdb->prefix}gameengine_requirements", array(
                'reward_type' => 'point_type',
                'reward_id' => $pid,
                'trigger_key' => $data['trigger'],
                'parameters' => wp_json_encode(array('points' => 10, 'limit' => 'unlimited')),
                'is_active' => 1
            ));
        }

        // ---  Achievements & Taxonomy ---
        if (! $only_module || 'achievements' === $only_module) {
            $term = term_exists('General', 'achievement_type') ?: wp_insert_term('General', 'achievement_type');
            $tid = is_array($term) ? $term['term_id'] : $term;
            foreach ($data['ach'] as $title) {
                $wpdb->insert("{$wpdb->prefix}gameengine_achievements", array(
                    'title' => $title,
                    'category' => $tid,
                    'status' => 'publish',
                    'congratulations_message' => 'Congratulations on earning ' . $title
                ));
            }
        }

        // ---  Levels & Taxonomy ---
        if (! $only_module || 'levels' === $only_module) {
            $term = term_exists('Main', 'level_type') ?: wp_insert_term('Main', 'level_type');
            $tid = is_array($term) ? $term['term_id'] : $term;
            $ranges = array(array(0, 100), array(101, 500), array(501, 1000), array(1001, 5000));
            foreach ($data['lvl'] as $i => $title) {
                $wpdb->insert("{$wpdb->prefix}gameengine_levels", array(
                    'title' => $title,
                    'category' => $tid,
                    'min_points' => $ranges[$i][0],
                    'max_points' => $ranges[$i][1],
                    'status' => 'publish',
                    'priority' => $i + 1
                ));
            }
        }
    }
}
