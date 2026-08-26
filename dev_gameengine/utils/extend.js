import * as formik from 'formik';
import * as reactRedux from 'react-redux';
import { applyFilters } from '@wordpress/hooks';
import { store } from '@GFRedux/store';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';

/**
 * Extension points for the GameEngine admin app.
 *
 * This plugin only ever builds the screens for the features it ships itself.
 * Anything else — additional settings tabs, addon cards, menu entries or
 * shortcodes — is contributed by a separate plugin through these filters, so
 * no screen here is ever rendered in a disabled or placeholder state.
 *
 * Extensions enqueue their own script with `gameengine-admin-script` as a
 * dependency and register before the app mounts, for example:
 *
 *   wp.hooks.addFilter(
 *       'gameengine.settings.tabs',
 *       'my-plugin/settings',
 *       ( tabs ) => [ ...tabs, myTab ]
 *   );
 */

/**
 * Settings screen tabs.
 *
 * A tab is `{ key, label, desc, icon, saveKey, render }` where `render` is a
 * function returning the element for the tab body and `saveKey` names the
 * branch of the settings payload the tab writes to (omit for tabs that submit
 * on their own).
 *
 * @param {Array} tabs Tabs contributed by this plugin.
 * @return {Array} The full tab list.
 */
export const getSettingsTabs = (tabs) =>
	applyFilters('gameengine.settings.tabs', tabs);

/**
 * Addon cards shown on the Addons screen.
 *
 * @param {Array} addons Addon cards contributed by this plugin.
 * @return {Array} The full addon list.
 */
export const getAddonCards = (addons) =>
	applyFilters('gameengine.addons.cards', addons);

/**
 * Extra entries appended to the plugin's admin menu.
 *
 * @param {Array} items Menu entries contributed by this plugin.
 * @return {Array} The full entry list.
 */
export const getAdminMenuItems = (items) =>
	applyFilters('gameengine.adminMenu.items', items);

/**
 * Shortcodes listed on the Tools screen.
 *
 * @param {Array} shortcodes Shortcodes contributed by this plugin.
 * @return {Array} The full shortcode list.
 */
export const getShortcodes = (shortcodes) =>
	applyFilters('gameengine.tools.shortcodes', shortcodes);

/**
 * Notices rendered at the top of every admin screen.
 *
 * @param {Array} notices Components contributed by this plugin.
 * @return {Array} The full notice list.
 */
export const getDashboardNotices = (notices) =>
	applyFilters('gameengine.dashboard.notices', notices);

/**
 * Show a notice in the app's notification area.
 *
 * Exposed so an extension's own bundle can surface a message without needing
 * a copy of the store.
 *
 * @param {string} message Message to display.
 * @param {string} type    'success', 'error' or 'warning'.
 */
export const notify = (message, type = 'success') => {
	store.dispatch(showNotification({ message, isShow: true, type }));
};

/**
 * Published for extensions loaded from their own bundle.
 *
 * `formik` and `react-redux` are shared rather than re-bundled, so a screen
 * contributed by another plugin reads the same form and store context as the
 * screen hosting it.
 */
window.gameengine = window.gameengine || {};
window.gameengine.notify = notify;
window.gameengine.formik = formik;
window.gameengine.reactRedux = reactRedux;
