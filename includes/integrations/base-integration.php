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
     */
    protected static function merge_schema(array $specific_fields = array(), $type = 'award'): array
    {
        $common_free = self::get_common_free_schema($type);
        $common_pro  = self::get_common_pro_schema();

        // Check if Pro folder exists.
        $is_pro_active = \GameEngine\Helper::is_pro();

        // Combine all fields.
        $all_fields = array_merge($common_free, $specific_fields, $common_pro);

        /**
         * It loops through fields and their nested options.
         */
        foreach ($all_fields as &$field) {
            // If the main field is marked as Pro, disable it if Pro is missing.
            if (! empty($field['is_pro']) && true === $field['is_pro']) {
                $field['isDisabled'] = ! $is_pro_active;
            }

            // If the field has options (like a Select dropdown), check individual options.
            if (! empty($field['options']) && is_array($field['options'])) {
                foreach ($field['options'] as &$option) {
                    if (! empty($option['is_pro']) && true === $option['is_pro']) {
                        $option['isDisabled'] = ! $is_pro_active;
                    }
                }
            }
        }

        return $all_fields;
    }


    /**
     * Standard Free Fields (Points, Limit, Log)
     */
    private static function get_common_free_schema($type): array
    {
        return array(
            array(
                'key'     => 'points',
                'label'   => ('award' === $type) ? __('Points to Award', 'gameengine') : __('Points to Deduct', 'gameengine'),
                'type'    => 'number',
                'width'   => '50%', // Number field
                'default' => 10,
                'scope'   => array('point_type'),
            ),
            array(
                'key'     => 'log_label',
                'label'   => __('Log Description', 'gameengine'),
                'type'    => 'text',
                'width'   => '50%', // Text field
                'default' => ('award' === $type) ? __('Activity Reward', 'gameengine') : __('Activity Penalty', 'gameengine'),
                'scope'   => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key'     => 'limit',
                'label'   => __('Limit', 'gameengine'),
                'type'    => 'select',
                'width'   => '100%', // Select field
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
     * Common Pro Fields (Time-Based & Days)
     */
    private static function get_common_pro_schema(): array
    {
        return array(
            array(
                'key'         => 'start_time',
                'label'       => __('Start Time (Pro)', 'gameengine'),
                'type'        => 'time',
                'width'       => '50%', // Time field
                'placeholder' => '08:00',
                'is_pro'      => true,
                'scope'       => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key'         => 'end_time',
                'label'       => __('End Time (Pro)', 'gameengine'),
                'type'        => 'time',
                'width'       => '50%', // Time field
                'placeholder' => '22:00',
                'is_pro'      => true,
                'scope'       => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key'      => 'active_days',
                'label'    => __('Active Days (Pro)', 'gameengine'),
                'type'     => 'select',
                'width'    => '100%', // Select field
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
     * Returns the combined standard schema for backward compatibility.
     */
    protected static function get_standard_schema($type = 'award'): array
    {
        return self::merge_schema(array(), $type);
    }
}
