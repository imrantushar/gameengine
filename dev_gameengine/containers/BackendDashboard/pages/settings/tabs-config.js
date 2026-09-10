import React from 'react';
import { __ } from '@wordpress/i18n';
import { general, logIcon, mail } from '@GFUtils/icons';
import { getSettingsTabs } from '@GFUtils/extend';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailTemplates from './Tabs/EmailTemplates';
import NotificationsSettings from './Tabs/NotificationsSettings';
import BuyPointsSettings from './Tabs/BuyPointsSettings';
import ProEmailSettings from './Tabs/ProEmailSettings';
import ProTransferSettings from './Tabs/ProTransferSettings';
import ProExpirySettings from './Tabs/ProExpirySettings';

/**
 * Tabs for the settings this plugin stores itself.
 *
 * `saveKey` names the branch of the settings payload the tab writes to. A tab
 * that submits on its own leaves it undefined and receives the form helpers.
 */
const ownTabs = [
	{
		key: 'log',
		label: __('Log', 'gameengine'),
		desc: __('Log settings', 'gameengine'),
		icon: logIcon(),
		saveKey: 'logs',
		render: () => <GeneralSettings />,
	},
	{
		key: 'email_templates',
		label: __('Email Templates', 'gameengine'),
		desc: __('Customize Email Templates & Cron', 'gameengine'),
		icon: mail(),
		saveKey: 'email_templates',
		selfSubmitting: true,
		render: (formProps) => <EmailTemplates {...formProps} />,
	},
	{
		key: 'notifications',
		label: __('Notifications', 'gameengine'),
		desc: __('Notification settings', 'gameengine'),
		icon: mail(),
		saveKey: 'notifications',
		render: () => <NotificationsSettings />,
	},
	{
		key: 'buy_points',
		label: __('Buy Points', 'gameengine'),
		desc: __('Buy Points settings', 'gameengine'),
		icon: general(),
		saveKey: 'buy_points',
		selfSubmitting: true,
		render: (formProps) => <BuyPointsSettings {...formProps} />,
	},
	{
		key: 'email_notifications',
		label: __('Email Notifications', 'gameengine'),
		desc: __('Email notification settings', 'gameengine'),
		icon: mail(),
		saveKey: 'email_notifications',
		render: () => <ProEmailSettings />,
	},
	{
		key: 'transfer',
		label: __('Transfer', 'gameengine'),
		desc: __('Point transfer settings', 'gameengine'),
		icon: general(),
		saveKey: 'transfer',
		render: () => <ProTransferSettings />,
	},
	{
		key: 'expiry',
		label: __('Expiry', 'gameengine'),
		desc: __('Point expiry settings', 'gameengine'),
		icon: general(),
		saveKey: 'expiry',
		render: () => <ProExpirySettings />,
	},
];

/**
 * The settings tabs to render, including any contributed by other plugins.
 *
 * @return {Array} Tab descriptors.
 */
export const getTabs = () => getSettingsTabs(ownTabs);

/**
 * Find a tab by its `tab` query-string key.
 *
 * @param {string} key Tab key.
 * @return {Object|undefined} The matching tab.
 */
export const findTab = (key) => getTabs().find((item) => item.key === key);

export const DEFAULT_TAB = 'log';
