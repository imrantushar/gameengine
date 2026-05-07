<?php

namespace GameEngine\Addons\BulkAdminTools;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Bulk Admin Tools Addon.
 * Provides mass award/revoke of points, badges, and levels via role filter or CSV upload.
 */
class Init
{
    const ADDON_SLUG = 'bulk_admin_tools';

    public static function init()
    {
        $active_addons = get_option('gameengine_active_addons', []);

        if (! in_array(self::ADDON_SLUG, $active_addons, true)) {
            return;
        }

        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);
    }

    public static function register_rest_routes()
    {
        $namespace = 'gameengine/v1';

        register_rest_route($namespace, '/bulk/preview', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'preview'],
            'permission_callback' => function () { return current_user_can('manage_options'); },
        ]);

        register_rest_route($namespace, '/bulk/execute', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'execute'],
            'permission_callback' => function () { return current_user_can('manage_options'); },
        ]);

        register_rest_route($namespace, '/points/bulk', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'bulk_points'],
            'permission_callback' => function () { return current_user_can('manage_options'); },
        ]);
    }

    public static function bulk_points(\WP_REST_Request $request): \WP_REST_Response
    {
        $params    = $request->get_json_params() ?: [];
        $action    = sanitize_key($params['action'] ?? 'award');
        $pt_id     = absint($params['point_type_id'] ?? 1);
        $amount    = absint($params['amount'] ?? 0);
        $user_ids  = array_map('absint', (array) ($params['user_ids'] ?? []));

        if (empty($user_ids)) {
            return new \WP_REST_Response(['message' => __('No users specified.', 'gameengine')], 400);
        }

        $pm        = new \GameEngine\Classes\PointsManager();
        $processed = 0;
        $errors    = [];

        foreach ($user_ids as $uid) {
            try {
                switch ($action) {
                    case 'award':
                        $pm->add($uid, $amount, 'bulk_admin', ['point_type_id' => $pt_id]);
                        break;
                    case 'deduct':
                        $pm->deduct($uid, $amount, 'bulk_admin', ['point_type_id' => $pt_id]);
                        break;
                    case 'reset':
                        $current = $pm->get_total($uid, $pt_id);
                        if ($current > 0) {
                            $pm->deduct($uid, $current, 'bulk_admin_reset', ['point_type_id' => $pt_id]);
                        }
                        break;
                }
                $processed++;
            } catch (\Exception $e) {
                $errors[] = "User {$uid}: " . $e->getMessage();
            }
        }

        return new \WP_REST_Response([
            'message'   => sprintf(__('Operation applied to %d user(s).', 'gameengine'), $processed),
            'processed' => $processed,
            'errors'    => $errors,
        ], 200);
    }

    // ─── Preview (dry-run) ────────────────────────────────────────────────────

    public static function preview(\WP_REST_Request $request): \WP_REST_Response
    {
        $params     = $request->get_json_params();
        $user_ids   = self::resolve_user_ids($params);

        return new \WP_REST_Response([
            'user_count' => count($user_ids),
            'user_ids'   => array_slice($user_ids, 0, 10), // preview first 10
        ]);
    }

    // ─── Execute ──────────────────────────────────────────────────────────────

    public static function execute(\WP_REST_Request $request): \WP_REST_Response
    {
        $params    = $request->get_json_params();
        $user_ids  = self::resolve_user_ids($params);
        $action    = sanitize_key($params['action'] ?? '');  // award_points | deduct_points | award_badge | revoke_badge | award_level | revoke_level
        $reward_id = absint($params['reward_id'] ?? 0);
        $amount    = absint($params['amount'] ?? 0);
        $pt_id     = absint($params['point_type_id'] ?? 1);
        $errors    = [];
        $processed = 0;

        $pm = new \GameEngine\Classes\PointsManager();
        $am = new \GameEngine\Classes\AchievementsManager();
        $lm = new \GameEngine\Classes\LevelsManager();

        foreach ($user_ids as $uid) {
            try {
                switch ($action) {
                    case 'award_points':
                        $pm->add($uid, $amount, 'bulk_admin', ['point_type_id' => $pt_id, 'description' => 'Bulk admin award']);
                        break;
                    case 'deduct_points':
                        $pm->deduct($uid, $amount, 'bulk_admin', ['point_type_id' => $pt_id, 'description' => 'Bulk admin deduction']);
                        break;
                    case 'award_badge':
                        if (! $am->has_achievement($uid, $reward_id)) {
                            $am->award($uid, $reward_id);
                        }
                        break;
                    case 'revoke_badge':
                        $am->revoke($uid, $reward_id);
                        break;
                    case 'award_level':
                        if (! $lm->has_level($uid, $reward_id)) {
                            $lm->award($uid, $reward_id);
                        }
                        break;
                    case 'revoke_level':
                        $lm->revoke($uid, $reward_id);
                        break;
                }
                $processed++;
            } catch (\Exception $e) {
                $errors[] = "User {$uid}: " . $e->getMessage();
            }
        }

        // Log bulk operation.
        self::log_bulk_operation(get_current_user_id(), $action, $processed, $params);

        return new \WP_REST_Response([
            'processed' => $processed,
            'errors'    => $errors,
        ]);
    }

    // ─── User ID resolution ───────────────────────────────────────────────────

    private static function resolve_user_ids(array $params): array
    {
        $source = sanitize_key($params['source'] ?? 'role');

        if ('role' === $source) {
            $roles    = array_map('sanitize_key', (array) ($params['roles'] ?? []));
            if (empty($roles)) {
                return [];
            }
            $users = get_users(['role__in' => $roles, 'fields' => 'ID', 'number' => -1]);
            return array_map('intval', $users);
        }

        if ('csv' === $source) {
            $rows = (array) ($params['csv_rows'] ?? []);
            $ids  = [];
            foreach ($rows as $row) {
                if (! empty($row['user_id'])) {
                    $ids[] = absint($row['user_id']);
                } elseif (! empty($row['user_email'])) {
                    $user = get_user_by('email', sanitize_email($row['user_email']));
                    if ($user) {
                        $ids[] = $user->ID;
                    }
                }
            }
            return array_unique($ids);
        }

        return [];
    }

    // ─── Operation log ────────────────────────────────────────────────────────

    private static function log_bulk_operation(int $admin_id, string $action, int $count, array $params)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->insert(
            $wpdb->prefix . 'gameengine_logs',
            [
                'user_id'        => $admin_id,
                'trigger_key'    => 'bulk_admin_' . $action,
                'status'         => 'success',
                'points_awarded' => 0,
                'message'        => sprintf('Bulk %s: %d users affected', $action, $count),
                'meta'           => wp_json_encode(['source' => $params['source'] ?? '', 'count' => $count]),
                'created_at'     => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%d', '%s', '%s', '%s']
        );
    }
}

Init::init();
