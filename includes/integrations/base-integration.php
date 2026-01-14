<?php

namespace Gamify\Integrations;

if (!defined('ABSPATH')) exit;

abstract class BaseIntegration implements IntegrationInterface
{
    /**
     * Merge specific fields into the standard schema with correct ordering.
     * Order: 1. Free Common -> 2. Trigger Specific -> 3. Pro Common
     */
    protected static function merge_schema(array $specific_fields = [], $type = 'award'): array
    {
        $common_free = self::get_common_free_schema($type);
        $common_pro  = self::get_common_pro_schema();

        return array_merge($common_free, $specific_fields, $common_pro);
    }

    private static function get_common_free_schema($type): array
    {
        return [
            [
                'key'     => 'points',
                'label'   => ($type === 'award') ? __('Points to Award', 'gamify') : __('Points to Deduct', 'gamify'),
                'type'    => 'number',
                'default' => 10,
                'width'   => '50%',
                'scope'   => ['point_type']
            ],
            [
                'key'     => 'log_label',
                'label'   => __('Log Description', 'gamify'),
                'type'    => 'text',
                'width'   => '50%',
                'default' => ($type === 'award') ? __('Activity Reward', 'gamify') : __('Activity Penalty', 'gamify'),
                'scope'   => ['point_type', 'achievement', 'level']
            ],
            [
                'key'     => 'limit',
                'label'   => __('Limit', 'gamify'),
                'type'    => 'select',
                'width'   => '100%',
                'options' => [
                    ['label' => __('Unlimited', 'gamify'), 'value' => 'unlimited'],
                    ['label' => __('1 Time Only', 'gamify'), 'value' => '1_time'],
                    ['label' => __('1 Per Day (Pro)', 'gamify'), 'value' => '1_per_day', 'is_pro' => true],
                    ['label' => __('1 Per Week (Pro)', 'gamify'), 'value' => '1_per_week', 'is_pro' => true],
                    ['label' => __('1 Per Month (Pro)', 'gamify'), 'value' => '1_per_month', 'is_pro' => true],
                ],
                'default' => 'unlimited',
                'scope'   => ['point_type', 'achievement', 'level']
            ],

        ];
    }

    private static function get_common_pro_schema(): array
    {
        return [
            [
                'key'     => 'start_time',
                'label'   => __('Start Time (Pro)', 'gamify'),
                'type'    => 'time',
                'width'   => '50%',
                'placeholder' => '08:00',
                'is_pro'  => true,
                'scope'   => ['point_type', 'achievement', 'level']
            ],
            [
                'key'     => 'end_time',
                'label'   => __('End Time (Pro)', 'gamify'),
                'type'    => 'time',
                'width'   => '50%',
                'placeholder' => '22:00',
                'is_pro'  => true,
                'scope'   => ['point_type', 'achievement', 'level']
            ],
            [
                'key'     => 'active_days',
                'label'   => __('Active Days (Pro)', 'gamify'),
                'type'    => 'select',
                'width'   => '100%',
                'is_multi' => true,
                'is_pro'  => true,
                'options' => [
                    ['label' => 'Monday', 'value' => 'mon'],
                    ['label' => 'Tuesday', 'value' => 'tue'],
                    ['label' => 'Wednesday', 'value' => 'wed'],
                    ['label' => 'Thursday', 'value' => 'thu'],
                    ['label' => 'Friday', 'value' => 'fri'],
                    ['label' => 'Saturday', 'value' => 'sat'],
                    ['label' => 'Sunday', 'value' => 'sun']
                ],
                'scope'   => ['point_type', 'achievement', 'level']
            ]
        ];
    }

    // Kept for backward compatibility if needed, but recommended to use merge_schema()
    protected static function get_standard_schema($type = 'award'): array
    {
        return self::merge_schema([], $type);
    }
}
