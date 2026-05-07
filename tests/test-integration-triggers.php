<?php
/**
 * Integration tests for BuddyPress, LearnDash, and bbPress triggers
 * using mocked plugin active checks.
 */

class Test_Integration_Triggers extends WP_UnitTestCase
{
    private int $user_id;

    public function set_up(): void
    {
        parent::set_up();
        $this->user_id = self::factory()->user->create();

        // Activate the integration addons.
        update_option('gameengine_active_addons', [
            'buddypress_integration',
            'learndash_integration',
            'bbpress_integration',
        ]);
    }

    public function tear_down(): void
    {
        delete_option('gameengine_active_addons');
        parent::tear_down();
    }

    // ── BuddyPress ────────────────────────────────────────────────────────────

    public function test_buddypress_group_join_get_user_id()
    {
        if (! class_exists('\GameEngine\Integrations\BuddyPress')) {
            require_once GAMEENGINE_INCLUDES . 'integrations/buddypress.php';
        }

        $triggers = \GameEngine\Integrations\BuddyPress::get_triggers();
        $this->assertArrayHasKey('bp_group_join', $triggers);

        $fn = $triggers['bp_group_join']['get_user_id'];
        $this->assertSame($this->user_id, $fn(42, $this->user_id));
    }

    public function test_buddypress_profile_photo_returns_item_id()
    {
        if (! class_exists('\GameEngine\Integrations\BuddyPress')) {
            require_once GAMEENGINE_INCLUDES . 'integrations/buddypress.php';
        }

        $triggers = \GameEngine\Integrations\BuddyPress::get_triggers();
        $fn = $triggers['bp_profile_photo_upload']['get_user_id'];
        $this->assertSame($this->user_id, $fn($this->user_id, 'user', []));
    }

    // ── LearnDash ─────────────────────────────────────────────────────────────

    public function test_learndash_quiz_pass_returns_user_id_when_passed()
    {
        if (! class_exists('\GameEngine\Integrations\LearnDash')) {
            require_once GAMEENGINE_INCLUDES . 'integrations/learndash.php';
        }

        $triggers = \GameEngine\Integrations\LearnDash::get_triggers();
        $fn       = $triggers['ld_quiz_completed_pass']['get_user_id'];
        $user     = (object) ['ID' => $this->user_id];

        $this->assertSame($this->user_id, $fn(['pass' => true], $user), 'Should return user_id on pass.');
        $this->assertSame(0, $fn(['pass' => false], $user), 'Should return 0 on fail.');
    }

    public function test_learndash_quiz_fail_returns_user_id_when_failed()
    {
        if (! class_exists('\GameEngine\Integrations\LearnDash')) {
            require_once GAMEENGINE_INCLUDES . 'integrations/learndash.php';
        }

        $triggers = \GameEngine\Integrations\LearnDash::get_triggers();
        $fn       = $triggers['ld_quiz_completed_fail']['get_user_id'];
        $user     = (object) ['ID' => $this->user_id];

        $this->assertSame($this->user_id, $fn(['pass' => false], $user), 'Should return user_id on fail.');
        $this->assertSame(0, $fn(['pass' => true], $user), 'Should return 0 on pass.');
    }

    // ── bbPress ───────────────────────────────────────────────────────────────

    public function test_bbpress_new_topic_returns_author_id()
    {
        if (! class_exists('\GameEngine\Integrations\BBPress')) {
            require_once GAMEENGINE_INCLUDES . 'integrations/bbpress.php';
        }

        $triggers = \GameEngine\Integrations\BBPress::get_triggers();
        $fn       = $triggers['bbp_new_topic']['get_user_id'];

        $this->assertSame($this->user_id, $fn(1, 1, [], $this->user_id));
    }

    public function test_bbpress_first_post_deduplication()
    {
        if (! class_exists('\GameEngine\Integrations\BBPress')) {
            require_once GAMEENGINE_INCLUDES . 'integrations/bbpress.php';
        }

        $triggers = \GameEngine\Integrations\BBPress::get_triggers();
        $fn       = $triggers['bbp_first_post_in_forum']['get_user_id'];

        // First call: no meta yet, should return user_id.
        $this->assertSame($this->user_id, $fn(1, 1, [], $this->user_id));

        // Set the meta (simulating what init.php does after award).
        update_user_meta($this->user_id, 'gameengine_bbp_first_post_awarded', 1);

        // Second call: meta set, should return 0.
        $this->assertSame(0, $fn(2, 1, [], $this->user_id));

        delete_user_meta($this->user_id, 'gameengine_bbp_first_post_awarded');
    }
}
