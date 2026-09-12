<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * The one place users are ranked by points.
 *
 * There used to be four: the REST controller, the shortcode, and two copies of
 * the season snapshot. They had already drifted — the REST board netted
 * deductions while the shortcode ignored them, so the same member showed two
 * different totals depending on where you looked, and only the REST copy could
 * be windowed at all.
 */
class LeaderboardManager
{

    /**
     * Turn a named range into a start/end pair.
     *
     * Bounds are site-local, matching how `created_at` is written
     * (`PointsManager::log_transaction()` uses `current_time('mysql')`). They
     * used to be computed with `gmdate()`, which put the boundary in a
     * different timezone from the data it was filtering.
     *
     * @param string $slug Range identifier.
     * @return array{start: string|null, end: string|null}
     */
    public static function resolve_range($slug)
    {
        $now = current_time('timestamp');

        switch ($slug) {
            case 'today':
                $start = gmdate('Y-m-d 00:00:00', $now);
                break;

            // `weekly` and `monthly` are shortcode-era aliases. Keep them, or
            // published shortcodes silently change meaning.
            case 'this_week':
            case 'weekly':
                $start = gmdate('Y-m-d 00:00:00', strtotime('monday this week', $now));
                break;

            case 'this_month':
            case 'monthly':
                $start = gmdate('Y-m-01 00:00:00', $now);
                break;

            case 'this_year':
                $start = gmdate('Y-01-01 00:00:00', $now);
                break;

            case 'last_30_days':
                $start = gmdate('Y-m-d 00:00:00', strtotime('-30 days', $now));
                break;

            default:
                $start = null;
                break;
        }

        return array('start' => $start, 'end' => null);
    }

    /**
     * Turn a season row into query arguments.
     *
     * `start_date` and `end_date` are DATE columns — day granularity — so the
     * window has to close at the end of the last day. Taking the bare date
     * would make every season's final day score nothing.
     *
     * Seasons are scored across every currency; `point_type_id` stays 0 unless
     * a caller overrides it.
     *
     * @param array $season Row with start_date and end_date.
     * @param array $extra  Additional arguments, e.g. limit.
     * @return array
     */
    public static function season_window(array $season, array $extra = array())
    {
        $start = ! empty($season['start_date']) && '0000-00-00' !== $season['start_date']
            ? $season['start_date'] . ' 00:00:00'
            : null;

        $end = ! empty($season['end_date']) && '0000-00-00' !== $season['end_date']
            ? $season['end_date'] . ' 23:59:59'
            : null;

        return array_merge(
            array(
                'point_type_id' => 0,
                'start'         => $start,
                'end'           => $end,
            ),
            $extra
        );
    }

    /**
     * Normalise the arguments every query below shares.
     *
     * @param array $args Caller arguments.
     * @return array
     */
    private static function parse_args(array $args)
    {
        return wp_parse_args($args, array(
            'point_type_id' => 0,
            'start'         => null,
            'end'           => null,
            'limit'         => 10,
            'offset'        => 0,
        ));
    }

    /**
     * The window predicate and its values, or empty when unbounded.
     *
     * @param array  $args  Parsed arguments.
     * @param string $alias Table alias carrying `created_at`.
     * @return array{sql: string, values: array}
     */
    private static function window(array $args, $alias)
    {
        $sql    = '';
        $values = array();

        if (! empty($args['start'])) {
            $sql .= " AND {$alias}.created_at >= %s";
            $values[] = $args['start'];
        }

        if (! empty($args['end'])) {
            $sql .= " AND {$alias}.created_at <= %s";
            $values[] = $args['end'];
        }

        return array('sql' => $sql, 'values' => $values);
    }

    /**
     * Ranked rows for a window.
     *
     * Deductions are netted (`HAVING SUM(points) > 0`) rather than skipped, so
     * a balance here is the balance the member actually holds.
     *
     * @param array $args point_type_id, start, end, limit, offset.
     * @return array List of rows: user_id, name, total_points,
     *               achievements_count, top_level, rank.
     */
    public static function get_rows(array $args = array())
    {
        global $wpdb;

        $args   = self::parse_args($args);
        $pt     = absint($args['point_type_id']);
        $limit  = max(1, (int) $args['limit']);
        $offset = max(0, (int) $args['offset']);
        $window = self::window($args, 'l');

        $values = array_merge(array($pt, $pt), $window['values'], array($limit, $offset));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT
                    u.ID AS user_id,
                    u.display_name AS name,
                    p.total_points,
                    IFNULL(ach.ach_count, 0) AS achievements_count,
                    IFNULL(lvl.title, '-') AS top_level
                FROM {$wpdb->users} u
                INNER JOIN (
                    SELECT l.user_id, SUM(l.points) AS total_points
                    FROM {$wpdb->prefix}gameengine_points_log l
                    WHERE ( l.point_type_id = %d OR 0 = %d ){$window['sql']}
                    GROUP BY l.user_id
                    HAVING SUM(l.points) > 0
                ) p ON u.ID = p.user_id
                LEFT JOIN (
                    SELECT user_id, COUNT(*) AS ach_count
                    FROM {$wpdb->prefix}gameengine_user_achievements GROUP BY user_id
                ) ach ON u.ID = ach.user_id
                LEFT JOIN (
                    SELECT ul.user_id, l.title
                    FROM {$wpdb->prefix}gameengine_user_levels ul
                    JOIN {$wpdb->prefix}gameengine_levels l ON ul.level_id = l.id
                    INNER JOIN (
                        SELECT user_id, MAX(priority) AS max_p
                        FROM {$wpdb->prefix}gameengine_user_levels ul2
                        JOIN {$wpdb->prefix}gameengine_levels l2 ON ul2.level_id = l2.id
                        GROUP BY user_id
                    ) lmax ON ul.user_id = lmax.user_id AND l.priority = lmax.max_p
                ) lvl ON u.ID = lvl.user_id
                ORDER BY p.total_points DESC, u.ID ASC
                LIMIT %d OFFSET %d",
                $values
            ),
            ARRAY_A
        ) ?: array();

        $position = $offset + 1;
        foreach ($rows as $index => &$row) {
            $row['position']     = $position + $index;
            $row['total_points'] = (int) $row['total_points'];
        }
        unset($row);

        return $rows;
    }

    /**
     * How many members the same window ranks.
     *
     * Shares `get_rows()`'s predicate, including the `HAVING`. The old count
     * did not, so a member whose net was zero or negative inflated the total
     * without ever appearing in a page of results.
     *
     * @param array $args Same shape as get_rows().
     * @return int
     */
    public static function count_rows(array $args = array())
    {
        global $wpdb;

        $args   = self::parse_args($args);
        $pt     = absint($args['point_type_id']);
        $window = self::window($args, 'l');

        $values = array_merge(array($pt, $pt), $window['values']);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM (
                    SELECT l.user_id
                    FROM {$wpdb->prefix}gameengine_points_log l
                    WHERE ( l.point_type_id = %d OR 0 = %d ){$window['sql']}
                    GROUP BY l.user_id
                    HAVING SUM(l.points) > 0
                ) ranked",
                $values
            )
        );
    }

    /**
     * A member's own standing in a window, or null when they do not place.
     *
     * Competition ranking: everyone ahead is counted, so ties share a position.
     *
     * @param int   $user_id Member to locate.
     * @param array $args    Same shape as get_rows().
     * @return array{position: int, total_points: int}|null
     */
    public static function get_user_position($user_id, array $args = array())
    {
        global $wpdb;

        $safe_user_id = absint($user_id);

        if ($safe_user_id <= 0) {
            return null;
        }

        $args   = self::parse_args($args);
        $pt     = absint($args['point_type_id']);
        $window = self::window($args, 'l');

        $own_values = array_merge(array($safe_user_id, $pt, $pt), $window['values']);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $total = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(l.points) FROM {$wpdb->prefix}gameengine_points_log l
                 WHERE l.user_id = %d AND ( l.point_type_id = %d OR 0 = %d ){$window['sql']}",
                $own_values
            )
        );

        if ($total <= 0) {
            return null;
        }

        $ahead_values = array_merge(array($pt, $pt), $window['values'], array($total));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $ahead = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM (
                    SELECT l.user_id
                    FROM {$wpdb->prefix}gameengine_points_log l
                    WHERE ( l.point_type_id = %d OR 0 = %d ){$window['sql']}
                    GROUP BY l.user_id
                    HAVING SUM(l.points) > %d
                ) ahead",
                $ahead_values
            )
        );

        return array('position' => $ahead + 1, 'total_points' => $total);
    }
}
