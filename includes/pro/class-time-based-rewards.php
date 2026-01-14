<?php

namespace Gamify\Pro;

if (! defined('ABSPATH')) exit;

class Time_Based_Rewards
{

    public static function init()
    {

        add_filter('gamify_check_timing_validity', [__CLASS__, 'validate_timing'], 10, 2);
    }

    /**
     * Validates if the reward should be given based on time and day.
     */
    public static function validate_timing($is_valid, $params)
    {

        if (!empty($params['active_days'])) {
            $active_days = (array) $params['active_days'];
            $today = strtolower(current_time('D')); // mon, tue, etc.
            if (!in_array($today, $active_days)) {
                return false;
            }
        }

        if (!empty($params['start_time']) && !empty($params['end_time'])) {
            $current_time = current_time('H:i');
            $start = date("H:i", strtotime($params['start_time']));
            $end   = date("H:i", strtotime($params['end_time']));

            if ($current_time < $start || $current_time > $end) {
                return false;
            }
        }


        return $is_valid;
    }
}
