<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class ReferralsController
 * REST API for the Referral & Affiliate System.
 * GET  /gameengine/v1/referrals          — List all referrals (paginated)
 * GET  /gameengine/v1/referrals/stats    — Summary stats for the dashboard
 * DELETE /gameengine/v1/referrals/{id}   — Delete a referral record
 */
class ReferralsController extends BaseController
{
    protected $rest_base = 'referrals';

    public function register_routes()
    {
        // List all referrals
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_referrals'],
                'permission_callback' => [$this, 'admin_permission_check'],
                'args'                => [
                    'page'     => ['default' => 1, 'sanitize_callback' => 'absint'],
                    'per_page' => ['default' => 20, 'sanitize_callback' => 'absint'],
                    'search'   => ['default' => '', 'sanitize_callback' => 'sanitize_text_field'],
                ],
            ],
        ]);

        // Summary stats
        register_rest_route($this->namespace, '/' . $this->rest_base . '/stats', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_stats'],
                'permission_callback' => [$this, 'admin_permission_check'],
            ],
        ]);

        // Delete single referral record
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>\d+)', [
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'delete_referral'],
                'permission_callback' => [$this, 'admin_permission_check'],
                'args'                => [
                    'id' => ['required' => true, 'sanitize_callback' => 'absint'],
                ],
            ],
        ]);
    }

    /**
     * Returns a paginated list of referral records.
     */
    public function get_referrals(\WP_REST_Request $request)
    {
        global $wpdb;
        $table  = $wpdb->prefix . 'gameengine_referrals';
        $page   = max(1, (int) $request->get_param('page'));
        $limit  = min(100, (int) $request->get_param('per_page'));
        $offset = ($page - 1) * $limit;
        $search = $request->get_param('search');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT r.*, 
                    ref_user.display_name  AS referrer_name, 
                    ref_user.user_email    AS referrer_email,
                    fee_user.display_name  AS referee_name, 
                    fee_user.user_email    AS referee_email
             FROM {$table} r
             LEFT JOIN {$wpdb->users} ref_user ON r.referrer_id = ref_user.ID
             LEFT JOIN {$wpdb->users} fee_user ON r.referee_id  = fee_user.ID
             ORDER BY r.created_at DESC
             LIMIT %d OFFSET %d",
            $limit,
            $offset
        ), ARRAY_A);

        return new \WP_REST_Response([
            'data'       => $rows,
            'total'      => $total,
            'page'       => $page,
            'total_pages' => (int) ceil($total / $limit),
        ], 200);
    }

    /**
     * Returns summary statistics for the Referrals admin page header.
     */
    public function get_stats()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gameengine_referrals';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $total       = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $converted   = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table} WHERE status = 'converted'");
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $top_referrer = $wpdb->get_row(
            "SELECT referrer_id, COUNT(*) as referral_count 
             FROM {$table} 
             WHERE status = 'converted'
             GROUP BY referrer_id 
             ORDER BY referral_count DESC 
             LIMIT 1"
        );

        $top_user_name = '';
        if ($top_referrer && $top_referrer->referrer_id) {
            $u = get_userdata((int) $top_referrer->referrer_id);
            $top_user_name = $u ? $u->display_name : '';
        }

        return new \WP_REST_Response([
            'total_referrals'     => $total,
            'converted'           => $converted,
            'top_referrer_name'   => $top_user_name,
            'top_referrer_count'  => $top_referrer ? (int) $top_referrer->referral_count : 0,
        ], 200);
    }

    /**
     * Deletes a single referral record by ID.
     */
    public function delete_referral(\WP_REST_Request $request)
    {
        global $wpdb;
        $id    = (int) $request->get_param('id');
        $table = $wpdb->prefix . 'gameengine_referrals';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $deleted = $wpdb->delete($table, ['id' => $id], ['%d']);

        if (!$deleted) {
            return new \WP_REST_Response(['message' => __('Referral not found.', 'gameengine')], 404);
        }

        return new \WP_REST_Response(['message' => __('Referral deleted.', 'gameengine'), 'id' => $id], 200);
    }
}
