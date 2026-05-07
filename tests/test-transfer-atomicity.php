<?php
/**
 * Tests for point transfer atomicity (rollback on failure).
 */

class Test_Transfer_Atomicity extends WP_UnitTestCase
{
    private int $sender_id;
    private int $receiver_id;

    public function set_up(): void
    {
        parent::set_up();
        $this->sender_id   = self::factory()->user->create();
        $this->receiver_id = self::factory()->user->create();
    }

    private function do_transfer_request(array $params = []): WP_REST_Response
    {
        $defaults = [
            'receiver_id'   => $this->receiver_id,
            'amount'        => 100,
            'point_type_id' => 1,
        ];
        $request = new WP_REST_Request('POST', '/gameengine/v1/pro/transfer');
        $request->set_body_params(array_merge($defaults, $params));

        // Authenticate as sender.
        wp_set_current_user($this->sender_id);

        return rest_do_request($request);
    }

    public function test_transfer_succeeds_with_sufficient_balance()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->sender_id, 500, 'test_setup', ['point_type_id' => 1]);

        $response = $this->do_transfer_request(['amount' => 100]);

        $this->assertSame(200, $response->get_status());
        $this->assertSame(400, $pm->get_total($this->sender_id, 1));
        $this->assertSame(100, $pm->get_total($this->receiver_id, 1));
    }

    public function test_transfer_fails_with_insufficient_balance()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->sender_id, 50, 'test_setup');

        $response = $this->do_transfer_request(['amount' => 100]);

        $this->assertSame(400, $response->get_status());
        // Balances must be unchanged.
        $this->assertSame(50, $pm->get_total($this->sender_id, 1));
        $this->assertSame(0, $pm->get_total($this->receiver_id, 1));
    }

    public function test_transfer_to_self_is_rejected()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->sender_id, 500, 'test_setup');

        $response = $this->do_transfer_request(['receiver_id' => $this->sender_id]);
        $this->assertSame(400, $response->get_status());
    }

    public function test_transfer_to_nonexistent_user_returns_404()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->sender_id, 500, 'test_setup');

        $response = $this->do_transfer_request(['receiver_id' => 999999]);
        $this->assertSame(404, $response->get_status());
    }
}
