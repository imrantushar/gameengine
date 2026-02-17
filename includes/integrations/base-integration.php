<?php

namespace GameEngine\Integrations;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Abstract class BaseIntegration
 * Provides a standard schema and helper methods for integrations.
 */
abstract class BaseIntegration implements IntegrationInterface
{

    /**
     * Merges trigger-specific fields into the standard schema.
     * 
     * @param array  $specific_fields Fields unique to a trigger.
     * @param string $type            Action type: 'award' or 'deduct'.
     * @return array Combined schema.
     */
    protected static function merge_schema(array $specific_fields = array(), $type = 'award'): array
    {
        $common_free = self::get_common_free_schema($type);
        $common_pro  = self::get_common_pro_schema();

        // Check if Pro version is active via helper.
        $is_pro_active = \GameEngine\Helper::is_pro();

        // Combine all fields: Free Common + Specific + Pro Common.
        $all_fields = array_merge($common_free, $specific_fields, $common_pro);

        /**
         * Process Pro field restrictions and formatting.
         */
        foreach ($all_fields as &$field) {
            // Disable field if it's marked as Pro but Pro version is missing.
            if (! empty($field['is_pro']) && true === $field['is_pro']) {
                $field['isDisabled'] = ! $is_pro_active;
            }

            // Check nested options for Pro restrictions.
            if (! empty($field['options']) && is_array($field['options'])) {
                foreach ($field['options'] as &$option) {
                    if (! empty($option['is_pro']) && true === $option['is_pro']) {
                        $option['isDisabled'] = ! $is_pro_active;
                    }
                }
            }
        }

        return array_values($all_fields);
    }

    /**
     * Standard Free Fields (Points, Log, Limit).
     */
    private static function get_common_free_schema($type): array
    {
        return array(
            array(
                'key'     => 'points',
                'label'   => ('award' === $type) ? __('Points to Award', 'gameengine') : __('Points to Deduct', 'gameengine'),
                'type'    => 'number',
                'width'   => '50%',
                'default' => 10,
                'scope'   => array('point_type'),
            ),
            array(
                'key'     => 'log_label',
                'label'   => __('Log Description', 'gameengine'),
                'type'    => 'text',
                'width'   => '50%',
                'default' => ('award' === $type) ? __('Activity Reward', 'gameengine') : __('Activity Penalty', 'gameengine'),
                'scope'   => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key'     => 'limit',
                'label'   => __('Limit', 'gameengine'),
                'type'    => 'select',
                'width'   => '100%',
                'options' => array(
                    array('label' => __('Unlimited', 'gameengine'), 'value' => 'unlimited'),
                    array('label' => __('1 Time Only', 'gameengine'), 'value' => '1_time'),
                    array('label' => __('1 Per Day (Pro)', 'gameengine'), 'value' => '1_per_day', 'is_pro' => true),
                    array('label' => __('1 Per Week (Pro)', 'gameengine'), 'value' => '1_per_week', 'is_pro' => true),
                    array('label' => __('1 Per Month (Pro)', 'gameengine'), 'value' => '1_per_month', 'is_pro' => true),
                ),
                'default' => 'unlimited',
                'scope'   => array('point_type', 'achievement', 'level'),
            ),
        );
    }

    /**
     * Common Pro Fields (Start Time, End Time, Active Days).
     */
    private static function get_common_pro_schema(): array
    {
        return array(
            array(
                'key'         => 'start_time',
                'label'       => __('Start Time (Pro)', 'gameengine'),
                'type'        => 'time',
                'width'       => '50%',
                'placeholder' => '08:00',
                'is_pro'      => true,
                'scope'       => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key'         => 'end_time',
                'label'       => __('End Time (Pro)', 'gameengine'),
                'type'        => 'time',
                'width'       => '50%',
                'placeholder' => '22:00',
                'is_pro'      => true,
                'scope'       => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key'      => 'active_days',
                'label'    => __('Active Days (Pro)', 'gameengine'),
                'type'     => 'select',
                'width'    => '100%',
                'is_multi' => true,
                'is_pro'   => true,
                'options'  => array(
                    array('label' => __('Monday', 'gameengine'), 'value' => 'mon'),
                    array('label' => __('Tuesday', 'gameengine'), 'value' => 'tue'),
                    array('label' => __('Wednesday', 'gameengine'), 'value' => 'wed'),
                    array('label' => __('Thursday', 'gameengine'), 'value' => 'thu'),
                    array('label' => __('Friday', 'gameengine'), 'value' => 'fri'),
                    array('label' => __('Saturday', 'gameengine'), 'value' => 'sat'),
                    array('label' => __('Sunday', 'gameengine'), 'value' => 'sun'),
                ),
                'scope'    => array('point_type', 'achievement', 'level'),
            ),
        );
    }

    /**
     * Backward compatibility helper.
     */
    protected static function get_standard_schema($type = 'award'): array
    {
        return self::merge_schema(array(), $type);
    }
}
