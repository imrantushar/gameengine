import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddonCard from './AddonCard';
import { Formik } from 'formik';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import { Box, Flex, Tabs } from '@chakra-ui/react';
import { fetchActiveAddons } from '../../../../redux/Slices/addonsSlice/addonsSlice';
import { academyLms, storeEngine, wooCommerce } from '@GFUtils/icons';

const infoCardsData = [
	{
		label: __('Academy LMS', 'gamify'),
		name: 'academylms',
		is_pro: false,
		is_active: true,
		is_coming_soon: false,
		details: __(
			'When users complete or pass a quiz.',
			'gamify'
		),
		required_plugin: [
			{
				plugin_dir_path: 'ablocks/ablocks.php',
				plugin_name: 'aBlocks',
			},
		],
		icon: academyLms(),
		docsUrl: 'https://quizpress.pro/docs/how-to-use-quizpress-certificate-builder/',
	},
	{
		label: __('StoreEngine', 'gamify'),
		name: 'storeengine',
		is_pro: false,
		is_active: false,
		is_coming_soon: true,
		details: __(
			'Sell certificates, quiz access, or digital products directly with StoreEngine integration.',
			'gamify'
		),
		required_plugin: [
			{
				plugin_dir_path: 'storeengine/storeengine.php',
				plugin_name: 'StoreEngine',
			},
		],
		icon: storeEngine(),
	},
	{
		label: __('WooCommerce', 'gamify'),
		name: 'woocommerce',
		is_pro: false,
		is_active: true,
		is_coming_soon: false,
		details: __(
			'Monetize quizzes effortlessly by selling them as WooCommerce products and bundles.',
			'gamify'
		),
		required_plugin: [
			{
				plugin_dir_path: 'woocommerce/woocommerce.php',
				plugin_name: 'WooCommerce',
			},
		],
		icon: wooCommerce(),
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
	},

	// ================= PRO + ACTIVE (NEW) =================
	// {
	// 	label: __('Advanced Analytics', 'gamify'),
	// 	name: 'advanced-analytics',
	// 	is_pro: true,
	// 	is_active: true,
	// 	is_coming_soon: false,
	// 	details: __(
	// 		'Get detailed insights into quiz performance with advanced reports and charts.',
	// 		'gamify'
	// 	),
	// 	required_plugin: false,
	// 	icon: (
	// 		<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
	// 			<path d="M3 3h18v18H3z" fill="#E0E7FF" />
	// 			<path d="M7 14h2v4H7zM11 10h2v8h-2zM15 6h2v12h-2z" fill="#4F46E5" />
	// 		</svg>
	// 	),
	// 	docsUrl: '#',
	// },

	// ================= PRO + INACTIVE (NEW) =================
	// {
	// 	label: __('Content Drip', 'gamify'),
	// 	name: 'content-drip',
	// 	is_pro: true,
	// 	is_active: false,
	// 	is_coming_soon: false,
	// 	details: __(
	// 		'Release quiz content gradually based on a scheduled timeline.',
	// 		'gamify'
	// 	),
	// 	required_plugin: false,
	// 	icon: (
	// 		<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
	// 			<path d="M12 2C7.5 2 4 5.5 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.5-3.5-8-8-8z" fill="#FDE68A" />
	// 		</svg>
	// 	),
	// 	docsUrl: '#',
	// },

	// // ================= PRO + COMING SOON (NEW) =================
	// {
	// 	label: __('White Label', 'gamify'),
	// 	name: 'white-label',
	// 	is_pro: true,
	// 	is_active: false,
	// 	is_coming_soon: true,
	// 	details: __(
	// 		'Fully rebrand QuizPress with your own logo, colors, and identity.',
	// 		'gamify'
	// 	),
	// 	required_plugin: false,
	// 	icon: (
	// 		<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
	// 			<path d="M4 4h16v16H4z" fill="#F3F4F6" />
	// 			<path d="M7 7h10v10H7z" fill="#9CA3AF" />
	// 		</svg>
	// 	),
	// 	docsUrl: '#',
	// },
];

const filterOptions = [
	{ slug: 'all', title: __('All', 'academy') },
	{ slug: 'active', title: __('Active', 'academy') },
	{ slug: 'inactive', title: __('Inactive', 'academy') },
	{ slug: 'free', title: __('Free', 'academy') },
	{ slug: 'pro', title: __('Pro', 'academy') },
];

const filterAddons = (addons, filter, activeAddons = {}) => {
	switch (filter) {
		case 'free':
			return addons.filter(item => !item.is_pro);

		case 'pro':
			return addons.filter(item => item.is_pro);

		case 'active':
			return addons.filter(item => activeAddons.includes(item.name));

		case 'inactive':
			return addons.filter(item => !activeAddons.includes(item.name));

		default:
			return addons;
	}
};

const RenderCards = ({ filter, values, setFieldValue, activeAddons }) => {
	const filteredAddons = filterAddons(
		infoCardsData,
		filter,
		activeAddons
	);

	if (!filteredAddons.length) {
		return <Box opacity={0.6}>{__('No add-ons found.', 'academy')}</Box>;
	}

	return (
		<Flex flexWrap="wrap" gap={6}>
			{filteredAddons.map((item, index) => (
				<AddonCard
					key={item.name}
					item={item}
					index={index}
					// value={values[item.name]}
					setFieldValue={setFieldValue}
				/>
			))}
		</Flex>
	);
};

const Addons = () => {
	const { activeAddons = [] } = useSelector(state => state.addons || {});
	const addonsSavedData = useSelector(state => state.addons || {});
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchActiveAddons());
	}, [dispatch]);

	return (
		<>
			<TopBar path={__("Addons", "gamify")} />

			<Box
				className="academy-page-content academy-page-content--addons"
				maxWidth="1200px"
				marginInline="auto"
			>
				<Tabs.Root defaultValue="all">
					<Tabs.List>
						{filterOptions.map(option => (
							<Tabs.Trigger key={option.slug} value={option.slug}>
								{option.title}
							</Tabs.Trigger>
						))}
					</Tabs.List>

					<Formik enableReinitialize>
						{({ setFieldValue, values }) => (
							<>
								{filterOptions.map(option => (
									<Tabs.Content
										key={option.slug}
										value={option.slug}
									>
										<RenderCards
											filter={option.slug}
											values={values}
											setFieldValue={setFieldValue}
											activeAddons={activeAddons}
										/>
									</Tabs.Content>
								))}
							</>
						)}
					</Formik>
				</Tabs.Root>
			</Box>
		</>
	);
};

export default Addons;
