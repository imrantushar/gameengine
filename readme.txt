=== GameEngine - Gamification for Website ===
Contributors: kodezen, academylms, tusharimran
Tags: gamification, points, achievements, ranks, rewards
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Award points, achievements, and ranks to boost user engagement and build a loyal community with a powerful gamification system.

== Description ==

**GameEngine** is a complete gamification engine designed to boost user engagement. It allows you to create a fun, interactive experience by rewarding users with points, achievements, and ranks for participating on your site.

Whether you run a blog, an e-learning platform, or an e-commerce store, GameEngine helps you motivate your users by turning site interactions into a rewarding game.

**Key Features:**

*   **Powerful Points System:** Award points for registration, daily visits, post publishing, and more.
*   **Customizable Point Types:** Create multiple types of points like Coins, Gems, or XP.
*   **Achievements & Badges:** Define achievements that users can unlock by completing specific tasks.
*   **Rank System:** Create ranks (e.g., Bronze, Silver, Gold) that users can earn over time.

== Installation ==

1.  Upload the `gameengine` folder to the `/wp-content/plugins/` directory.
2.  Activate the plugin through the 'Plugins' menu in WordPress.
3.  Go to the "GameEngine" menu in your WordPress admin dashboard to start.

== Frequently Asked Questions ==

= What kind of activities can I award points for? =

You can award points for actions like user registration, daily logins, publishing posts, and leaving comments.

== Changelog ==

= 1.2.0 - 2026-05-07 =
* Added: Points Expiration — award points with an expiry window; daily cron deducts expired points automatically.
* Added: Enhanced Email Notifications — per-event HTML email templates with tag substitution and per-user opt-out.
* Added: New Engagement Triggers — link-click tracking, video watch threshold, birthday, and anniversary triggers.
* Added: Social Sharing — share achievement unlocks to Facebook, Twitter, and LinkedIn with auto-generated OG images.
* Added: Bulk Admin Tools — award/deduct/badge/level users in bulk by role or CSV upload with dry-run preview.
* Added: Data Import/Export — CSV export/import for point balances; JSON export/import for full plugin configuration.
* Added: Progress Bar — `[gameengine_progress_bar]` shortcode with level and achievement modes; CSS custom-property theming.
* Added: BuddyPress/BuddyBoss Integration — forum topics, replies, group joins, friend accepts, profile photo, profile updates.
* Added: LearnDash Integration — course/lesson/topic completion, quiz pass/fail, assignment submitted/approved.
* Added: bbPress Integration — new topics, replies, topic resolved, first-post lifetime award with deduplication.
* Added: Gutenberg Blocks — Leaderboard, Points Balance, Achievements, Levels, Profile, Progress Map, Point History, Progress Bar blocks.
* Added: `expiry_days` parameter to trigger rule schemas for all integrations.
* Added: `gameengine_get_point_cap` filter for pro cap enforcement without modifying core PointsManager.
* Added: `badge_assertion_id` column on user achievements table; `disable_sharing` flag on achievements table.
* Added: WP-CLI `wp gameengine expire-points [--dry-run]` command.

= 1.1.1 - 2025-05-06 =
* Improved - Chakra UI removed and migrated to tailwind.
* Improved - Complete UI updated.

= 1.1.1 - 2025-04-23 =
* Added - StoreEngine SDK integration ( License Management ).

= 1.1.0 - 2025-04-20 =
* Added Tutor LMS Integration.
* New Triggers: Course Completed, Course Published (Instructor), Lesson Completed, Quiz Attempt Ended, Quiz Passed, Assignment Submitted, and New Enrollment.
* Dynamic schema support for selection of specific Courses, Lessons, Quizzes, and Assignments.

= 1.0.0 - 2025-01-20 =
* Initial release of the GameEngine plugin.
* Fixed coding standards and security guidelines for WordPress.org submission.

== Upgrade Notice ==

= 1.0.0 =
Initial version launch.