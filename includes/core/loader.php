<?php

namespace Gamify\Core;

if (! defined('ABSPATH')) exit;

final class Loader
{
    private static $instance = null;
    private $services = [];

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {

        $this->register_service_hooks();
    }

    /**
     * Get the list of services and the hooks to initialize them on.
     * @return array
     */
    private function get_services_list()
    {
        return [
            'admin_menu' => [
                'class'     => \Gamify\Admin\Menu::class,
                'condition' => is_admin(),
                'hook'      => 'init',
            ],
            'api_manager' => [
                'class'     => \Gamify\API\Manager::class,
                'hook'      => 'rest_api_init',
            ],
            'system_triggers' => [
                'class'     => \Gamify\System\Triggers::class,
                'hook'      => 'init',
            ],
        ];
    }

    /**
     * Registers the WordPress hooks that will initialize each service.
     */
    private function register_service_hooks()
    {
        $services = $this->get_services_list();

        foreach ($services as $key => $config) {

            $should_load = $config['condition'] ?? true;
            if (!$should_load) {
                continue;
            }

            $callback = function () use ($key, $config) {

                if (empty($this->services[$key]) && class_exists($config['class'])) {
                    $this->services[$key] = new $config['class']();
                }
            };

            if (isset($config['hook'])) {
                add_action($config['hook'], $callback);
            } else {
                // As a fallback, load on plugins_loaded if no specific hook is defined.
                add_action('plugins_loaded', $callback);
            }
        }
    }

    /**
     * Get a loaded service instance by its key.
     * @param string $key
     * @return object|null
     */
    public function get_service($key)
    {
        return $this->services[$key] ?? null;
    }
}
