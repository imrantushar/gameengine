<?php
if (! defined('ABSPATH')) exit;

final class Gamify_Autoload
{
    private static $instance = null;

    private function __construct()
    {
        spl_autoload_register([$this, 'autoload'], true, true);
    }

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * A robust autoloader that handles PSR-4 style namespaces.
     *
     * @param string $class The fully-qualified class name.
     */
    public function autoload($class)
    {
        $prefix = 'Gamify\\';

        // Check if the class uses our namespace prefix.
        if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
            return; // Not our class, exit.
        }

        // Get the relative class name (e.g., API\Controllers\BaseController).
        $relative_class = substr($class, strlen($prefix));

        // Replace namespace separators with directory separators,
        // and convert PascalCase to kebab-case.
        $kebab_case_path = strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $relative_class));

        // Replace backslashes with the correct directory separator.
        $file_path = str_replace('\\', DIRECTORY_SEPARATOR, $kebab_case_path);

        $file = GAMIFY_INCLUDES . $file_path . '.php';

        if (is_readable($file)) {
            require_once $file;
        }
    }
}
Gamify_Autoload::instance();
