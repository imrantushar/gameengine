import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'gameengine-theme-mode';
const THEME_CHANGE_EVENT = 'gameengine-theme-change';
const DEFAULT_MODE = 'light';

function readStoredMode() {
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		return stored === 'dark' || stored === 'light' ? stored : null;
	} catch (e) {
		return null;
	}
}

/**
 * Currently active mode, falling back to the default when nothing is stored
 * yet (no `prefers-color-scheme` fallback — the admin's default is light, and
 * wp-admin's own chrome around it is light regardless).
 */
export function getActiveMode() {
	return readStoredMode() || DEFAULT_MODE;
}

/**
 * Stamp `data-theme` on <html> (and on the app root, so the scope still holds
 * if the app is ever mounted outside the document element), persist the
 * choice, and notify every other mounted hook through a window event — no
 * context/provider needed, since the source of truth is the DOM plus this
 * event.
 */
export function applyThemeMode(mode) {
	const normalized = mode === 'dark' ? 'dark' : 'light';

	document.documentElement.setAttribute('data-theme', normalized);

	const appRoot = document.getElementById('gameengine-admin-app');
	if (appRoot) {
		appRoot.setAttribute('data-theme', normalized);
	}

	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
	} catch (e) {
		// Storage unavailable (private mode, quota) — the mode still applies
		// for this page load, it just will not be remembered.
	}

	window.dispatchEvent(
		new CustomEvent(THEME_CHANGE_EVENT, { detail: normalized })
	);

	return normalized;
}

/**
 * Apply the stored/default mode. Call this synchronously as early as possible
 * — before React paints — so the admin never flashes the wrong theme.
 */
export function initThemeMode() {
	applyThemeMode(getActiveMode());
}

export function toggleThemeMode() {
	return applyThemeMode(getActiveMode() === 'dark' ? 'light' : 'dark');
}

/**
 * React hook: seeds from the current mode and re-renders whenever the mode
 * changes anywhere — this component's own toggle or another one.
 */
export function useThemeMode() {
	const [mode, setModeState] = useState(getActiveMode());

	useEffect(() => {
		const onChange = (event) => setModeState(event.detail);
		window.addEventListener(THEME_CHANGE_EVENT, onChange);
		return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
	}, []);

	return {
		mode,
		isDark: mode === 'dark',
		toggle: toggleThemeMode,
		setMode: applyThemeMode,
	};
}
