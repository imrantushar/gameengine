import React from 'react';
import ShortCodeItem from './ShortCodeItem';
import { __ } from '@wordpress/i18n';
import { Box } from '@chakra-ui/react';
import { is_pro } from '@GFUtils/helper';

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
	{
		title: __('Highest Level', 'gameengine'),
		shortCode: '[gameengine_level]',
		subtitle: __('Displays the current users highest achieved level rank with a trophy icon.', 'gameengine'),
		description: __('Perfect for user headers, bio sections, or profile sidebar widgets.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: false,
	},
	{
		title: __('Points Balance', 'gameengine'),
		shortCode: '[gameengine_points]',
		subtitle: __('Shows the current users total points balance with a coin icon.', 'gameengine'),
		description: __('Ideal for menus, headers, or any place where you want to show the users wallet balance.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: false,
	},
	{
		title: __('Achievements List', 'gameengine'),
		shortCode: '[gameengine_achievements]',
		subtitle: __('Displays a clean grid of all achievements earned by the user.', 'gameengine'),
		description: __('Shows badge images, titles, and unlock hints for any locked achievements.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: false,
	},
	{
		title: __('Profile Dashboard', 'gameengine'),
		shortCode: '[gameengine_profile]',
		subtitle: __('Displays the full modern gamification dashboard with Tabs and Progress Map.', 'gameengine'),
		description: __('A complete hub where users can see their points, badges, and roadmap in one place.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: false,
	},
	{
		title: __('Progress Map', 'gameengine'),
		shortCode: '[gameengine_progress_map]',
		subtitle: __('Shows a visual zig-zag roadmap of levels and achievements progression.', 'gameengine'),
		description: __('Provides an interactive journey timeline without the full dashboard layout.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: false,
	},
	{
		title: __('Content Restriction', 'gameengine'),
		shortCode: '[gameengine_restrict type="points" value="50"]',
		subtitle: __('Lock specific text, images, or links based on points, badges, or levels.', 'gameengine'),
		description: __('Usage: type (points/achievement/level), value (amount or ID), and optional custom message.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: false,
	},
	{
		title: __('Coupon Marketplace', 'gameengine'),
		shortCode: '[gameengine_marketplace]',
		subtitle: __('Allows users to exchange their points for real WooCommerce discount coupons.', 'gameengine'),
		description: __('Renders the dynamic reward store with offers set in your admin settings.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: is_pro === "1" ? false : true,
	},
	{
		title: __('Payout Form', 'gameengine'),
		shortCode: '[gameengine_payout]',
		subtitle: __('Displays a secure withdrawal request form for converting points into currency.', 'gameengine'),
		description: __('Users can select payout methods like bKash or PayPal and provide their account details.', 'gameengine'),
		url: 'https://gameengine.pro/docs/shortcodes/',
		isPro: is_pro === "1" ? false : true,
	},
]

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