<?php
/**
 * PHPUnit bootstrap — loads the WordPress test library.
 * Run bin/install-wp-tests.sh first to set up the test DB.
 */

$_tests_dir = getenv('WP_TESTS_DIR');

if (! $_tests_dir) {
    $_tests_dir = rtrim(sys_get_temp_dir(), '/\\') . '/wordpress-tests-lib';
}

if (! file_exists("{$_tests_dir}/includes/functions.php")) {
    echo "Could not find {$_tests_dir}/includes/functions.php.\n";
    echo "Run: bash bin/install-wp-tests.sh <db> <user> <pass> localhost latest\n";
    exit(1);
}

// Plugin base path constant for tests (normally set in main plugin file).
define('GAMEENGINE_VERSION', '1.1.2');
define('GAMEENGINE_PATH', dirname(__DIR__) . '/');
define('GAMEENGINE_URL', 'http://example.org/wp-content/plugins/gameengine/');
define('GAMEENGINE_INCLUDES', GAMEENGINE_PATH . 'includes/');

// Load WordPress test library.
require_once "{$_tests_dir}/includes/functions.php";

function _manually_load_plugin()
{
    require dirname(__DIR__) . '/gameengine.php';
}

tests_add_filter('muplugins_loaded', '_manually_load_plugin');

require "{$_tests_dir}/includes/bootstrap.php";
