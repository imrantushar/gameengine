<?php

namespace GameEngine\Dev;

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

        $success = \GameEngine\Dev\JsonGenerator::generate();

        if ($success) {
            \WP_CLI::success('Integrations JSON has been rebuilt successfully.');
        } else {
            \WP_CLI::error('Failed to generate Integrations JSON.');
        }
    }
}
