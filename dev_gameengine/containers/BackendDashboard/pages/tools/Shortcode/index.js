import React from 'react';
import ShortCodeItem from './ShortCodeItem';
import { __ } from '@wordpress/i18n';
// import { is_pro } from '@GFUtils/helper';
import { Box } from '@chakra-ui/react';
import { isPro } from '@GFUtils/helper';

// const proShortCode = is_pro
// 	? [
// 			{
// 				title: __('Certificate Verification', 'academy'),
// 				shortCode: '[academy_pro_certificate_verification]',
// 				description: `[academy_pro_certificate_verification]`,
// 				url: 'https://academylms.net/Docs/how-to-use-the-certificate-verification-shortcode/',
// 			},
// 		]
// 	: [];

const shortCodeData = [
	// {
	// 	title: __('Achievements', 'academy'),
	// 	shortCode: '[gameengine_achievements]',
	// 	description: `[gameengine_achievements]`,
	// 	url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
	// },
	{
		title: __('Highest Level', 'gameengine'),
		shortCode: '[gameengine_level]',
		subtitle: __('Shows the users current highest level title with a trophy icon.', 'gameengine'),
		description: __('Great for user profile headers or bio sections.', 'gameengine'),
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
		isPro: false,
	},
	{
		title: __('Points Balance', 'gameengine'),
		shortCode: '[gameengine_points]',
		subtitle: __('Ideal for menus, headers, or sidebar widgets.', 'gameengine'),
		description: __('Displays the current users point total with a coin icon.', 'gameengine'),
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
		isPro: false,
	},
	{
		title: __('Profile', 'academy'),
		shortCode: '[gameengine_profile]',
		subtitle: __(
			'Displays the full modern gamification dashboard (Tabs, Progress Map, Badges).',
			'gameengine'
		),
		description: __(
			'Paste on a page where you want users to manage their progress.',
			'gameengine'
		),
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
		isPro: false,
	},
	{
		title: __('Progress Map', 'academy'),
		shortCode: '[gameengine_progress_map]',
		subtitle: __(
			'Shows only the visual zig-zag roadmap of levels and achievements.',
			'gameengine'
		),
		description: __(
			'Use this if you want to show the map without the full dashboard.',
			'gameengine'
		),
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
		isPro: false,
	},
	{
		title: __('Content Restriction', 'academy'),
		shortCode: '[gameengine_restrict type="points" value="50"]',
		subtitle: __(
			'Lock specific parts of your content (text, images, links) based on user points, badges, or levels.',
			'gameengine'
		),
		description: __('Accepts: points, achievement, level, Number (e.g. 100 for points, or ID for badge/level), Optional: Custom message shown to locked users', 'gameengine'),
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
		isPro: false,
	},
	{
		title: __('Marketplace', 'academy'),
		shortCode: '[gameengine_marketplace]',
		subtitle: __(
			'Lock specific parts of your content (text, images, links) based on user points, badges, or levels.',
			'gameengine'
		),
		description: __('Accepts: points, achievement, level, Number (e.g. 100 for points, or ID for badge/level), Optional: Custom message shown to locked users', 'gameengine'),
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
		isPro: !isPro,
	},
];

const ShortCode = () => {
	return (
		<Box className="academy-tools-page__short-code">
			{shortCodeData.map((item, index) => (
				<ShortCodeItem shortCodeItem={item} key={index} />
			))}
		</Box>
	);
};

export default ShortCode;