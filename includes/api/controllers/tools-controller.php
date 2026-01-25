<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class ToolsController
 * Provides detailed documentation and examples for all GameEngine shortcodes.
 */
class ToolsController extends BaseController
{

    protected $rest_base = 'tools';

    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/shortcodes',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_shortcodes_list'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Returns a list of all shortcodes with parameters and usage examples.
     */
    public function get_shortcodes_list()
    {
        $shortcodes = array(
            // Restrict Content Shortcode (The most detailed one)
            array(
                'code'       => '[gameengine_restrict]',
                'title'      => __('Content Restriction', 'gameengine'),
                'desc'       => __('Lock specific parts of your content (text, images, links) based on user points, badges, or levels.', 'gameengine'),
                'attributes' => array(
                    'type'    => __('Accepts: points, achievement, level', 'gameengine'),
                    'value'   => __('Number (e.g. 100 for points, or ID for badge/level)', 'gameengine'),
                    'message' => __('Optional: Custom message shown to locked users', 'gameengine'),
                ),
                'examples'   => array(
                    array(
                        'label' => __('Restrict by Points', 'gameengine'),
                        'snippet' => '[gameengine_restrict type="points" value="50"] ' . __('Your hidden content here...', 'gameengine') . ' [/gameengine_restrict]',
                    ),
                    array(
                        'label' => __('Restrict by Achievement', 'gameengine'),
                        'snippet' => '[gameengine_restrict type="achievement" value="12"] ' . __('Visible only to badge earners', 'gameengine') . ' [/gameengine_restrict]',
                    ),
                    array(
                        'label' => __('Restrict by Level', 'gameengine'),
                        'snippet' => '[gameengine_restrict type="level" value="2"] ' . __('Visible only to Level 2 and above', 'gameengine') . ' [/gameengine_restrict]',
                    ),
                ),
            ),

            // Profile Shortcode
            array(
                'code'  => '[gameengine_profile]',
                'title' => __('User Dashboard', 'gameengine'),
                'desc'  => __('Displays the full modern gamification dashboard (Tabs, Progress Map, Badges).', 'gameengine'),
                'usage' => __('Paste on a page where you want users to manage their progress.', 'gameengine'),
            ),

            // Progress Map Shortcode
            array(
                'code'  => '[gameengine_progress_map]',
                'title' => __('Journey Roadmap Only', 'gameengine'),
                'desc'  => __('Shows only the visual zig-zag roadmap of levels and achievements.', 'gameengine'),
                'usage' => __('Use this if you want to show the map without the full dashboard.', 'gameengine'),
            ),

            //  Points Display
            array(
                'code'  => '[gameengine_points]',
                'title' => __('Points Balance', 'gameengine'),
                'desc'  => __('Displays the current users point total with a coin icon.', 'gameengine'),
                'usage' => __('Ideal for menus, headers, or sidebar widgets.', 'gameengine'),
            ),

            // Level Display
            array(
                'code'  => '[gameengine_level]',
                'title' => __('Highest Level', 'gameengine'),
                'desc'  => __('Shows the users current highest level title with a trophy icon.', 'gameengine'),
                'usage' => __('Great for user profile headers or bio sections.', 'gameengine'),
            ),
        );

        return new \WP_REST_Response($shortcodes, 200);
    }
}
