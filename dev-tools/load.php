<?php
/**
 * Development-only tooling.
 *
 * This directory is excluded from the release build (see .distignore), so
 * nothing in here exists on an installed site. Every call site is guarded with
 * class_exists() and becomes a no-op once the folder is stripped.
 *
 * Contents:
 *  - json-generator.php  Writes assets/json/integrations.json from the live
 *                        TriggerRegistry.
 *  - cli.php             `wp gameengine build` wrapper around the generator.
 *
 * The generated manifest lives in assets/json/ and ships with the plugin — the
 * triggers controller reads it. Only the generator is development-only, so
 * regenerate and commit the manifest whenever an integration's triggers change.
 *
 * @package GameEngine
 */

namespace GameEngine\Dev;

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/json-generator.php';
require_once __DIR__ . '/cli.php';
