<?php

namespace GameEngine\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Referral Integration for GameEngine.
 * Provides triggers for referral activities.
 */
class Referral extends BaseIntegration
{
    /**
     * Get the integration slug.
     */
    public static function get_slug(): string
    {
        return 'referral';
    }

    /**
     * Get the integration name.
     */
    public static function get_name(): string
    {
        return __('Referral System', 'gameengine');
    }

    /**
     * Get the integration icon.
     */
    public static function get_icon(): string
    {
        return 'dashicons-groups';
    }

    /**
     * Define the triggers provided by this integration.
     */
    public static function get_triggers(): array
    {
        return [
            'referral_signup' => [
                'label' => __('Success Referral', 'gameengine'),
                'hook' => 'gameengine_referral_signup',
                'description' => __('Awarded when someone joins the site using the users referral link.', 'gameengine'),
                'args_count' => 2,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($referrer_id, $referee_id) {
                    return $referrer_id;
                },
                'schema' => self::merge_schema([])
            ],
            'referral_engagement' => [
                'label' => __('Referral Engagement', 'gameengine'),
                'hook' => 'gameengine_referral_engagement',
                'description' => __('Awarded to the referrer when their referee performs a key action.', 'gameengine'),
                'args_count' => 3,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($referrer_id, $referee_id, $action_key) {
                    return $referrer_id;
                },
                'schema' => self::merge_schema([
                    [
                        'key' => 'action_key',
                        'label' => __('Target Action (Pro)', 'gameengine'),
                        'type' => 'select',
                        'width' => '50%',
                        'is_pro' => true,
                        'options' => [
                            ['label' => __('Any Action', 'gameengine'), 'value' => 'any'],
                            ['label' => __('Level Up', 'gameengine'), 'value' => 'level_up'],
                            ['label' => __('Achievement Unlock', 'gameengine'), 'value' => 'achievement_unlock'],
                        ]
                    ]
                ])
            ],
            'referral_purchase' => [
                'label' => __('Referral Purchase (Referrer Reward)', 'gameengine'),
                'hook' => 'gameengine_referral_purchase',
                'description' => __('Awarded to the referrer when their referee completes a WooCommerce purchase.', 'gameengine'),
                'args_count' => 3,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($referrer_id, $referee_id, $order_id) {
                    return $referrer_id;
                },
                'schema' => self::merge_schema([])
            ],
            'referral_enrollment' => [
                'label' => __('Referral Course Enrollment (Referrer Reward)', 'gameengine'),
                'hook' => 'gameengine_referral_enrollment',
                'description' => __('Awarded to the referrer when their referee enrolls in a course (Tutor/Academy LMS).', 'gameengine'),
                'args_count' => 3,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($referrer_id, $referee_id, $course_id) {
                    return $referrer_id;
                },
                'schema' => self::merge_schema([])
            ],
            'referral_course_complete' => [
                'label' => __('Referral Course Completion (Referrer Reward)', 'gameengine'),
                'hook' => 'gameengine_referral_course_complete',
                'description' => __('Awarded to the referrer when their referee completes a course.', 'gameengine'),
                'args_count' => 3,
                'supports' => ['point_type', 'achievement', 'level'],
                'get_user_id' => function ($referrer_id, $referee_id, $course_id) {
                    return $referrer_id;
                },
                'schema' => self::merge_schema([])
            ],
        ];
    }
}
