=== GameEngine - Gamification for Website ===
Contributors: kodezen, academylms, tusharimran
Tags: gamification, points, achievements, ranks, rewards
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.3.1
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
*   **Integrations:** Award points for activity in WooCommerce, StoreEngine, Academy LMS and Tutor LMS.
*   **Add-ons:** Restrict Unlock, Progress Map and Content Restriction, all included and enabled from the Add-ons screen.
*   **Shortcodes:** Drop points balances, achievement lists, level roadmaps, progress maps and profile dashboards anywhere on your site.

Every feature listed above is included and fully functional. Nothing in this plugin is limited by a key, a trial, a quota or a time limit.

== External services ==

This plugin does not connect to any external service. It makes no HTTP requests to any third party, sends no data off your site, and loads no remote fonts, scripts, stylesheets or images. Everything it needs is bundled with the plugin and served from your own site.

The plugin's admin screens contain ordinary links to documentation on gameengine.pro and to kodezen.com. These are links a person can choose to click; nothing is requested from those sites unless the user opens them.

== Source code and build process ==

All of the plugin's source code ships inside this plugin. Nothing is obfuscated, and every compiled file can be regenerated from the sources included here.

The files under `assets/build/` are generated. Their sources are:

*   `dev_gameengine/` — the React source for the admin app, the setup wizard and the frontend script.
*   `assets/scss/` — the Sass source for the compiled stylesheets.

The build is driven by [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) with webpack, Tailwind CSS and PostCSS. The configuration ships alongside the sources: `webpack.config.js`, `tailwind.config.js`, `postcss.config.cjs`, `jsconfig.json` and `package.json` (with `package-lock.json` for an exact, reproducible dependency tree).

To rebuild the compiled assets from the included sources, run the following from the plugin directory with Node.js 18 or newer:

`npm install`
`npm run build`

That regenerates everything in `assets/build/`. Use `npm run start` for a watching development build.

The PHP dependency manifest is `composer.json`, with `composer.lock` pinning exact versions. Run `composer install` to install them.

== Installation ==

1.  Upload the `gameengine` folder to the `/wp-content/plugins/` directory.
2.  Activate the plugin through the 'Plugins' menu in WordPress.
3.  Go to the "GameEngine" menu in your WordPress admin dashboard to start.

== Frequently Asked Questions ==

= What kind of activities can I award points for? =

You can award points for actions like user registration, daily logins, publishing posts, and leaving comments. Activating an integration from the Add-ons screen adds triggers for that platform, such as completing a course or placing an order.

= Does the plugin send any data to an external server? =

No. The plugin makes no external requests at all. See the "External services" section above.

= Can I extend the plugin from my own code? =

Yes. Integrations, add-on cards, admin menu entries and trigger fields are all registered through filters, so another plugin can add its own without modifying this one. On the PHP side see `gameengine_integrations`, `gameengine_addons_list`, `gameengine_addon_slugs`, `gameengine_trigger_schema_fields`, `gameengine_settings_data` and `gameengine/admin_menu_list`. In the admin app, `gameengine.settings.tabs`, `gameengine.addons.cards`, `gameengine.adminMenu.items` and `gameengine.tools.shortcodes` are available through `wp.hooks`.

== Changelog ==

= 1.3.1 - 2026-08-28 =
* Fixed - Data did not load on sites using plain permalinks. The REST root is `index.php?rest_route=/` there, so a request that carried its own query string produced a second `?` and came back as "no route was found". Query strings are now joined correctly whatever the permalink setting.
* Fixed - The Achievement Types and Level Types screens requested the pre-1.3.0 taxonomy names and returned nothing.
* Fixed - The "nothing here yet, import some defaults?" prompt flashed on the Points, Achievements and Levels screens before their data had loaded. It now waits for the list to come back.
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
* Improved - Updated all the UI in admin dashboard(Addons, breadcrumbs, no data text, icons and more) and setup wizard..
* Fixed - All buttons dirty and disable issue fixed.

= 1.1.2 - 2026-05-06 =
* Improved - Chakra UI removed and migrated to tailwind.
* Improved - Complete UI updated.

= 1.1.1 - 2026-04-23 =
* Added - License management for GameEngine Pro (now provided by the Pro add-on itself).

= 1.1.0 - 2026-04-20 =
* Added Tutor LMS Integration.
* New Triggers: Course Completed, Course Published (Instructor), Lesson Completed, Quiz Attempt Ended, Quiz Passed, Assignment Submitted, and New Enrollment.
* Dynamic schema support for selection of specific Courses, Lessons, Quizzes, and Assignments.

= 1.0.0 - 2026-01-20 =
* Initial release of the GameEngine plugin.
* Fixed coding standards and security guidelines for WordPress.org submission.

== Upgrade Notice ==

= 1.3.1 =
Fixes data not loading on sites that use plain permalinks.

= 1.3.0 =
Achievement and level types now use prefixed taxonomy names. Existing types are moved over automatically when you upgrade.
