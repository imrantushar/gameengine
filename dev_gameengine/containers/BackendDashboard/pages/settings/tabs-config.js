import React from 'react';
import { __ } from '@wordpress/i18n';
import { logIcon, mail } from '@GFUtils/icons';
import { getSettingsTabs } from '@GFUtils/extend';
import GeneralSettings from './Tabs/GeneralSettings';
import EmailTemplates from './Tabs/EmailTemplates';

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
