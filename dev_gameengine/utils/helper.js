import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';

export const {
	plugin_root_url,
	nonce,
	ajaxurl,
	menu,
	addons,
	route_path,
	rest_url,
	admin_url,
	namespace,
	gameengine_nonce,
	user_id,
	is_plain_permalink,
	is_pro,
	is_woocommerce_active,
	is_academylms_active,
	banners,
	site_url,
	notification_position = null,
	toplevel_menu_icon_url = null
} = window?.GameEngineGlobal;

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
	return new URLSearchParams(useLocation().search);
};

export const handleSliceError = (thunkAPI, error) => {
	thunkAPI.dispatch(
		showNotification({
			message:
				error?.response.data.message ??
				error?.response?.message ??
				error?.message,
			isShow: true,
			type: 'error',
		})
	);
	// }
	return thunkAPI.rejectWithValue(error.message);
};


export const handleSliceSuccess = (thunkAPI, message) => {
	thunkAPI.dispatch(
		showNotification({
			message: __(message, 'gameengine'),
			isShow: true,
			type: 'success',
		})
	);
};

export const generateSlug = (value) => {
	return value
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
};

export const sliceString = (text, length = 20, more = '...') => {
	if (!text || text.length < length) {
		return text;
	}

	return text.slice(0, length).replace(/(^[\s]+|[\s]+$)/g, '') + more;
};

export const getAddonActiveStatus = (allAddons, addonName, isPro = false) => {
	// if pro is inactive
	if (isPro && !is_pro) {
		return false;
	}
	if (allAddons[addonName]) {
		return allAddons[addonName] === true;
	}
	return false;
};

export const API = axios.create({
	baseURL: rest_url,
	headers: {
		'content-type': 'application/json',
		'X-WP-Nonce': nonce,
		'Cache-Control': 'no-cache', // Prevent caching
	},
});
export const makeRequest = async (
	action,
	payload = {},
	isRaw = false,
	suffix = ''
) => {
	let form_data = new FormData(); // eslint-disable-line
	form_data.append('action', `gameengine${suffix}/${action}`);
	if (!payload.security) {
		form_data.append('security', gameengine_nonce);
	}
	Object.entries(payload).forEach(([key, value]) => {
		if (!isRaw && typeof value === 'object' && value !== null) {
			form_data.append(key, JSON.stringify(value));
		} else {
			form_data.append(key, value);
		}
	});
	const response = await axios.post(ajaxurl, form_data);
	const {
		data: { success, data },
	} = response;

	if (!success) {
		processAjaxError(data, response);
	}

	return data;
};

export const statusArray = [
	{
		label: __('Publish', 'academy'),
		value: 'publish',
	},
	{
		label: __('Draft', 'academy'),
		value: 'draft',
	},
	{
		label: __('Pending', 'academy'),
		value: 'pending',
	},
	// {
	// 	label: __('Private', 'academy'),
	// 	value: 'private',
	// },
	// {
	// 	label: __('Schedule', 'academy'),
	// 	value: 'future',
	// },
	{
		label: __('Trash', 'academy'),
		value: 'trash',
	},
];

export const tableStatusArray = [
	{
		label: __('All', 'academy'),
		value: 'all',
	},
	...statusArray
];

export function decodeHtmlEntity(entity) {
	const txt = document.createElement('textarea');
	txt.innerHTML = entity;
	return txt.value;
}