<?php
/**
 * Tests for point exchange calculation, rounding, and cooldown.
 */

use GameEngine\Pro\API\Exchange_Controller;

class Test_Exchange_Calculation extends WP_UnitTestCase
{
    private int $user_id;

    public function set_up(): void
    {
        parent::set_up();
        $this->user_id = self::factory()->user->create();

        update_option('gameengine_exchange_pairs', [
            [
                'id'             => 'pair_1',
                'source_type_id' => 1,
                'dest_type_id'   => 2,
                'source_rate'    => 10,
                'dest_rate'      => 1,
                'fee_percent'    => 0,
                'cooldown_hours' => 0,
                'enabled'        => true,
            ],
            [
                'id'             => 'pair_fee',
                'source_type_id' => 1,
                'dest_type_id'   => 3,
                'source_rate'    => 10,
                'dest_rate'      => 1,
                'fee_percent'    => 10,
                'cooldown_hours' => 0,
                'enabled'        => true,
            ],
            [
                'id'             => 'pair_cd',
                'source_type_id' => 1,
                'dest_type_id'   => 4,
                'source_rate'    => 1,
                'dest_rate'      => 1,
                'fee_percent'    => 0,
                'cooldown_hours' => 24,
                'enabled'        => true,
            ],
        ]);
    }

    public function tear_down(): void
    {
        delete_option('gameengine_exchange_pairs');
        parent::tear_down();
    }

    private function do_confirm(array $params): WP_REST_Response
    {
        wp_set_current_user($this->user_id);
        $request = new WP_REST_Request('POST', '/gameengine/v1/pro/exchange/confirm');
        $request->set_body_params($params);
        return rest_do_request($request);
    }

    public function test_basic_exchange_calculation()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 100, 'setup', ['point_type_id' => 1]);

        $response = $this->do_confirm(['pair_id' => 'pair_1', 'amount' => 100]);

        $this->assertSame(200, $response->get_status());
        $this->assertSame(0,  $pm->get_total($this->user_id, 1));
        $this->assertSame(10, $pm->get_total($this->user_id, 2), '100 source / 10 rate = 10 dest');
    }

    public function test_fractional_remainder_discarded()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 105, 'setup', ['point_type_id' => 1]);

        $this->do_confirm(['pair_id' => 'pair_1', 'amount' => 105]);

        // 105 / 10 = 10 units, 5 remainder discarded. Sender loses 105 (10 * 10 + 5 rem).
        // Actually: floor(105/10) = 10 units consumed = 100 pts deducted; 5 remaining.
        $this->assertSame(5,  $pm->get_total($this->user_id, 1), '5 remainder should stay with sender.');
        $this->assertSame(10, $pm->get_total($this->user_id, 2));
    }

    public function test_fee_applied_to_output()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 100, 'setup', ['point_type_id' => 1]);

        $this->do_confirm(['pair_id' => 'pair_fee', 'amount' => 100]);

        // 100/10=10 dest, 10% fee = 1, net = 9.
        $this->assertSame(9, $pm->get_total($this->user_id, 3), 'Net after 10% fee should be 9.');
    }

    public function test_cooldown_prevents_second_exchange()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 200, 'setup', ['point_type_id' => 1]);

        $r1 = $this->do_confirm(['pair_id' => 'pair_cd', 'amount' => 10]);
        $this->assertSame(200, $r1->get_status());

        $r2 = $this->do_confirm(['pair_id' => 'pair_cd', 'amount' => 10]);
        $this->assertSame(429, $r2->get_status(), 'Cooldown should block second exchange.');
    }

    public function test_insufficient_balance_returns_400()
    {
        $response = $this->do_confirm(['pair_id' => 'pair_1', 'amount' => 100]);
        $this->assertSame(400, $response->get_status());
    }
}
