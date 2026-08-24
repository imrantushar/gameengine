<?php
/**
 * Development-only tooling.
 *
 * This directory is excluded from the release build (see .distignore), so
 * nothing in here exists on an installed site. Every call site is guarded with
 * class_exists() and becomes a no-op once the folder is stripped.
 *
 * Contents:
 *  - json-generator.php  Regenerates dev-tools/integrations.json from the live
 *                        TriggerRegistry, so the integration schemas can be
 *                        inspected while working on them.
 *  - cli.php             `wp gameengine build` wrapper around the generator.
 *  - integrations.json   The generated manifest. Overlaid by the triggers
 *                        controller when present; installed sites read the
 *                        registry directly.
 *
 * @package GameEngine
 */

namespace GameEngine\Dev;

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/json-generator.php';
require_once __DIR__ . '/cli.php';
