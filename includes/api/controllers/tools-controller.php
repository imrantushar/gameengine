<?php

namespace Gamify\API\Controllers;

use Gamify\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class ToolsController
 * Provides detailed documentation and examples for all Gamify shortcodes.
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
                'code'       => '[gamify_restrict]',
                'title'      => __('Content Restriction', 'gamify'),
                'desc'       => __('Lock specific parts of your content (text, images, links) based on user points, badges, or levels.', 'gamify'),
                'attributes' => array(
                    'type'    => __('Accepts: points, achievement, level', 'gamify'),
                    'value'   => __('Number (e.g. 100 for points, or ID for badge/level)', 'gamify'),
                    'message' => __('Optional: Custom message shown to locked users', 'gamify'),
                ),
                'examples'   => array(
                    array(
                        'label' => __('Restrict by Points', 'gamify'),
                        'snippet' => '[gamify_restrict type="points" value="50"] ' . __('Your hidden content here...', 'gamify') . ' [/gamify_restrict]',
                    ),
                    array(
                        'label' => __('Restrict by Achievement', 'gamify'),
                        'snippet' => '[gamify_restrict type="achievement" value="12"] ' . __('Visible only to badge earners', 'gamify') . ' [/gamify_restrict]',
                    ),
                    array(
                        'label' => __('Restrict by Level', 'gamify'),
                        'snippet' => '[gamify_restrict type="level" value="2"] ' . __('Visible only to Level 2 and above', 'gamify') . ' [/gamify_restrict]',
                    ),
                ),
            ),

            // Profile Shortcode
            array(
                'code'  => '[gamify_profile]',
                'title' => __('User Dashboard', 'gamify'),
                'desc'  => __('Displays the full modern gamification dashboard (Tabs, Progress Map, Badges).', 'gamify'),
                'usage' => __('Paste on a page where you want users to manage their progress.', 'gamify'),
            ),

            // Progress Map Shortcode
            array(
                'code'  => '[gamify_progress_map]',
                'title' => __('Journey Roadmap Only', 'gamify'),
                'desc'  => __('Shows only the visual zig-zag roadmap of levels and achievements.', 'gamify'),
                'usage' => __('Use this if you want to show the map without the full dashboard.', 'gamify'),
            ),

            //  Points Display
            array(
                'code'  => '[gamify_points]',
                'title' => __('Points Balance', 'gamify'),
                'desc'  => __('Displays the current users point total with a coin icon.', 'gamify'),
                'usage' => __('Ideal for menus, headers, or sidebar widgets.', 'gamify'),
            ),

            // Level Display
            array(
                'code'  => '[gamify_level]',
                'title' => __('Highest Level', 'gamify'),
                'desc'  => __('Shows the users current highest level title with a trophy icon.', 'gamify'),
                'usage' => __('Great for user profile headers or bio sections.', 'gamify'),
            ),
        );

        return new \WP_REST_Response($shortcodes, 200);
    }
}
