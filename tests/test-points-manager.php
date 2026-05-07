<?php
/**
 * Tests for PointsManager cap enforcement and expiration logic.
 */

use GameEngine\Classes\PointsManager;

class Test_Points_Manager extends WP_UnitTestCase
{
    private PointsManager $pm;
    private int $user_id;

    public function set_up(): void
    {
        parent::set_up();
        $this->pm      = new PointsManager();
        $this->user_id = self::factory()->user->create();
    }

    public function test_add_points_increases_balance()
    {
        $this->pm->add($this->user_id, 100, 'test');
        $this->assertSame(100, $this->pm->get_total($this->user_id, 1));
    }

    public function test_deduct_points_decreases_balance()
    {
        $this->pm->add($this->user_id, 200, 'test');
        $this->pm->deduct($this->user_id, 50, 'test_deduct');
        $this->assertSame(150, $this->pm->get_total($this->user_id, 1));
    }

    public function test_cap_enforcement_truncates_award()
    {
        // Hook a cap of 500 for point type 1.
        add_filter('gameengine_get_point_cap', function ($cap, $user_id, $pt_id) {
            return ($pt_id === 1) ? 500 : $cap;
        }, 10, 3);

        $this->pm->add($this->user_id, 400, 'test');
        // Award 200 more: should be truncated to 100 (reaching cap of 500).
        $this->pm->add($this->user_id, 200, 'test');
        $balance = $this->pm->get_total($this->user_id, 1);

        $this->assertSame(500, $balance, 'Balance should be capped at 500.');

        remove_all_filters('gameengine_get_point_cap');
    }

    public function test_cap_action_fires_when_truncated()
    {
        add_filter('gameengine_get_point_cap', fn() => 100, 10, 3);

        $capped_fired = false;
        add_action('gameengine_points_capped', function () use (&$capped_fired) {
            $capped_fired = true;
        }, 10, 4);

        $this->pm->add($this->user_id, 50, 'test');
        $this->pm->add($this->user_id, 100, 'test'); // Should truncate.

        $this->assertTrue($capped_fired, 'gameengine_points_capped action should fire.');

        remove_all_filters('gameengine_get_point_cap');
        remove_all_actions('gameengine_points_capped');
    }

    public function test_expiry_days_sets_expires_at()
    {
        global $wpdb;

        $this->pm->add($this->user_id, 100, 'test', ['expiry_days' => 7]);

        $expires_at = $wpdb->get_var($wpdb->prepare(
            "SELECT expires_at FROM {$wpdb->prefix}gameengine_points_log WHERE user_id = %d ORDER BY id DESC LIMIT 1",
            $this->user_id
        ));

        $this->assertNotNull($expires_at, 'expires_at should be set when expiry_days is provided.');
        $this->assertGreaterThan(date('Y-m-d H:i:s'), $expires_at, 'expires_at should be in the future.');
    }

    public function test_add_with_zero_points_returns_false()
    {
        $result = $this->pm->add($this->user_id, 0, 'test');
        $this->assertFalse($result);
    }

    public function test_add_with_negative_user_id_returns_false()
    {
        $result = $this->pm->add(-1, 100, 'test');
        $this->assertFalse($result);
    }
}
