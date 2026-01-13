<?php

namespace Gamify\Pro;

if (! defined('ABSPATH')) exit;

class Time_Based_Rewards
{

    public static function init()
    {
        // কোরের ফিল্টারে হুক করা
        add_filter('gamify_check_timing_validity', [__CLASS__, 'validate_timing'], 10, 2);
    }

    /**
     * Validates if the reward should be given based on time and day.
     */
    public static function validate_timing($is_valid, $params)
    {

        if (!empty($params['active_days']) && is_array($params['active_days'])) {
            $today = strtolower(current_time('D')); // e.g., mon, tue, wed
            if (!in_array($today, $params['active_days'])) {
                return false;
            }
        }

        // ২. সময় চেক করা (Start/End Time)
        if (!empty($params['start_time']) && !empty($params['end_time'])) {
            $current_time = current_time('H:i'); // সার্ভারের বর্তমান সময় (২৪ ঘণ্টা ফরম্যাট)

            if ($current_time < $params['start_time'] || $current_time > $params['end_time']) {
                return false; // নির্দিষ্ট সময়ের বাইরে
            }
        }

        return $is_valid;
    }
}
