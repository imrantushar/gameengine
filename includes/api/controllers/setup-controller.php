<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;
use GameEngine\Classes\PointsManager;

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
     * Points each starter rule awards.
     */
    const STARTER_POINTS = 10;

    /**
     * Point ranges of the four starter levels, lowest first.
     */
    const LEVEL_RANGES = array(array(0, 100), array(101, 500), array(501, 1000), array(1001, 5000));

    /**
     * Points at which the four starter achievements unlock, lowest first.
     */
    const ACHIEVEMENT_POINTS = array(10, 50, 150, 500);

    /**
     * REST route base.
     */
    protected $rest_base = 'setup';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        // What each preset creates, for the wizard's preview.
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/presets',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_presets_preview'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

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
     * The starter presets. The wizard's preview and the import both read this,
     * so what the preview promises is what gets created.
     *
     * `requires` names the add-on a preset's trigger needs; without it the rule
     * would never fire.
     *
     * @return array<string, array>
     */
    public static function get_presets()
    {
        return array(
            'author'      => array(
                'point'         => __('Author Points', 'gameengine'),
                'trigger'       => 'publish_post',
                'trigger_label' => __('publishes a post', 'gameengine'),
                'ach'           => array(__('First Draft', 'gameengine'), __('Published Author', 'gameengine'), __('Consistent Writer', 'gameengine'), __('Trusted Author', 'gameengine')),
                'lvl'           => array(__('New Author', 'gameengine'), __('Regular Author', 'gameengine'), __('Senior Author', 'gameengine'), __('Master Author', 'gameengine')),
            ),
            'blogger'     => array(
                'point'         => __('Reader Credits', 'gameengine'),
                'trigger'       => 'comment_post',
                'trigger_label' => __('leaves a comment', 'gameengine'),
                'ach'           => array(__('First Post', 'gameengine'), __('Active Blogger', 'gameengine'), __('Growing Blog', 'gameengine'), __('Blog Authority', 'gameengine')),
                'lvl'           => array(__('Beginner Blogger', 'gameengine'), __('Active Blogger', 'gameengine'), __('Pro Blogger', 'gameengine'), __('Top Blogger', 'gameengine')),
            ),
            'shop'        => array(
                'point'         => __('Shop Points', 'gameengine'),
                'trigger'       => 'woocommerce_new_purchase',
                'trigger_label' => __('completes a purchase', 'gameengine'),
                'requires'      => 'woocommerce',
                'ach'           => array(__('First Purchase', 'gameengine'), __('Repeat Buyer', 'gameengine'), __('Loyal Customer', 'gameengine'), __('VIP Shopper', 'gameengine')),
                'lvl'           => array(__('Shopper', 'gameengine'), __('Regular Buyer', 'gameengine'), __('Loyal Buyer', 'gameengine'), __('VIP Member', 'gameengine')),
            ),
            'performance' => array(
                'point'         => __('Performance Points', 'gameengine'),
                'trigger'       => 'publish_page',
                'trigger_label' => __('publishes a page', 'gameengine'),
                'ach'           => array(__('Onboarded', 'gameengine'), __('Task Completed', 'gameengine'), __('Consistent Performer', 'gameengine'), __('Top Performer', 'gameengine')),
                'lvl'           => array(__('Junior', 'gameengine'), __('Associate', 'gameengine'), __('Senior', 'gameengine'), __('Lead', 'gameengine')),
            ),
            'community'   => array(
                'point'         => __('Community Points', 'gameengine'),
                'trigger'       => 'user_register',
                'trigger_label' => __('creates an account', 'gameengine'),
                'ach'           => array(__('Welcome Member', 'gameengine'), __('First Contribution', 'gameengine'), __('Active Member', 'gameengine'), __('Trusted Voice', 'gameengine')),
                'lvl'           => array(__('Newcomer', 'gameengine'), __('Member', 'gameengine'), __('Contributor', 'gameengine'), __('Community Leader', 'gameengine')),
            ),
            'growth'      => array(
                'point'         => __('Growth Points', 'gameengine'),
                'trigger'       => 'publish_post',
                'trigger_label' => __('publishes a post', 'gameengine'),
                'ach'           => array(__('Campaign Launched', 'gameengine'), __('Lead Generator', 'gameengine'), __('Growth Booster', 'gameengine'), __('Growth Champion', 'gameengine')),
                'lvl'           => array(__('Marketer', 'gameengine'), __('Growth Specialist', 'gameengine'), __('Growth Manager', 'gameengine'), __('Growth Leader', 'gameengine')),
            ),
        );
    }

    /**
     * What each preset will create, for the wizard's preview.
     */
    public function get_presets_preview()
    {
        $preview = array();

        foreach (self::get_presets() as $slug => $preset) {
            $levels = array();
            foreach ($preset['lvl'] as $i => $title) {
                $levels[] = array(
                    'title' => $title,
                    'min'   => self::LEVEL_RANGES[$i][0],
                    'max'   => self::LEVEL_RANGES[$i][1],
                );
            }

            $achievements = array();
            foreach ($preset['ach'] as $i => $title) {
                $achievements[] = array(
                    'title'  => $title,
                    'points' => self::ACHIEVEMENT_POINTS[$i],
                );
            }

            $requires  = $preset['requires'] ?? '';
            $preview[] = array(
                'slug'          => $slug,
                'point'         => $preset['point'],
                'points'        => self::STARTER_POINTS,
                'trigger_label' => $preset['trigger_label'],
                'achievements'  => $achievements,
                'levels'        => $levels,
                'requires'      => $requires,
                'available'     => $this->requirement_met($requires),
            );
        }

        return rest_ensure_response($preview);
    }

    /**
     * OPTION A: Finalize the 3-step wizard with preset data.
     */
    public function finish_wizard_setup($request)
    {
        $params  = $request->get_json_params();
        $presets = self::get_presets();
        $preset  = isset($params['preset']) ? sanitize_key($params['preset']) : 'author';
        $preset  = isset($presets[$preset]) ? $preset : 'author';

        // The wizard only ever adds add-ons: running it again from Tools must
        // not switch off one the admin has turned on since, such as the Rewards
        // Store, which the wizard doesn't offer.
        $addons = isset($params['addons']) ? array_map('sanitize_key', (array) $params['addons']) : array();
        $addons = array_diff($addons, array('decide_later'));

        // A preset whose trigger belongs to an integration only fires while that
        // integration's add-on is on.
        $requires = $presets[$preset]['requires'] ?? '';
        if ($requires && $this->requirement_met($requires)) {
            $addons[] = $requires;
        }

        if (! empty($addons)) {
            $active = (array) get_option('gameengine_active_addons', array());
            update_option('gameengine_active_addons', array_values(array_unique(array_merge($active, $addons))));
        }

        //  Perform full preset import.
        $created = $this->process_preset_import($preset);

        update_option('gameengine_hide_banner_points', 'yes');
        update_option('gameengine_hide_banner_achievements', 'yes');
        update_option('gameengine_hide_banner_levels', 'yes');

        //  Mark setup as completed.
        update_option('gameengine_setup_completed', 'yes');

        return new \WP_REST_Response(
            array(
                'message' => __('Setup completed.', 'gameengine'),
                'preset'  => $preset,
                'created' => $created,
            ),
            200
        );
    }

    /**
     * OPTION B: Handles single module imports from page banners.
     */
    public function import_single_module($request)
    {
        $params   = $request->get_json_params();
        $module   = isset($params['module']) ? sanitize_key($params['module']) : '';
        $messages = array(
            'points'       => __('Starter point type imported.', 'gameengine'),
            'achievements' => __('Starter achievements imported.', 'gameengine'),
            'levels'       => __('Starter levels imported.', 'gameengine'),
        );

        if (! isset($messages[$module])) {
            return new \WP_Error('missing_module', __('Choose points, achievements or levels to import.', 'gameengine'), array('status' => 400));
        }

        // Banner imports use the Author preset, as the banners say.
        $created = $this->process_preset_import('author', $module);

        update_option('gameengine_hide_banner_' . $module, 'yes');

        return new \WP_REST_Response(
            array(
                'message' => $messages[$module],
                'created' => $created,
            ),
            200
        );
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
     *
     * Safe to run again. Rows that already exist are reused, and a rule is only
     * added when that reward isn't already tied to that trigger, so a second run
     * from Tools or a banner creates nothing twice.
     *
     * @param string      $preset_slug Preset to import.
     * @param string|null $only_module 'points', 'achievements' or 'levels' to import just that part.
     * @return array What was created or found, for the wizard to show.
     */
    private function process_preset_import($preset_slug, $only_module = null)
    {
        global $wpdb;

        $presets = self::get_presets();
        $data    = isset($presets[$preset_slug]) ? $presets[$preset_slug] : $presets['author'];
        $result  = array(
            'point_type'   => null,
            'rule'         => null,
            'achievements' => array(),
            'levels'       => array(),
        );

        /**
         * 1. PROCESS POINT TYPE
         */
        $point_type_id = 0;
        if (! $only_module || 'points' === $only_module) {
            $slug    = sanitize_title($data['point']);
            $created = false;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard; caching would serve stale rows while seeding.
            $existing_point = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s", $slug));

            if ($existing_point) {
                $point_type_id = (int) $existing_point->id;
            } else {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $inserted = $wpdb->insert(
                    "{$wpdb->prefix}gameengine_point_types",
                    array(
                        'name'        => $data['point'],
                        // Preset names are already plural ("Author Points").
                        'plural_name' => $data['point'],
                        'slug'        => $slug,
                        'status'      => 'publish',
                        'created_at'  => current_time('mysql'),
                    )
                );
                $point_type_id = $inserted ? (int) $wpdb->insert_id : 0;
                $created       = (bool) $inserted;
                wp_cache_delete('gameengine_published_point_types', 'gameengine');
            }

            if ($point_type_id) {
                $result['point_type'] = array(
                    'id'      => $point_type_id,
                    'name'    => $data['point'],
                    'created' => $created,
                );

                // Register Point Trigger Rule.
                $result['rule'] = array(
                    'points'        => self::STARTER_POINTS,
                    'trigger_label' => $data['trigger_label'],
                    'created'       => $this->ensure_rule(
                        'point_type',
                        $point_type_id,
                        $data['trigger'],
                        array(
                            'points'    => self::STARTER_POINTS,
                            'limit'     => 'unlimited',
                            'log_label' => __('Imported Starter Reward', 'gameengine'),
                        )
                    ),
                );
            }
        }

        /**
         *  PROCESS ACHIEVEMENTS
         */
        if (! $only_module || 'achievements' === $only_module) {
            $term = term_exists('General', \GameEngine\Classes\TaxonomyManager::ACHIEVEMENT_TAXONOMY) ?: wp_insert_term('General', \GameEngine\Classes\TaxonomyManager::ACHIEVEMENT_TAXONOMY);
            $tid  = is_array($term) ? $term['term_id'] : $term;

            // Starter achievements unlock at points milestones. As rules on the
            // preset's trigger, all four fired together on the first event.
            if (! $point_type_id) {
                $point_type_id = $this->preset_point_type_id($data);
            }

            foreach ($data['ach'] as $i => $ach_title) {
                $points  = self::ACHIEVEMENT_POINTS[$i];
                $created = false;

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard; caching would serve stale rows while seeding.
                $existing_ach = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_achievements WHERE title = %s", $ach_title));

                if (! $existing_ach) {
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $created = (bool) $wpdb->insert(
                        "{$wpdb->prefix}gameengine_achievements",
                        array(
                            'title'                      => $ach_title,
                            'plural_name'                => $ach_title . 's',
                            'category'                   => absint($tid),
                            'status'                     => 'publish',
                            /* translators: %s: achievement title */
                            'congratulations_message'    => sprintf(__('Congratulations! You have unlocked the %s badge!', 'gameengine'), $ach_title),
                            'unlock_with_points_enabled' => 1,
                            'required_point_type_id'     => absint($point_type_id),
                            'required_points_amount'     => $points,
                            'created_at'                 => current_time('mysql'),
                        )
                    );

                    if (! $created) {
                        continue;
                    }
                }

                $result['achievements'][] = array(
                    'title'   => $ach_title,
                    'points'  => $points,
                    'created' => $created,
                );
            }
        }

        /**
         *  PROCESS LEVELS
         */
        if (! $only_module || 'levels' === $only_module) {
            $term = term_exists('Main', \GameEngine\Classes\TaxonomyManager::LEVEL_TAXONOMY) ?: wp_insert_term('Main', \GameEngine\Classes\TaxonomyManager::LEVEL_TAXONOMY);
            $tid  = is_array($term) ? $term['term_id'] : $term;

            // Levels count the preset's own point type. Imported on their own,
            // they use that type if it exists, otherwise the first published one.
            if (! $point_type_id) {
                $point_type_id = $this->preset_point_type_id($data);
            }

            foreach ($data['lvl'] as $i => $lvl_title) {
                $range = self::LEVEL_RANGES[$i];

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard; caching would serve stale rows while seeding.
                $existing_lvl = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_levels WHERE title = %s", $lvl_title));

                if ($existing_lvl) {
                    $result['levels'][] = array(
                        'title'   => $lvl_title,
                        'min'     => $range[0],
                        'max'     => $range[1],
                        'created' => false,
                    );
                    continue;
                }

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $inserted = $wpdb->insert(
                    "{$wpdb->prefix}gameengine_levels",
                    array(
                        'title'                      => $lvl_title,
                        'plural_name'                => $lvl_title . 's',
                        'category'                   => absint($tid),
                        'min_points'                 => $range[0],
                        'max_points'                 => $range[1],
                        'status'                     => 'publish',
                        'priority'                   => $i + 1,
                        'unlock_with_points_enabled' => 1, // Default ON for demo
                        'point_type_id'              => absint($point_type_id), // Link to Point Type
                        'created_at'                 => current_time('mysql'),
                    )
                );

                if ($inserted) {
                    $result['levels'][] = array(
                        'title'   => $lvl_title,
                        'min'     => $range[0],
                        'max'     => $range[1],
                        'created' => true,
                    );
                }
            }
        }

        // Clear Transients to refresh UI.
        delete_transient('gameengine_point_types_list');
        delete_transient('gameengine_achievements_list');
        delete_transient('gameengine_levels_list');

        return $result;
    }

    /**
     * The point type a partial import attaches to: the preset's own if it
     * exists, otherwise the first published one.
     *
     * @param array $data Preset definition.
     * @return int
     */
    private function preset_point_type_id(array $data)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard.
        $point_type_id = (int) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s", sanitize_title($data['point'])));

        return $point_type_id ? $point_type_id : PointsManager::resolve_point_type_id(0);
    }

    /**
     * Add an award rule unless that reward is already tied to that trigger.
     *
     * Inactive rules count too, so a rule the admin switched off stays off.
     *
     * @param string $reward_type Reward type, e.g. 'point_type'.
     * @param int    $reward_id   Point type or achievement id.
     * @param string $trigger_key Trigger the rule listens to.
     * @param array  $parameters  Rule parameters.
     * @return bool True when a rule was added.
     */
    private function ensure_rule($reward_type, $reward_id, $trigger_key, array $parameters)
    {
        global $wpdb;

        if ($reward_id <= 0) {
            return false;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off lookup during the setup wizard.
        $exists = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}gameengine_requirements WHERE reward_type = %s AND reward_id = %d AND trigger_key = %s AND action_type = %s",
            $reward_type,
            $reward_id,
            $trigger_key,
            'award'
        ));

        if ($exists > 0) {
            return false;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        return false !== $wpdb->insert(
            "{$wpdb->prefix}gameengine_requirements",
            array(
                'reward_type' => $reward_type,
                'reward_id'   => $reward_id,
                'trigger_key' => $trigger_key,
                'action_type' => 'award',
                'parameters'  => wp_json_encode($parameters),
                'is_active'   => 1,
                'created_at'  => current_time('mysql'),
            )
        );
    }

    /**
     * Whether the plugin a preset needs is active.
     *
     * @param string $requires Add-on slug, or '' for none.
     * @return bool
     */
    private function requirement_met($requires)
    {
        if ('woocommerce' === $requires) {
            return (bool) \GameEngine\Helper::is_plugin_active('WooCommerce');
        }

        return true;
    }
}
