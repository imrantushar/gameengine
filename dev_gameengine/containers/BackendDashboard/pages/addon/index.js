import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddonCard from './AddonCard';
import { Formik } from 'formik';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import { Button, Flex, } from '@chakra-ui/react';
import { fetchAddons } from '@GFRedux/Slices/addonsSlice/addonsSlice';
import { academyLms, storeEngine, wooCommerce } from '@GFUtils/icons';
import Search from '@GFComponents/Search';
import GameEngineBox from '@GFComponents/GameEngineBox';
import AddOnsLoader from '@GFComponents/GameEngineLoader/AddOnsLoader';
import CustomTableMessage from '@GFComponents/Oops/CustomTableMessage';

const infoCardsData = [
	{
		label: __('Academy LMS', 'gameengine'),
		name: 'academylms',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'When users complete or pass a quiz.',
			'gameengine'
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
		label: __('StoreEngine', 'gameengine'),
		name: 'storeengine',
		is_pro: false,
		is_coming_soon: true,
		details: __(
			'Sell certificates, quiz access, or digital products directly with StoreEngine integration.',
			'gameengine'
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
		label: __('WooCommerce', 'gameengine'),
		name: 'woocommerce',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Monetize quizzes effortlessly by selling them as WooCommerce products and bundles.',
			'gameengine'
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
	{
		label: __('Restrict Unlock', 'gameengine'),
		name: 'restrict_unlock',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Monetize quizzes effortlessly by selling them as WooCommerce products and bundles.',
			'gameengine'
		),
		required_plugin: false,
		icon: wooCommerce(),
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
	},
	{
		label: __('Restrict Content', 'gameengine'),
		name: 'restrict_content',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Lock specific posts, pages, images or links based on points and badges.',
			'gameengine'
		),
		required_plugin: false,
		icon: wooCommerce(),
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
	},
	{
		label: __('Progress Map', 'gameengine'),
		name: 'progress_map',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Monetize quizzes effortlessly by selling them as WooCommerce products and bundles.',
			'gameengine'
		),
		required_plugin: false,
		icon: wooCommerce(),
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
	},

	// ================= PRO + ACTIVE (NEW) =================
	// {
	// 	label: __('Advanced Analytics', 'gameengine'),
	// 	name: 'advanced-analytics',
	// 	is_pro: true,
	// 	is_active: true,
	// 	is_coming_soon: false,
	// 	details: __(
	// 		'Get detailed insights into quiz performance with advanced reports and charts.',
	// 		'gameengine'
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
	// 	label: __('Content Drip', 'gameengine'),
	// 	name: 'content-drip',
	// 	is_pro: true,
	// 	is_active: false,
	// 	is_coming_soon: false,
	// 	details: __(
	// 		'Release quiz content gradually based on a scheduled timeline.',
	// 		'gameengine'
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
	// 	label: __('White Label', 'gameengine'),
	// 	name: 'white-label',
	// 	is_pro: true,
	// 	is_active: false,
	// 	is_coming_soon: true,
	// 	details: __(
	// 		'Fully rebrand QuizPress with your own logo, colors, and identity.',
	// 		'gameengine'
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
	// { slug: 'free', title: __('Free', 'academy') },
	// { slug: 'pro', title: __('Pro', 'academy') },
];

const Addons = () => {
	const addonsSavedData = useSelector((state) => state.addons);
	const [filterText, setFilterText] = useState('');
	const [loading, setLoading] = useState(false);
	const [filterMenu, setFilterMenu] = useState('all');
	const dispatch = useDispatch();

	useEffect(() => {
		setLoading(true)
		dispatch(fetchAddons()).then(() => {
			setLoading(false)
		});
	}, []);

	const getAddonLists = (values) => {
		return infoCardsData.filter((item) => {
			if (item.label.toLowerCase().includes(filterText.toLowerCase())) {
				if (filterMenu === 'all') {
					setLoading(false);
					return item;
				} else if (filterMenu === 'active' && values[item.name]) {
					return item;
				} else if (filterMenu === 'inactive' && !values[item.name]) {
					return item;
				} else if (filterMenu === 'pro' && item.is_pro) {
					return item;
				} else if (filterMenu === 'free' && !item.is_pro) {
					return item;
				}
			}
			setLoading(false);
			return false;
		});
	};

	return (
		<>
			<TopBar path={__("Add-ons", "gameengine")} />

			<GameEngineBox
				heading={__("Add-ons", "gameengine")}
				dynamicClasses="addons"
			>
				<Flex
					width={'100%'}
					justifyContent={'space-between'}
					alignItems={'center'}
					borderBottom={'1px solid var(--gameengine-border-color)'}
					pb="10px"
					mb='20px'
				>
					<Flex gap={0} alignItems="center">
						{filterOptions.map((option, index) => (
							<Button
								key={index}
								bg={'transparent'}
								minWidth={'0'}
								height={'35px'}
								padding={'6px 12px'}
								fontSize={'14px'}
								fontWeight={'500'}
								lineHeight={'20px'}
								color={'var(--gameengine-font-color)'}
								_after={{
									content: '""',
									position: "absolute",
									left: 0,
									bottom: "-13px",
									width: "100%",
									height: "2px",
									bg: "var(--gameengine-primary)",
									transform:
										filterMenu === option.slug ? "scaleX(1)" : "scaleX(0)",
									transformOrigin: "left",
									transition: "transform 0.2s ease",
								}}
								_hover={{
									_after: {
										transform: "scaleX(1)",
									},
								}}
								className={`gameengine-addons-filter-option ${filterMenu === option.slug
									? 'active-filter'
									: ''
									}`}
								onClick={() => {
									setFilterMenu(option.slug);
									setLoading(true);
								}}
							>
								{option.title}
							</Button>
						))}
					</Flex>

					<Search
						placeholder={__('Search Add-ons', 'gameengine')}
						onSearchHandler={(keyword) =>
							setFilterText(keyword.trim())
						}
					/>
				</Flex>

				<Formik
					enableReinitialize
					initialValues={{ ...addonsSavedData }}
				>
					{({ setFieldValue, values }) => {
						const addonLists = getAddonLists(values);
						return (
							<>
								{loading ? (
									<AddOnsLoader />
								) : (
									<Flex
										width={'100%'}
										flexWrap={'wrap'}
										gap={'20px'}
										className='gameengine-dashboard-addon-cards'
									>
										{addonLists.length ? (
											addonLists.map(
												(item, index) => {
													return (
														<AddonCard
															item={item}
															key={index}
															index={index}
															value={values[item.name]}
															setFieldValue={setFieldValue}
														/>
													);
												}
											)
										) : (
											<CustomTableMessage title={__('No Addons Found!', 'academy')} />
										)}
									</Flex>
								)}
							</>
						)
					}}
				</Formik>
			</GameEngineBox>
		</>
	);
};

export default Addons;
