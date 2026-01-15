<?php

namespace Gamify\Integrations;

if (!defined('ABSPATH')) exit;

abstract class BaseIntegration implements IntegrationInterface
{
    /**
     * Get the standard schema for rewards/deductions.
     * 
     * Width breakdown:
     * - select fields: 100%
     * - text/number fields: 50%
     */
    protected static function get_standard_schema($type = 'award'): array
    {
        return [
            // --- Free Fields ---
            [
                'key'     => 'points',
                'label'   => ($type === 'award') ? __('Points to Award', 'gamify') : __('Points to Deduct', 'gamify'),
                'type'    => 'number',
                'width'   => '50%', // Number field
                'default' => 10,
                'width'   => '50%',
                'scope'   => ['point_type']
            ],

            [
                'key'     => 'log_label',
                'label'   => __('Log Description', 'gamify'),
                'type'    => 'text',
                'width'   => '50%', // Text field
                'default' => ($type === 'award') ? __('Activity Reward', 'gamify') : __('Activity Penalty', 'gamify'),
                'scope'   => ['point_type', 'achievement', 'level']
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

            // --- Common Pro Features (Time-Based) ---
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
                    ['label' => __('Monday', 'gamify'), 'value' => 'mon'],
                    ['label' => __('Tuesday', 'gamify'), 'value' => 'tue'],
                    ['label' => __('Wednesday', 'gamify'), 'value' => 'wed'],
                    ['label' => __('Thursday', 'gamify'), 'value' => 'thu'],
                    ['label' => __('Friday', 'gamify'), 'value' => 'fri'],
                    ['label' => __('Saturday', 'gamify'), 'value' => 'sat'],
                    ['label' => __('Sunday', 'gamify'), 'value' => 'sun']
                ],
                'scope'   => ['point_type', 'achievement', 'level']
            ]
        ];
    }
}
