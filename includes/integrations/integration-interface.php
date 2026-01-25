<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) exit;

interface IntegrationInterface
{
    public static function get_slug(): string;
    public static function get_name(): string;
    public static function get_icon(): string;
    public static function get_triggers(): array;
}
