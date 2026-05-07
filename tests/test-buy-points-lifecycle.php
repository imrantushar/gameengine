<?php
/**
 * Tests for buy-points order lifecycle (pending → completed → refunded).
 */

use GameEngine\Pro\Addons\BuyPoints\Init as BuyPointsAddon;

class Test_Buy_Points_Lifecycle extends WP_UnitTestCase
{
    private int $user_id;

    public function set_up(): void
    {
        parent::set_up();
        $this->user_id = self::factory()->user->create();

        // Seed a test package.
        update_option('gameengine_buy_points_packages', [
            ['id' => 'pkg_1', 'label' => 'Starter', 'points' => 100, 'price' => '4.99', 'currency' => 'USD'],
        ]);
    }

    public function tear_down(): void
    {
        delete_option('gameengine_buy_points_packages');
        parent::tear_down();
    }

    private function insert_pending_order(int $points = 100, string $gateway = 'paypal'): int
    {
        global $wpdb;
        $wpdb->insert(
            $wpdb->prefix . 'gameengine_buy_orders',
            [
                'user_id'       => $this->user_id,
                'point_type_id' => 1,
                'points_amount' => $points,
                'price'         => 4.99,
                'currency'      => 'USD',
                'gateway'       => $gateway,
                'status'        => 'pending',
                'created_at'    => current_time('mysql'),
            ],
            ['%d', '%d', '%d', '%f', '%s', '%s', '%s', '%s']
        );
        return (int) $wpdb->insert_id;
    }

    public function test_complete_order_awards_points()
    {
        $order_id = $this->insert_pending_order();
        BuyPointsAddon::complete_order($order_id, 'txn_test_123', 'paypal');

        $pm      = new \GameEngine\Classes\PointsManager();
        $balance = $pm->get_total($this->user_id, 1);
        $this->assertSame(100, $balance, 'User should receive 100 points after order completion.');
    }

    public function test_complete_order_updates_status_to_completed()
    {
        global $wpdb;
        $order_id = $this->insert_pending_order();
        BuyPointsAddon::complete_order($order_id, 'txn_test_456', 'paypal');

        $status = $wpdb->get_var($wpdb->prepare(
            "SELECT status FROM {$wpdb->prefix}gameengine_buy_orders WHERE order_id = %d",
            $order_id
        ));
        $this->assertSame('completed', $status);
    }

    public function test_complete_order_idempotent()
    {
        $order_id = $this->insert_pending_order();
        BuyPointsAddon::complete_order($order_id, 'txn_1', 'paypal');
        BuyPointsAddon::complete_order($order_id, 'txn_2', 'paypal'); // Should be no-op.

        $pm = new \GameEngine\Classes\PointsManager();
        $this->assertSame(100, $pm->get_total($this->user_id, 1), 'Points should not be doubled on duplicate completion.');
    }

    public function test_refund_order_deducts_points()
    {
        global $wpdb;
        $order_id = $this->insert_pending_order();
        BuyPointsAddon::complete_order($order_id, 'txn_refund', 'paypal');

        // Simulate refund via REST.
        wp_set_current_user(1); // admin
        $request = new WP_REST_Request('POST', "/gameengine/v1/pro/buy-points/orders/{$order_id}/refund");
        rest_do_request($request);

        $pm = new \GameEngine\Classes\PointsManager();
        $this->assertLessThanOrEqual(0, $pm->get_total($this->user_id, 1), 'Points should be deducted on refund.');
    }
}
