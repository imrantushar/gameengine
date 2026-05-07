<?php
/**
 * Tests for sell-content purchase REST endpoint.
 */

use GameEngine\Pro\Addons\SellContent\Init as SellContentAddon;

class Test_Sell_Content_Purchase extends WP_UnitTestCase
{
    private int $user_id;
    private int $post_id;

    public function set_up(): void
    {
        parent::set_up();
        $this->user_id = self::factory()->user->create();
        $this->post_id = self::factory()->post->create(['post_status' => 'publish']);

        // Price the post at 100 points.
        update_post_meta($this->post_id, '_ge_content_price', 100);
        update_post_meta($this->post_id, '_ge_content_type_id', 1);
    }

    private function do_purchase(int $post_id = 0): WP_REST_Response
    {
        wp_set_current_user($this->user_id);
        $request = new WP_REST_Request('POST', '/gameengine/v1/pro/content/purchase');
        $request->set_body_params([
            'post_id'       => $post_id ?: $this->post_id,
            'point_type_id' => 1,
        ]);
        return rest_do_request($request);
    }

    public function test_purchase_deducts_points_and_unlocks()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 200, 'test_setup');

        $response = $this->do_purchase();
        $this->assertSame(200, $response->get_status());

        $balance = $pm->get_total($this->user_id, 1);
        $this->assertSame(100, $balance, 'Points should be deducted.');
        $this->assertTrue(SellContentAddon::user_has_access($this->user_id, $this->post_id), 'User should have access after purchase.');
    }

    public function test_purchase_fails_with_insufficient_balance()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 50, 'test_setup');

        $response = $this->do_purchase();
        $this->assertSame(400, $response->get_status());
        $this->assertFalse(SellContentAddon::user_has_access($this->user_id, $this->post_id));
    }

    public function test_double_purchase_is_idempotent()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 500, 'test_setup');

        $this->do_purchase();
        $balance_after_first = $pm->get_total($this->user_id, 1);

        $r2 = $this->do_purchase();
        $this->assertSame(200, $r2->get_status());
        $this->assertSame($balance_after_first, $pm->get_total($this->user_id, 1), 'Second purchase should not deduct more.');
    }

    public function test_admin_always_has_access()
    {
        $admin_id = self::factory()->user->create(['role' => 'administrator']);
        $this->assertTrue(SellContentAddon::user_has_access($admin_id, $this->post_id), 'Admin should always have access.');
    }

    public function test_purchase_nonexistent_post_returns_404()
    {
        $pm = new \GameEngine\Classes\PointsManager();
        $pm->add($this->user_id, 500, 'test_setup');

        $response = $this->do_purchase(999999);
        $this->assertSame(404, $response->get_status());
    }
}
