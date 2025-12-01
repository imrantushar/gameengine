import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

// export const {
// 	// plugin_root_url,
// 	// nonce,
// 	// ajaxurl,
// 	// menu,
// 	// route_path,
// 	// rest_url,
// 	// admin_url,
// 	// namespace,
// 	// gamify_nonce,
// 	// user_id,
// 	// _quiz_settings,
// 	// is_plain_permalink,
// } = window?.GamifyGlobal;

// export const isPlainPermalink = Boolean(is_plain_permalink);
// export const userId = Boolean(user_id);
// export const API = axios.create({
// 	baseURL: rest_url,
// 	headers: {
// 		'content-type': 'application/json',
// 		'X-WP-Nonce': nonce,
// 		'Cache-Control': 'no-cache', // Prevent caching
// 	},
// });
export const reactDebounce = (callback, wait) => {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			callback.apply(this, args);
		}, wait);
	};
};
export const useQuery = () => {
	return new URLSearchParams(window.location.search);
};