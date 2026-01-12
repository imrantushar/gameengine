<?php

namespace Gamify\Classes;

if (! defined('ABSPATH')) exit;

/**
 * Gamify WP-CLI Commands.
 */
class CLI
{

    /**
     * Build the integrations.json file.
     * 
     * ## EXAMPLES
     * 
     *     wp gamify build
     *
     * @when after_wp_load
     */
    public function build($args, $assoc_args)
    {
        \WP_CLI::log('Generating Gamify integrations.json...');

        $success = \Gamify\Classes\JsonGenerator::generate();

        if ($success) {
            \WP_CLI::success('Integrations JSON has been rebuilt successfully.');
        } else {
            \WP_CLI::error('Failed to generate Integrations JSON.');
        }
    }
}
