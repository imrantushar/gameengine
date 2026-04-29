import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddonCard from './AddonCard';
import { Formik } from 'formik';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import { Box, Button, Flex } from '@chakra-ui/react';
import { fetchAddons } from '@GFRedux/Slices/addonsSlice/addonsSlice';
import { academyLms, storeEngine, wooCommerce, tutorLms, referralIcon } from '@GFUtils/icons';
import Search from '@GFComponents/Search';
import GameEngineBox from '@GFComponents/GameEngineBox';
import AddOnsLoader from '@GFComponents/GameEngineLoader/AddOnsLoader';
import CustomTableMessage from '@GFComponents/Oops/CustomTableMessage';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { plugin_root_url } from '@GFUtils/helper';
import Select from 'react-select';

const infoCardsData = [
	{
		label: __('Academy LMS', 'gameengine'),
		name: 'academylms',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Reward learners with points, badges, and levels for course progress, quizzes, and engagement. boost!',
			'gameengine'
		),
		required_plugin: [
			{
				plugin_dir_path: 'academy/academy.php',
				plugin_name: 'Academy LMS',
			},
		],
		icon: academyLms(),
		docsUrl: 'https://quizpress.pro/docs/how-to-use-quizpress-certificate-builder/',
		route: "",
	},
	{
		label: __('Tutor LMS', 'gameengine'),
		name: 'tutorlms',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Reward learners with points, badges, and levels for course completions, lessons, and quizzes.',
			'gameengine'
		),
		required_plugin: [
			{
				plugin_dir_path: 'tutor/tutor.php',
				plugin_name: 'Tutor LMS',
			},
		],
		icon: tutorLms(),
		docsUrl: 'https://www.themeum.com/docs/tutor-lms-introduction/',
		route: "",
	},
	{
		label: __('StoreEngine', 'gameengine'),
		name: 'storeengine',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Gamify purchases by rewarding customers for orders, spending, reviews, and store actions engagement',
			'gameengine'
		),
		required_plugin: [
			{
				plugin_dir_path: 'storeengine/storeengine.php',
				plugin_name: 'StoreEngine',
			},
		],
		icon: storeEngine(),
		route: "",
	},
	{
		label: __('WooCommerce', 'gameengine'),
		name: 'woocommerce',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Add points, achievements, and ranks to WooCommerce actions like buying, reviews, and refunds. perks!',
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
		route: "",
	},
	{
		label: __('Restrict Unlock', 'gameengine'),
		name: 'restrict_unlock',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Unlock content, levels, or rewards only when users complete goals or achievements earned progress!!',
			'gameengine'
		),
		required_plugin: false,
		icon: false,
		image: plugin_root_url + 'assets/images/restrict_unlock.svg',
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
		route: "admin.php?page=gameengine-achievements&action=new",
	},
	{
		label: __('Restrict Content', 'gameengine'),
		name: 'restrict_content',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Control access by restricting posts, pages, or sections based on points, ranks, or badges. controlled',
			'gameengine'
		),
		required_plugin: false,
		icon: false,
		image: plugin_root_url + 'assets/images/restrict_content.svg',
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
		route: "",
	},
	{
		label: __('Progress Map', 'gameengine'),
		name: 'progress_map',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Visualize user progress with maps showing completed tasks, paths, milestones, and rewards. gamified!',
			'gameengine'
		),
		required_plugin: false,
		icon: false,
		image: plugin_root_url + 'assets/images/progress_map.svg',
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
		route: "",
	},
	{
		label: __('Wallet', 'gameengine'),
		name: 'wallet',
		is_pro: true,
		is_coming_soon: false,
		details: __(
			'Manage and view your wallet transactions with a clear list of balances, earnings, expenses, and payment history. Stay organized and in control!',
			'gameengine'
		),
		required_plugin: false,
		icon: false,
		image: plugin_root_url + 'assets/images/progress_map.svg',
		docsUrl: 'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
		route: "admin.php?page=gameengine-wallet",
	},
	{
		label: __('Referrals & Affiliates', 'gameengine'),
		name: 'referrals',
		is_pro: true,
		is_coming_soon: false,
		details: __(
			'Boost growth by rewarding users for referring friends, tracked clicks, signups, and affiliate commissions.',
			'gameengine'
		),
		required_plugin: false,
		icon: referralIcon(),
		docsUrl: 'https://kodezen.com/docs/gameengine/referrals/',
		route: "admin.php?page=gameengine-referrals",
	},
	{
		label: __('Spin the Wheel', 'gameengine'),
		name: 'lucky-wheels',
		is_pro: true,
		is_coming_soon: false,
		details: __(
			'Allow users to spin a lucky wheel to win points and rewards. Fully customizable slices and probabilities.',
			'gameengine'
		),
		required_plugin: false,
		icon: false,
		image: plugin_root_url + 'assets/images/progress_map.svg', // Fallback image
		docsUrl: '#',
		route: "admin.php?page=gameengine-lucky-wheels",
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

const statusOptions = [
	{ value: 'all', label: __('All Status', 'gameengine') },
	{ value: 'active', label: __('Active', 'gameengine') },
	{ value: 'inactive', label: __('Inactive', 'gameengine') },
	// { slug: 'free', title: __('Free', 'academy') },
	// { slug: 'pro', title: __('Pro', 'academy') },
];

const Addons = () => {
	const addonsSavedData = useSelector((state) => state.addons);
	const [filterText, setFilterText] = useState('');
	const [loading, setLoading] = useState(!addonsSavedData);
	const [filterMenu, setFilterMenu] = useState('all');
	const dispatch = useDispatch();

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				dispatch(fetchAddons());
			} catch (error) {
				console.warn(error);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleClearAll = () => {
		setFilterText('');
		setFilterMenu('all');
	};

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

	const selectedStatus = statusOptions.find((o) => o.value === filterMenu) || statusOptions[0];

	return (
		<>
			<TopBar path={__('Add-ons', 'gameengine')} />

			<Box className="gameengine-page-content">
				<Flex
					justifyContent="space-between"
					alignItems="center"
					padding="16px 0"
					mb="4px"
				>
					<GFLabel
						type="plainHeading"
						margin={0}
						padding={0}
						label={__('Add-ons', 'gameengine')}
					/>

					<Flex alignItems="center" gap="12px">
						<Button
							variant="ghost"
							height="36px"
							padding="0 10px"
							fontSize="13px"
							fontWeight="500"
							color="#718096"
							_hover={{ color: 'var(--gameengine-primary)', background: 'transparent' }}
							onClick={handleClearAll}
						>
							{__('Clear All', 'gameengine')}
						</Button>

						<Select
							options={statusOptions}
							value={selectedStatus}
							onChange={(selected) => {
								setFilterMenu(selected.value);
								setLoading(true);
							}}
							className="gameengine-select"
							classNamePrefix="gameengine-select"
							isSearchable={false}
						/>

						<Search
							placeholder={__('Search...', 'gameengine')}
							onSearchHandler={(keyword) => setFilterText(keyword.trim())}
						/>
					</Flex>
				</Flex>

				<GameEngineBox dynamicClasses="addons">
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
											width="100%"
											flexWrap="wrap"
											gap="16px"
											className="gameengine-dashboard-addon-cards"
										>
											{addonLists.length ? (
												addonLists.map((item, index) => (
													<AddonCard
														item={item}
														key={index}
														index={index}
														value={values[item.name]}
														setFieldValue={setFieldValue}
													/>
												))
											) : (
												<CustomTableMessage
													title={__('No Addons Found!', 'academy')}
												/>
											)}
										</Flex>
									)}
								</>
							);
						}}
					</Formik>
				</GameEngineBox>
			</Box>
		</>
	);
};

export default Addons;