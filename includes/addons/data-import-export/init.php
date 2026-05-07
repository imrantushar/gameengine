<?php

namespace GameEngine\Addons\DataImportExport;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Data Import/Export Addon.
 * CSV/JSON import and export for user balances, achievements, levels, and plugin config.
 */
class Init
{
    const ADDON_SLUG = 'data_import_export';

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
        $ns   = 'gameengine/v1';
        $perm = function () { return current_user_can('manage_options'); };

        // Exports.
        register_rest_route($ns, '/export/balances', ['methods' => \WP_REST_Server::READABLE, 'callback' => [__CLASS__, 'export_balances'], 'permission_callback' => $perm]);
        register_rest_route($ns, '/export/achievements', ['methods' => \WP_REST_Server::READABLE, 'callback' => [__CLASS__, 'export_achievements'], 'permission_callback' => $perm]);
        register_rest_route($ns, '/export/levels', ['methods' => \WP_REST_Server::READABLE, 'callback' => [__CLASS__, 'export_levels'], 'permission_callback' => $perm]);
        register_rest_route($ns, '/export/config', ['methods' => \WP_REST_Server::READABLE, 'callback' => [__CLASS__, 'export_config'], 'permission_callback' => $perm]);

        // Imports.
        register_rest_route($ns, '/import/balances', ['methods' => \WP_REST_Server::CREATABLE, 'callback' => [__CLASS__, 'import_balances'], 'permission_callback' => $perm]);
        register_rest_route($ns, '/import/config', ['methods' => \WP_REST_Server::CREATABLE, 'callback' => [__CLASS__, 'import_config'], 'permission_callback' => $perm]);

        // Generic export endpoint: ?type=points_log|achievements|ranks
        register_rest_route($ns, '/export', ['methods' => \WP_REST_Server::READABLE, 'callback' => [__CLASS__, 'export_generic'], 'permission_callback' => $perm]);

        // Generic file-upload import endpoint
        register_rest_route($ns, '/import', ['methods' => \WP_REST_Server::CREATABLE, 'callback' => [__CLASS__, 'import_generic'], 'permission_callback' => $perm]);
    }

    public static function export_generic(\WP_REST_Request $request): void
    {
        $type = sanitize_key($request->get_param('type') ?? 'points_log');
        switch ($type) {
            case 'achievements':
                self::export_achievements($request);
                break;
            case 'ranks':
                self::export_levels($request);
                break;
            case 'points_log':
            default:
                self::export_balances($request);
                break;
        }
    }

    public static function import_generic(\WP_REST_Request $request): \WP_REST_Response
    {
        $files = $request->get_file_params();
        if (empty($files['file'])) {
            return new \WP_REST_Response(['message' => __('No file uploaded.', 'gameengine')], 400);
        }

        $type     = sanitize_key($request->get_param('type') ?? 'points_log');
        $tmp_path = $files['file']['tmp_name'];

        if (! is_uploaded_file($tmp_path)) {
            return new \WP_REST_Response(['message' => __('Invalid file upload.', 'gameengine')], 400);
        }

        $handle = fopen($tmp_path, 'r'); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
        if (! $handle) {
            return new \WP_REST_Response(['message' => __('Could not read file.', 'gameengine')], 400);
        }

        $headers = fgetcsv($handle);
        $rows    = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($headers, $row);
        }
        fclose($handle); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose

        if (empty($rows)) {
            return new \WP_REST_Response(['message' => __('File is empty or has no data rows.', 'gameengine')], 400);
        }

        switch ($type) {
            case 'achievements':
                $result = self::import_achievements_rows($rows);
                break;
            case 'ranks':
                $result = self::import_levels_rows($rows);
                break;
            case 'points_log':
            default:
                $synthetic_request = new \WP_REST_Request();
                $synthetic_request->set_body(wp_json_encode(['rows' => $rows, 'mode' => 'adjust']));
                $synthetic_request->set_header('Content-Type', 'application/json');
                $response = self::import_balances($synthetic_request);
                return $response;
        }

        return new \WP_REST_Response($result, 200);
    }

    private static function import_achievements_rows(array $rows): array
    {
        $am      = new \GameEngine\Classes\AchievementsManager();
        $success = 0;
        $errors  = [];
        foreach ($rows as $i => $row) {
            $user_id        = absint($row['user_id'] ?? 0);
            $achievement_id = absint($row['achievement_id'] ?? 0);
            if (! $user_id || ! $achievement_id) {
                $errors[] = "Row {$i}: missing user_id or achievement_id";
                continue;
            }
            if (! $am->has_achievement($user_id, $achievement_id)) {
                $am->award($user_id, $achievement_id);
            }
            $success++;
        }
        return ['message' => sprintf(__('Imported %d achievement record(s).', 'gameengine'), $success), 'imported' => $success, 'errors' => $errors];
    }

    private static function import_levels_rows(array $rows): array
    {
        $lm      = new \GameEngine\Classes\LevelsManager();
        $success = 0;
        $errors  = [];
        foreach ($rows as $i => $row) {
            $user_id  = absint($row['user_id'] ?? 0);
            $level_id = absint($row['level_id'] ?? 0);
            if (! $user_id || ! $level_id) {
                $errors[] = "Row {$i}: missing user_id or level_id";
                continue;
            }
            if (! $lm->has_level($user_id, $level_id)) {
                $lm->award($user_id, $level_id);
            }
            $success++;
        }
        return ['message' => sprintf(__('Imported %d rank record(s).', 'gameengine'), $success), 'imported' => $success, 'errors' => $errors];
    }

    // ─── EXPORTS ──────────────────────────────────────────────────────────────

    public static function export_balances(\WP_REST_Request $request): void
    {
        global $wpdb;
        $fmt = sanitize_key($request->get_param('format') ?? 'csv');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results(
            "SELECT u.ID AS user_id, u.user_email, u.display_name, pt.slug AS point_type_slug, SUM(l.points) AS balance
             FROM {$wpdb->prefix}gameengine_points_log l
             JOIN {$wpdb->users} u ON u.ID = l.user_id
             JOIN {$wpdb->prefix}gameengine_point_types pt ON pt.id = l.point_type_id
             GROUP BY u.ID, l.point_type_id",
            ARRAY_A
        );

        if ('json' === $fmt) {
            self::output_json($rows, 'ge-balances.json');
        } else {
            self::output_csv(['user_id', 'user_email', 'display_name', 'point_type_slug', 'balance'], $rows, 'ge-balances.csv');
        }
    }

    public static function export_achievements(\WP_REST_Request $request): void
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results(
            "SELECT ua.user_id, u.user_email, a.title AS achievement_title, a.id AS achievement_id, ua.achieved_at
             FROM {$wpdb->prefix}gameengine_user_achievements ua
             JOIN {$wpdb->users} u ON u.ID = ua.user_id
             JOIN {$wpdb->prefix}gameengine_achievements a ON a.id = ua.achievement_id",
            ARRAY_A
        );

        self::output_csv(['user_id', 'user_email', 'achievement_id', 'achievement_title', 'achieved_at'], $rows, 'ge-user-achievements.csv');
    }

    public static function export_levels(\WP_REST_Request $request): void
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results(
            "SELECT ul.user_id, u.user_email, lv.title AS level_title, lv.id AS level_id, ul.achieved_at
             FROM {$wpdb->prefix}gameengine_user_levels ul
             JOIN {$wpdb->users} u ON u.ID = ul.user_id
             JOIN {$wpdb->prefix}gameengine_levels lv ON lv.id = ul.level_id",
            ARRAY_A
        );

        self::output_csv(['user_id', 'user_email', 'level_id', 'level_title', 'achieved_at'], $rows, 'ge-user-levels.csv');
    }

    public static function export_config(\WP_REST_Request $request): void
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $config = [
            'point_types'  => $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gameengine_point_types", ARRAY_A),
            'achievements' => $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gameengine_achievements", ARRAY_A),
            'levels'       => $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gameengine_levels", ARRAY_A),
            'requirements' => $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gameengine_requirements", ARRAY_A),
        ];

        self::output_json($config, 'ge-config.json');
    }

    // ─── IMPORTS ──────────────────────────────────────────────────────────────

    public static function import_balances(\WP_REST_Request $request): \WP_REST_Response
    {
        $params  = $request->get_json_params();
        $mode    = sanitize_key($params['mode'] ?? 'adjust'); // overwrite | adjust
        $rows    = (array) ($params['rows'] ?? []);
        $pm      = new \GameEngine\Classes\PointsManager();
        $errors  = [];
        $success = 0;

        foreach ($rows as $i => $row) {
            $user_id       = absint($row['user_id'] ?? 0);
            $pt_slug       = sanitize_key($row['point_type_slug'] ?? '');
            $amount        = (int) ($row['balance'] ?? 0);

            if (! $user_id || ! $pt_slug) {
                $errors[] = "Row {$i}: missing user_id or point_type_slug";
                continue;
            }

            $pt_id = self::get_point_type_id($pt_slug);
            if (! $pt_id) {
                $errors[] = "Row {$i}: unknown point_type_slug '{$pt_slug}'";
                continue;
            }

            if ('overwrite' === $mode) {
                $current = $pm->get_total($user_id, $pt_id);
                $delta   = $amount - $current;
                if ($delta > 0) {
                    $pm->add($user_id, $delta, 'import_overwrite', ['point_type_id' => $pt_id]);
                } elseif ($delta < 0) {
                    $pm->deduct($user_id, abs($delta), 'import_overwrite', ['point_type_id' => $pt_id]);
                }
            } else {
                if ($amount > 0) {
                    $pm->add($user_id, $amount, 'import_adjust', ['point_type_id' => $pt_id]);
                } elseif ($amount < 0) {
                    $pm->deduct($user_id, abs($amount), 'import_adjust', ['point_type_id' => $pt_id]);
                }
            }
            $success++;
        }

        return new \WP_REST_Response(['imported' => $success, 'errors' => $errors]);
    }

    public static function import_config(\WP_REST_Request $request): \WP_REST_Response
    {
        global $wpdb;
        $params  = $request->get_json_params();
        $mode    = sanitize_key($params['mode'] ?? 'merge'); // merge | replace
        $config  = $params['config'] ?? [];

        if ('replace' === $mode) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            foreach (['gameengine_requirements', 'gameengine_achievements', 'gameengine_levels', 'gameengine_point_types'] as $table) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->query("DELETE FROM {$wpdb->prefix}{$table}");
            }
        }

        $imported = ['point_types' => 0, 'achievements' => 0, 'levels' => 0, 'requirements' => 0];

        foreach (['point_types' => 'gameengine_point_types', 'achievements' => 'gameengine_achievements', 'levels' => 'gameengine_levels', 'requirements' => 'gameengine_requirements'] as $key => $table) {
            if (empty($config[$key]) || ! is_array($config[$key])) {
                continue;
            }
            foreach ($config[$key] as $row) {
                unset($row['id']); // Let DB assign new IDs.
                if ('merge' === $mode && isset($row['slug'])) {
                    $exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore
                        "SELECT id FROM {$wpdb->prefix}{$table} WHERE slug = %s",
                        $row['slug']
                    ));
                    if ($exists) {
                        continue;
                    }
                }
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->insert($wpdb->prefix . $table, $row);
                $imported[$key]++;
            }
        }

        return new \WP_REST_Response(['imported' => $imported]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static function get_point_type_id(string $slug): int
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $id = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}gameengine_point_types WHERE slug = %s",
            $slug
        ));
        return (int) $id;
    }

    private static function output_csv(array $headers, array $rows, string $filename): void
    {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');

        $out = fopen('php://output', 'w');
        fputcsv($out, $headers);
        foreach ($rows as $row) {
            fputcsv($out, array_values($row));
        }
        fclose($out); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
        exit;
    }

    private static function output_json(array $data, string $filename): void
    {
        header('Content-Type: application/json; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo wp_json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

Init::init();
