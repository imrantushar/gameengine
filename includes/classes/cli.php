<?php

namespace GameEngine\Classes;

if (! defined('ABSPATH')) exit;

/**
 * GameEngine WP-CLI Commands.
 */
class CLI
{

    /**
     * Build the integrations.json file.
     *
     * ## EXAMPLES
     *
     *     wp gameengine build
     *
     * @when after_wp_load
     */
    public function build($args, $assoc_args)
    {
        \WP_CLI::log('Generating GameEngine integrations.json...');

        $success = \GameEngine\Classes\JsonGenerator::generate();

        if ($success) {
            \WP_CLI::success('Integrations JSON has been rebuilt successfully.');
        } else {
            \WP_CLI::error('Failed to generate Integrations JSON.');
        }
    }

    /**
     * Expire points that have passed their expiry date.
     *
     * ## OPTIONS
     *
     * [--dry-run]
     * : Preview affected users and points without making any changes.
     *
     * ## EXAMPLES
     *
     *     wp gameengine expire-points
     *     wp gameengine expire-points --dry-run
     *
     * @when after_wp_load
     */
    public function expire_points($args, $assoc_args)
    {
        $dry_run = isset($assoc_args['dry-run']);

        if ($dry_run) {
            \WP_CLI::log('Running in dry-run mode — no changes will be made.');
        }

        $result = \GameEngine\Addons\PointsExpiration\Init::run_expiration($dry_run);

        if ($dry_run) {
            \WP_CLI::log(sprintf(
                'Would affect %d user(s) and expire %d points.',
                $result['users_affected'],
                $result['points_expired']
            ));
        } else {
            \WP_CLI::success(sprintf(
                'Expiration complete. Affected %d user(s); expired %d points.',
                $result['users_affected'],
                $result['points_expired']
            ));
        }
    }
}
