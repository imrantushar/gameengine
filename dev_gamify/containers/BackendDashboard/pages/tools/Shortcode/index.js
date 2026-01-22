import React from 'react';
import ShortCodeItem from './ShortCodeItem';
import { __ } from '@wordpress/i18n';
// import { is_pro } from '@GFUtils/helper';
import { Box } from '@chakra-ui/react';

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
		title: __('Achievements', 'academy'),
		shortCode: '[gamify_achievements]',
		description: `[gamify_achievements]`,
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
	},
	{
		title: __('Levels', 'academy'),
		shortCode: '[gamify_level]',
		description: `[gamify_points]`,
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
	},
	{
		title: __('Points', 'academy'),
		shortCode: '[gamify_points]',
		description: `[gamify_points]`,
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
	},
	{
		title: __('Profile', 'academy'),
		shortCode: '[gamify_profile]',
		description: `[gamify_profile]`,
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
	},
	{
		title: __('Progress Map', 'academy'),
		shortCode: '[gamify_progress_map]',
		description: `[academy_course_search]`,
		url: 'https://academylms.net/docs/how-to-use-academy-lms-search-shortcode/',
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
