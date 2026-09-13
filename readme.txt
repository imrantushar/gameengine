=== GameEngine - Gamification, Points, Badges & Leaderboards ===
Contributors: kodezen, academylms, tusharimran
Tags: gamification, points, badges, leaderboard, rewards
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Gamify your site with points, badges, levels, leaderboards and a rewards store. Motivate members, boost engagement and build a loyal community.

== Description ==

**GameEngine is a complete gamification plugin for WordPress.** Reward the things members already do on your site, such as signing up, logging in, commenting, finishing a course or placing an order, with points, badges, levels and a place on the leaderboard. Engaged members come back more often, finish more courses and buy again.

Use GameEngine to run an online academy, a membership or community site, an online store or a blog. It connects to the plugins you already use, and a setup wizard gets your first points system, badges and levels running in minutes.

Every feature below is included and fully functional, apart from the separate GameEngine Pro plugin described at the end. Nothing in GameEngine is limited by a license key, a trial, a quota or a time limit.

= Points system =

* **Multiple point types:** create as many currencies as you need, such as Coins, Gems or XP.
* **Award and deduction rules:** give or take points whenever a trigger fires, with limits on how often a rule pays out.
* **Streak bonuses:** reward members who keep an activity going for consecutive days or weeks.
* **Manual adjustments:** add or remove points for any member from the admin.
* **Sell points:** link a WooCommerce or StoreEngine product to a points amount, and members receive the points when they buy it.
* **Full history:** every award and deduction is logged, with CSV export.

= Achievements and badges =

* **Achievements** unlock from a points total or from any trigger.
* **Badge Editor:** design badges with a shape, colours and an icon or your own image, with a live preview.
* **Achievement types** keep large collections organised.
* **Prerequisites:** with the Restrict Unlock add-on, an achievement or level can wait until a member has earned another achievement or level.
* **Share links** let members show off the achievements they have earned.

= Levels and ranks =

* **Level ladders** such as Bronze, Silver and Gold, reached from a points threshold or from any trigger.
* **One currency or all of them:** a level can count a single point type or a member's total across every point type.
* **Level icons:** a built-in icon in the colour you choose, or your own image from the Media Library.
* **Level-up emails** that congratulate members when they reach a new level.

= Leaderboards =

* Rank members by points for all time, today, this week, this month, this year or the last 30 days.
* Show a single point type, or every currency together.
* Place a leaderboard on any page with the `[gameengine_leaderboard]` shortcode.

= Rewards Store =

* Let members spend their points on rewards you create.
* Set optional stock and per-member limits for each reward.
* Show the catalog on any page with `[gameengine_rewards]`.

= Content restriction =

* Lock a post or page until a member reaches a points total, earns an achievement or reaches a level.
* Wrap any part of a page in `[gameengine_restrict]`, with your own message for members who don't qualify yet.
* Lock the description on Academy LMS course pages with the same rules.

= Member dashboard and progress map =

* **Profile dashboard:** points, achievements, levels, streaks and a progress map in one place with `[gameengine_profile]`.
* **Progress map:** a visual path through every level and achievement, showing what's next.
* **Responsive design** that inherits your theme's fonts and loads its styles only on pages that show GameEngine.

= Notifications and emails =

* **Activity:** an admin bell and an Activity screen list every points, achievement and level-up notification, searchable and filterable by type.
* **Emails:** templates for level-ups, unlocked achievements, points milestones and inactivity reminders, sent as HTML or plain text.

= Easy setup and management =

* **Setup wizard** with ready-made presets that create starter point types, achievements, levels and rules.
* **Dashboard** with engagement stats, a points chart, your top members and a Get started checklist.
* **Import and export** achievements, levels and point types, and export members' history and the logs, as CSV or JSON.
* **Dark mode** for the admin screens.
* **Translation-ready**, with right-to-left (RTL) support.

= Integrations =

GameEngine awards points for activity in the plugins you already run. Academy LMS, Tutor LMS, WooCommerce and StoreEngine are switched on from the Add-ons screen; the others connect automatically when their plugin is active.

* **WordPress:** registrations, logins, daily visits, new posts and pages, comments, profile updates and more.
* **WooCommerce:** purchases, specific products, product reviews and refunds.
* **StoreEngine:** purchases, first purchases, completed and refunded orders, customer sign-ups and logins, reviews, coupons and subscription changes.
* **Academy LMS:** completed courses and lessons, passed quizzes, submitted and evaluated assignments, and new enrollments.
* **Tutor LMS:** completed courses and lessons, quiz attempts, submitted assignments and new enrollments.
* **LearnDash:** completed courses, lessons, topics and quizzes, and uploaded assignments.
* **LifterLMS:** completed courses, lessons and quizzes, and new enrollments.
* **BuddyPress:** activity updates, friendships, group joins, profile updates and private messages.
* **bbPress:** new topics, replies, and resolved or favourited topics.
* **GemBoards:** new boards and cards, completed and moved cards, and card comments.
* **GameEngine:** unlocked achievements, so one reward can lead to the next.

= Shortcodes =

* `[gameengine_profile]` – a member dashboard with points, achievements, levels and a progress map.
* `[gameengine_points]` – the signed-in member's points balance.
* `[gameengine_level]` – progress to the next level, and every level with its status.
* `[gameengine_achievements]` – every achievement, earned and still locked.
* `[gameengine_leaderboard]` – the top members, for the time range and point type you choose.
* `[gameengine_progress_map]` – the member's path through levels and achievements.
* `[gameengine_rewards]` – the rewards catalog, with a Redeem button on each reward.
* `[gameengine_restrict]` – content that unlocks at a points total, an achievement or a level.

The Shortcodes tab under Tools lists every option with an example.

= Perfect for =

* **Online courses and LMS sites:** reward course, lesson and quiz completion to keep students motivated.
* **Membership and community sites:** recognise active members with badges, levels and leaderboards.
* **Online stores:** encourage repeat purchases and reviews, and let customers redeem points for rewards.
* **Blogs and publishers:** turn comments, visits and contributions into a friendly competition.

= GameEngine Pro =

GameEngine Pro is a separate plugin that adds leaderboard seasons, a spin-the-wheel game, referrals and affiliates, a points wallet with withdrawals, paying with points in WooCommerce and StoreEngine, a coupon marketplace, points transfers and expiry, analytics and webhooks. Everything in GameEngine keeps working without it. Learn more at [gameengine.pro](https://gameengine.pro/).

== External services ==

GameEngine does not connect to any external service. It makes no HTTP requests, loads no remote fonts, scripts, stylesheets or images, and sends no data about you, your site or your visitors anywhere.

The only external addresses in the plugin are ordinary links in the admin screens: the documentation site gameengine.pro, linked from the "?" buttons beside each shortcode, the Add-ons screen and the "Get Pro" menu item, and the author's site kodezen.com, linked from the plugin header. Nothing is requested from either address unless you click one of those links. Both sites are operated by Kodezen Limited: see their [terms of service](https://kodezen.com/terms/) and [privacy policy](https://kodezen.com/privacy-policy/).

== Installation ==

= From your WordPress dashboard =

1. Go to **Plugins → Add New Plugin** and search for **GameEngine**.
2. Click **Install Now**, then **Activate**.
3. Follow the setup wizard to pick a preset, or open **GameEngine** in the admin menu to build your own points system.

= Manual installation =

1. Upload the `gameengine` folder to the `/wp-content/plugins/` directory.
2. Activate **GameEngine** from the **Plugins** screen.
3. Open **GameEngine** in the admin menu to get started.

= After activation =

1. Create a point type and add rules that award points for the actions you want to encourage.
2. Add achievements and levels, and design their badges in the Badge Editor.
3. Turn on integrations and add-ons from the **Add-ons** screen.
4. Add `[gameengine_profile]` or `[gameengine_leaderboard]` to any page to show members their progress.

== Frequently Asked Questions ==

= What is a gamification plugin? =

A gamification plugin adds game mechanics such as points, badges, levels and leaderboards to your website. Members earn rewards for the actions you want to encourage, which keeps them engaged and coming back.

= Is GameEngine free? =

Yes. GameEngine is free, and none of its features are limited by a license key, a trial or a usage limit. GameEngine Pro is an optional, separate plugin with more advanced features.

= What can members earn points for? =

Out of the box: registering, logging in, daily visits, publishing posts and pages, commenting and more. Integrations add triggers such as completing a course, passing a quiz, placing an order or joining a group. Academy LMS, Tutor LMS, WooCommerce and StoreEngine are switched on from the Add-ons screen; the other integrations add their triggers whenever their plugin is active.

= Does GameEngine work with WooCommerce? =

Yes. Turn on the WooCommerce add-on, and members can earn points for purchases, for buying specific products and for writing product reviews, and a rule can take points back when an order is refunded. You can also sell points by linking a product to a points amount under Settings → Buy Points. StoreEngine stores get the same kind of triggers through the StoreEngine add-on.

= Does GameEngine work with LearnDash, LifterLMS, Tutor LMS or Academy LMS? =

Yes. Reward completed courses, lessons, topics and quizzes, assignments and new enrollments, depending on what each LMS supports. The Restrict Content add-on can also lock the description on Academy LMS course pages.

= Can I create my own badges? =

Yes. The Badge Editor lets you design a badge with a shape, colours and an icon or your own image, with a live preview, and attach it to an achievement.

= How do I show points, badges and leaderboards to members? =

Add a GameEngine shortcode to any page or post. `[gameengine_profile]` shows a complete member dashboard, and the Shortcodes tab under Tools lists every shortcode with its options and an example.

= Can I restrict content by points, level or achievement? =

Yes. Turn on the Restrict Content add-on, then lock a whole post or page from the GameEngine Content Restriction box in its editor, or wrap any part of a page in `[gameengine_restrict]`.

= Will GameEngine slow down my site? =

GameEngine loads its stylesheet and scripts only on pages that show GameEngine content, so the rest of your site is not affected.

= Is GameEngine translation-ready? =

Yes. The admin screens, the setup wizard and every front-end string can be translated, and right-to-left languages are supported.

= Does GameEngine send any data to external servers? =

No. GameEngine makes no external requests and sends no data off your site. See the "External services" section for the links that appear in the admin screens.

= Does deleting GameEngine remove my data? =

Only if you ask it to. By default, deleting the plugin leaves every point type, achievement, level and log in place, so reinstalling loses nothing. To remove it all when the plugin is deleted, turn on "Delete all data when GameEngine is deleted" in GameEngine's Settings. That removes GameEngine Pro's data as well, but not the WooCommerce coupons Pro has issued to members, which keep working.

= Can developers extend GameEngine? =

Yes. Integrations, add-on cards, admin menu entries and trigger fields are all registered through filters, so another plugin can add its own without modifying this one. On the PHP side see `gameengine_integrations`, `gameengine_addons_list`, `gameengine_addon_slugs`, `gameengine_trigger_schema_fields`, `gameengine_settings_data` and `gameengine/admin_menu_list`. In the admin app, `gameengine.settings.tabs`, `gameengine.addons.cards`, `gameengine.adminMenu.items` and `gameengine.tools.shortcodes` are available through `wp.hooks`.

= Is GameEngine open source? =

Yes. GameEngine is free software licensed under the GPL, and its complete source code is developed in public on GitHub at https://github.com/imrantushar/gameengine.

== Changelog ==

= 1.4.0 - 2026-09-13 =
* Added - An activity bell and an Activity screen listing the points, achievement and level-up notifications sent to members, paged, searchable and filterable by type. The screen starts empty after the update, and holds only notification types that are turned on, for as long as notifications are kept.
* Added - A Rewards Store add-on. Members spend their points on rewards you set up, with optional stock and per-member limits, through the `[gameengine_rewards]` shortcode.
* Added - A Badge Editor for designing badges — shape, colours and an icon or uploaded image — with a live preview, and a badge choice on each achievement. `[gameengine_achievements]` shows a badge's icon or image, not its shape or colours.
* Added - Streak options on points awards: count the consecutive days or weeks a trigger awards a member points, and pay bonus points each time the streak reaches a multiple of the milestone.
* Added - A level's built-in icon can be given a colour, which also colours the level's name in `[gameengine_profile]`.
* Added - A level can count all point types, and is then reached from a member's total across every point type.
* Added - Integrations with LearnDash, LifterLMS, BuddyPress, bbPress and GemBoards.
* Added - An "Assignment Submitted" trigger for Academy LMS, which fires when a student submits an assignment, independent of the existing "Assignment Evaluated" trigger. With GameEngine Pro it can include or exclude course categories.
* Added - The Restrict Content add-on's points, achievement and level lock now also covers Academy course landing pages. It restricts the course description, not enrollment, and the admin screen says so.
* Added - An Export / Import tab under Tools. It exports achievements, levels, point types, members' points history, achievements and levels, and the logs as CSV or JSON, and imports achievements, levels and point types. Award rules are not included.
* Added - CSV export of the dashboard's top members and of the logs.
* Added - A dark mode for the admin screens.
* Added - Notifications and Buy Points tabs in Settings, and an Available Hooks tab under Tools.
* Added - Share links on the achievements members have earned in `[gameengine_achievements]`, on by default, with a switch in Settings.
* Added - With GameEngine Pro's Leaderboard Seasons, an achievement can be limited to a season.
* Added - A "Delete all data when GameEngine is deleted" setting, off by default. When it is on, deleting the plugin removes GameEngine's tables, options, badges and meta, and GameEngine Pro's.
* Changed - Every bundle and stylesheet in `assets/build/` begins with a comment naming its source file, and the plugin zip now contains only the files WordPress runs. The complete source code and build setup are public at https://github.com/imrantushar/gameengine.
* Changed - The `[gameengine_leaderboard]` shortcode now subtracts deductions, matching the admin leaderboard, so a member's total there can be lower than before. Both rank members with the same query.
* Changed - The Shortcodes tab under Tools lists every shortcode, including `[gameengine_leaderboard]`, with its attributes and an example.
* Changed - A level's logo can be one of the built-in icons as well as an image from the Media Library.
* Fixed - Deduction rules took away no points. Any you have set up start deducting after this update.
* Fixed - The daily inactivity check stopped with a fatal error at the first inactive member it found.
* Fixed - Saving a level erased its plural name and its priority.
* Fixed - The list of user roles in trigger options failed to load.
* Fixed - A hook dragged into a rule always landed at the end, and hooks could not be reordered.
* Fixed - Integration tabs read "Gameengine" and "Wordpress".
* Fixed - The rich-text editors logged errors on every load for editor modules that were never installed.
* Fixed - The setup wizard's first screen showed no icons on its two options and described the plugin as an e-commerce platform.
* Fixed - Switching an add-on off announced "successfully Deactivate".
* Fixed - The admin screens and setup wizard could not be translated: the string extractor WordPress.org uses cannot read the admin bundle, the setup wizard never loaded its translations, and nine strings were filed under other plugins' text domains. `assets/build/i18n-strings.js` now lists the strings in a form the extractor can read, and `npm run makepot` regenerates it with the translation template.
* Fixed - Deactivating the plugin left some of its scheduled events running.
* Fixed - Unlocked `[gameengine_restrict]` content sat outside the content column on block themes.
* Fixed - Changing a member's points on their user profile, and the `{points_balance}` email tag, used point type #1 even on sites without it.

= 1.3.2 - 2026-08-28 =
* Fixed - Data did not load on sites using plain permalinks. The REST root is `index.php?rest_route=/` there, so a request that carried its own query string produced a second `?` and came back as "no route was found". Query strings are now joined correctly whatever the permalink setting.
* Fixed - The Achievement Types and Level Types screens requested the pre-1.3.0 taxonomy names and returned nothing.
* Fixed - The "nothing here yet, import some defaults?" prompt flashed on the Points, Achievements and Levels screens before their data had loaded. It now waits for the list to come back.
* Fixed - Trashing a point system from its row menu wiped its name, plural name and award/deduct actions. The update endpoint wrote every column on every request, so a change that carried only a status blanked the rest. Damaged point systems have their name restored from their slug on upgrade.
* Added - A Trash tab on the Points, Achievements and Levels screens. Trashed items were unreachable before, so they could be neither restored nor deleted for good.
* Fixed - Row actions did not change when switching tabs, so the trash view still offered "Trash" instead of "Delete". The list table was rendering the actions it was given on first load.
* Fixed - A trashed item stayed in the list until the page was reloaded.
* Fixed - Lists could serve stale results for up to a minute after an edit or delete on sites with a persistent object cache. The cached lists are keyed per query, and the code cleared a key that was never written.
* Fixed - `gameengine_add_points()`, `gameengine_deduct_points()` and `gameengine_get_total_points()` referenced a class that does not exist, so calling any of them was a fatal error.
* Fixed - The plugin's four global functions are now declared behind `function_exists()`, so a name already taken by other code no longer causes a fatal error on load.
* Changed - Generated assets are now named after the source file they are built from (`assets/build/backend.js` from `dev_gameengine/backend.js`, and so on) instead of carrying the plugin version. Cache busting uses the build's content hash, which the plugin already passed to WordPress.
* Changed - The PostCSS configuration is now `postcss.config.js`.
* Changed - The readme spells out which source file produces each generated file, and documents the two addresses the admin screens link to.
* Fixed - Saving a level or an achievement without every optional field filled in raised PHP warnings with WP_DEBUG on.
* Removed - The "Pretty Permalinks are required for the REST API" warnings. The REST API works on plain permalinks, so there was nothing to warn about.
* Changed - Screens can now be registered by another plugin (`gameengine.dashboard.routes`), with `injectReducer` for their state.

= 1.3.0 - 2026-08-26 =
* Added - Extension points so a separate plugin can register its own settings tabs, add-on cards, admin menu entries, trigger fields and shortcodes.
* Changed - The Add-ons and Settings screens now list only the features this plugin ships. All placeholder and disabled controls have been removed.
* Changed - The achievement and level type taxonomies are now registered as `gameengine_achievement_type` and `gameengine_level_type`. Existing types are moved to the new names automatically on upgrade.
* Changed - The admin menu is now registered below the core content items instead of alongside them.
* Changed - Admin menu styles, level shortcode styles and the content restriction script are now enqueued instead of printed inline.
* Changed - Trigger fields are now read from the live registry instead of a generated manifest, so the options shown always match the code that acts on them.
* Removed - The generated `assets/json/integrations.json` manifest and the development-only tooling that produced it.
* Changed - The uncompiled sources and the build configuration now ship with the plugin.
* Fixed - The content restriction meta box no longer depends on jQuery.
* Security - The taxonomy endpoint now only accepts this plugin's own taxonomies.

= 1.2.0 - 2026-06-14 =
* Changed - Removed the licensing and self-update SDK. Updates for this plugin are delivered by WordPress.org.
* Changed - Fonts are now served from the visitor's system instead of a third-party CDN. The plugin makes no external requests.
* Fixed - Scheduled events are now cleared when the plugin is deactivated.
* Fixed - The integration manifest is no longer rewritten inside the plugin folder on every admin page load.
* Improved - Refreshed the admin screens, including add-ons, breadcrumbs, empty states and icons, and the setup wizard.
* Fixed - Button states for unsaved changes and disabled actions.

= 1.1.2 - 2026-05-06 =
* Improved - Rebuilt the admin interface on Tailwind CSS, replacing Chakra UI.
* Improved - Refreshed the complete admin interface.

= 1.1.1 - 2026-04-23 =
* Added - License management for GameEngine Pro (now provided by the Pro add-on itself).

= 1.1.0 - 2026-04-20 =
* Added - Tutor LMS integration, with Course Completed, Course Published (Instructor), Lesson Completed, Quiz Attempt Ended, Quiz Passed, Assignment Submitted and New Enrollment triggers.
* Added - Rules can target specific courses, lessons, quizzes and assignments.

= 1.0.0 - 2026-01-20 =
* Initial release.
* Fixed - Coding standards and security issues for the WordPress.org submission.

== Upgrade Notice ==

= 1.4.0 =
Adds an Activity screen, a Rewards Store, a Badge Editor, streaks and five integrations, and makes the admin translatable. Deduction rules now take points away, and levels saved without a point type now count every point type: review both before updating.

= 1.3.2 =
Fixes data not loading on sites that use plain permalinks.

= 1.3.0 =
Achievement and level types now use prefixed taxonomy names. Existing types are moved over automatically when you upgrade.
