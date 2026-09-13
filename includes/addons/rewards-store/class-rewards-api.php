<?php

namespace GameEngine\Addons\RewardsStore;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Rewards_API
 * Handles REST API requests for the Rewards Store addon: catalog CRUD
 * (admin only) and point-based redemption (any logged-in user).
 */
class Rewards_API extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'rewards';

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
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                    'args'                => $this->get_collection_params(),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'create_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'delete_item'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/redeem',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'redeem_item'),
                    'permission_callback' => array($this, 'logged_in_permission_check'),
                ),
            )
        );
    }

    /**
     * Permission check for redemption: any logged-in user may spend their own points.
     *
     * @param \WP_REST_Request $request
     * @return bool|\WP_Error
     */
    public function logged_in_permission_check(\WP_REST_Request $request)
    {
        if (! is_user_logged_in()) {
            return new \WP_Error(
                'rest_forbidden',
                esc_html__('You must be logged in to redeem a reward.', 'gameengine'),
                array('status' => 401)
            );
        }

        return true;
    }

    /**
     * Retrieve rewards with search and status filtering.
     */
    public function get_items($request)
    {
        global $wpdb;

        $per_page = min(100, max(1, $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20));
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
        $status   = $request->get_param('status') ? sanitize_text_field($request->get_param('status')) : 'all';
        $offset   = ($page - 1) * $per_page;

        $allowed_statuses = array('publish', 'draft', 'trash');
        if ($status === 'trash') {
            $status_where = "status = 'trash'";
        } elseif (in_array($status, $allowed_statuses, true)) {
            $status_where = $wpdb->prepare('status = %s', $status);
        } else {
            $status_where = "status != 'trash'";
        }

        $like_search = '%' . $wpdb->esc_like($search) . '%';
        $table_name  = "{$wpdb->prefix}gameengine_rewards";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $total_items = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM $table_name WHERE ( %s = '' OR title LIKE %s ) AND $status_where",
            $search,
            $like_search
        ));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE ( %s = '' OR title LIKE %s ) AND $status_where ORDER BY id DESC LIMIT %d OFFSET %d",
            $search,
            $like_search,
            $per_page,
            $offset
        ), ARRAY_A);

        foreach ($results as &$reward) {
            $reward['cost_points']    = (int) $reward['cost_points'];
            $reward['stock']          = (int) $reward['stock'];
            $reward['limit_per_user'] = (int) $reward['limit_per_user'];
        }

        $total_pages = (int) ceil($total_items / $per_page);
        $headers     = array(
            'X-WP-Total'      => $total_items,
            'X-WP-TotalPages' => $total_pages,
        );

        return new \WP_REST_Response($results, 200, $headers);
    }

    /**
     * Retrieve a single reward.
     */
    public function get_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $reward = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_rewards WHERE id = %d", $id), ARRAY_A);

        if (! $reward) {
            return new \WP_Error('not_found', __('Reward not found.', 'gameengine'), array('status' => 404));
        }

        return new \WP_REST_Response($reward, 200);
    }

    /**
     * Create a new reward.
     */
    public function create_item($request)
    {
        return $this->save_item($request);
    }

    /**
     * Update an existing reward.
     */
    public function update_item($request)
    {
        return $this->save_item($request, $request->get_param('id'));
    }

    /**
     * Core logic to save or update a reward.
     */
    private function save_item($request, $id = null)
    {
        global $wpdb;
        $params = $request->get_json_params();

        if (empty($params['title'])) {
            return new \WP_Error('missing_data', __('Reward title is required.', 'gameengine'), array('status' => 400));
        }

        $data = array(
            'title'          => sanitize_text_field($params['title']),
            'description'    => sanitize_textarea_field($params['description'] ?? ''),
            'image'          => isset($params['image']) ? esc_url_raw($params['image']) : null,
            'cost_points'    => isset($params['cost_points']) ? absint($params['cost_points']) : 0,
            'point_type_id'  => Rewards_Manager::resolve_point_type_id(isset($params['point_type_id']) ? absint($params['point_type_id']) : 0),
            'stock'          => isset($params['stock']) ? intval($params['stock']) : -1,
            'limit_per_user' => isset($params['limit_per_user']) ? absint($params['limit_per_user']) : 0,
            'status'         => ! empty($params['status']) ? sanitize_text_field($params['status']) : 'publish',
        );

        // The admin form sends no point type. On an update, keep whatever is
        // stored rather than overwriting it with the default.
        if ($id && ! isset($params['point_type_id'])) {
            unset($data['point_type_id']);
        }

        if ($id) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $updated = $wpdb->update("{$wpdb->prefix}gameengine_rewards", $data, array('id' => absint($id)));

            if (false === $updated) {
                return new \WP_Error('save_failed', __('Could not update reward.', 'gameengine'), array('status' => 500));
            }

            $reward_id = absint($id);
        } else {
            $data['slug']       = $this->unique_slug(sanitize_title($data['title']));
            $data['created_at'] = current_time('mysql');

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $inserted = $wpdb->insert("{$wpdb->prefix}gameengine_rewards", $data);

            if (false === $inserted) {
                return new \WP_Error('save_failed', __('Could not create reward.', 'gameengine'), array('status' => 500));
            }

            $reward_id = $wpdb->insert_id;
        }

        wp_cache_delete('gameengine_rewards_list', 'gameengine_rewards');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $reward = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}gameengine_rewards WHERE id = %d", $reward_id), ARRAY_A);

        return new \WP_REST_Response($reward, 200);
    }

    /**
     * Delete a reward.
     */
    public function delete_item($request)
    {
        global $wpdb;
        $id = absint($request->get_param('id'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete("{$wpdb->prefix}gameengine_rewards", array('id' => $id));

        wp_cache_delete('gameengine_rewards_list', 'gameengine_rewards');

        return new \WP_REST_Response(array('message' => __('Deleted', 'gameengine')), 200);
    }

    /**
     * Redeem a reward on behalf of the current user.
     */
    public function redeem_item($request)
    {
        $reward_id = absint($request->get_param('id'));
        $user_id   = get_current_user_id();

        $manager = new Rewards_Manager();
        $result  = $manager->redeem($user_id, $reward_id);

        if (! $result['success']) {
            $status_map = array(
                'not_found'           => 404,
                'insufficient_points' => 402,
            );

            return new \WP_Error(
                $result['code'],
                $result['message'],
                array('status' => $status_map[$result['code']] ?? 400)
            );
        }

        return new \WP_REST_Response($result, 200);
    }

    /**
     * Generate a unique slug for a new reward.
     */
    private function unique_slug(string $base): string
    {
        global $wpdb;
        $slug = $base;
        $i    = 1;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        while ($wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}gameengine_rewards WHERE slug = %s", $slug))) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    /**
     * Collection parameters for the rewards list.
     */
    public function get_collection_params()
    {
        return array(
            'page'     => array('default' => 1, 'sanitize_callback' => 'absint'),
            'per_page' => array('default' => 20, 'sanitize_callback' => 'absint'),
            'search'   => array('default' => '', 'sanitize_callback' => 'sanitize_text_field'),
            'status'   => array('default' => 'all', 'sanitize_callback' => 'sanitize_text_field'),
        );
    }
}
