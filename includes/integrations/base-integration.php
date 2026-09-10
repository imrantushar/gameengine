<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
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
        $all_fields = array_merge(self::get_common_free_schema($type), $specific_fields);

        /**
         * Filters the field schema of a trigger configuration form.
         *
         * Extensions append the fields for the behaviour they implement, so
         * this plugin only ever describes the options it acts on itself.
         *
         * @param array  $all_fields Field definitions.
         * @param string $type       Action type: 'award' or 'deduct'.
         */
        $all_fields = apply_filters('gameengine_trigger_schema_fields', $all_fields, $type);

        return array_values($all_fields);
    }

    /**
     * Standard Free Fields (Points, Log, Limit).
     */
    private static function get_common_free_schema($type): array
    {
        return array(
            array(
                'key' => 'points',
                'label' => ('award' === $type) ? __('Points to Award', 'gameengine') : __('Points to Deduct', 'gameengine'),
                'type' => 'number',
                'width' => '50%',
                'default' => 10,
                'scope' => array('point_type'),
            ),
            array(
                'key' => 'log_label',
                'label' => __('Log Description', 'gameengine'),
                'type' => 'text',
                'width' => '50%',
                'default' => ('award' === $type) ? __('Activity Reward', 'gameengine') : __('Activity Penalty', 'gameengine'),
                'scope' => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key' => 'limit',
                'label' => __('Repeatable Limit', 'gameengine'),
                'type' => 'select',
                'width' => '50%',
                'options' => array(
                    array('label' => __('Unlimited', 'gameengine'), 'value' => 'unlimited'),
                    array('label' => __('1 Time Only', 'gameengine'), 'value' => '1_time'),
                    array('label' => __('Once Per Day', 'gameengine'), 'value' => '1_per_day'),
                    array('label' => __('Once Per Week', 'gameengine'), 'value' => '1_per_week'),
                    array('label' => __('Once Per Month', 'gameengine'), 'value' => '1_per_month'),
                ),
                'default' => 'unlimited',
                'scope' => array('point_type', 'achievement', 'level'),
            ),
            array(
                'key' => 'streak_interval',
                'label' => __('Streak Interval', 'gameengine'),
                'type' => 'select',
                'width' => '50%',
                'options' => array(
                    array('label' => __('Off', 'gameengine'), 'value' => 'off'),
                    array('label' => __('Daily', 'gameengine'), 'value' => 'daily'),
                    array('label' => __('Weekly', 'gameengine'), 'value' => 'weekly'),
                ),
                'default' => 'off',
                'description' => __('Count how many intervals in a row this trigger fires.', 'gameengine'),
                'scope' => array('point_type'),
            ),
            array(
                'key' => 'streak_milestone',
                'label' => __('Streak Milestone', 'gameengine'),
                'type' => 'number',
                'width' => '50%',
                'default' => 7,
                'placeholder' => '7',
                'description' => __('Pay the bonus every time the run reaches a multiple of this.', 'gameengine'),
                'scope' => array('point_type'),
            ),
            array(
                'key' => 'streak_bonus_points',
                'label' => __('Streak Bonus Points', 'gameengine'),
                'type' => 'number',
                'width' => '50%',
                'default' => 0,
                'placeholder' => '0',
                'description' => __('Logged separately from the points this trigger already awards.', 'gameengine'),
                'scope' => array('point_type'),
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

    /**
     * Returns a flat list of all triggers from this integration for the Available Hooks UI.
     * Each entry: [ hook_key, label, integration, hook, parameters ]
     */
    public static function get_hooks_list(): array
    {
        $integration = static::get_name();
        $triggers    = static::get_triggers();
        $list        = array();

        foreach ($triggers as $key => $trigger) {
            $list[] = array(
                'hook_key'    => $key,
                'label'       => $trigger['label'] ?? $key,
                'integration' => $integration,
                'hook'        => $trigger['hook'] ?? $key,
                'description' => $trigger['description'] ?? '',
            );
        }

        return $list;
    }
}
