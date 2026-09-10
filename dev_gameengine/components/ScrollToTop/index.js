import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * The URL params that mean "a different screen", as opposed to a different
 * view of the screen you are already on.
 *
 * - `page`   — the sidebar item. Always a new screen.
 * - `path`   — the sidebar's sub-items (Levels → All Levels / Types, and the
 *              point-system editor). Note this param is overloaded: the Tools
 *              screen also uses it for its own left rail, so switching Tools
 *              panels counts as a screen change here. That rail swaps the
 *              whole panel anyway, so the behaviour reads correctly.
 * - `action` /
 *   `id`     — entering or leaving a record: a list swapping for an editor, or
 *              an editor closing back to its list.
 *
 * `tab` deliberately does NOT qualify. It is the Settings tab rail, which
 * swaps a panel beside a nav that is already at the top of the page — moving
 * between Log and Email Templates is not navigation between screens.
 * Neither do list filters, sorting or pagination.
 */
const SCREEN_PARAMS = ['page', 'path', 'action', 'id'];

const screenKeyOf = (search) => {
	const params = new URLSearchParams(search);
	return SCREEN_PARAMS.map((key) => params.get(key) || '').join('|');
};

/**
 * Send the viewport back to the top when the user moves to another screen.
 *
 * The admin is a single React root mounted on one WP page, so every move
 * between screens is a client-side route change — the browser never reloads
 * and keeps whatever scroll offset the previous screen was left at. Scroll to
 * the bottom of a long Levels list, click another sidebar item, and the next
 * screen opens halfway down.
 *
 * Three things have to be true before we scroll:
 *
 * - The navigation is a PUSH. REPLACE is how screens sync state into the URL
 *   without navigating (a tab normalising a missing param, a table writing
 *   back its page number) and must not yank the page while someone is
 *   reading. POP is back/forward, where the browser restores the offset it
 *   recorded, which is already correct.
 * - The screen actually changed — see SCREEN_PARAMS. Without this every
 *   in-page tab counts as navigation, because tab rails push too.
 * - There is no hash. `#section` means a specific position was asked for.
 */
export default function ScrollToTop() {
	const { pathname, search, hash } = useLocation();
	const navigationType = useNavigationType();

	const screenKey = pathname + '?' + screenKeyOf(search);
	const previousScreen = useRef(screenKey);

	useEffect(() => {
		const movedScreen = previousScreen.current !== screenKey;
		// Recorded before the guards, so an in-page tab change still updates
		// the baseline and cannot leave a stale key behind to fire on later.
		previousScreen.current = screenKey;

		if (!movedScreen || navigationType !== 'PUSH' || hash) {
			return;
		}

		// WP admin scrolls the document, not a nested container. `instant`
		// rather than `smooth`: this runs as the new screen paints, and
		// animating the old screen's offset away is a jump with extra steps.
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
	}, [screenKey, hash, navigationType]);

	return null;
}
