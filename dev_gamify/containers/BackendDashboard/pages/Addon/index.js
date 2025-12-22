import React from 'react';
import AddonCard from './AddonCard';
import { Formik } from 'formik';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';


import './styles.scss';
import { Box, Flex, Heading } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import TopBar from '@GFComponents/TopBar';
import { FaChevronRight } from 'react-icons/fa6';

const infoCardsData = [
	{
		label: __('Certificates', 'quizpress'),
		name: 'certificates',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Award stunning certificates automatically when users complete or pass a quiz.',
			'quizpress'
		),
		required_plugin: [
			{
				plugin_dir_path: 'ablocks/ablocks.php',
				plugin_name: 'aBlocks',
			},
		],
		icon: (
			<svg
				width="36"
				height="36"
				viewBox="0 0 48 48"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M45 3.34375H3C2.17158 3.34375 1.5 4.01531 1.5 4.84375V33.3437C1.5 34.1722 2.17158 34.8437 3 34.8437H45C45.8284 34.8437 46.5 34.1722 46.5 33.3437V4.84375C46.5 4.01531 45.8284 3.34375 45 3.34375Z"
					fill="#7B68EE"
				/>
				<path
					d="M7.5 31.8437H40.5C40.5 31.0481 40.8161 30.2851 41.3787 29.7224C41.9413 29.1598 42.7044 28.8437 43.5 28.8437V9.34375C42.7044 9.34375 41.9413 9.02767 41.3787 8.46507C40.8161 7.90246 40.5 7.13939 40.5 6.34375H7.5C7.5 7.13939 7.18393 7.90246 6.62131 8.46507C6.05871 9.02767 5.29564 9.34375 4.5 9.34375V28.8437C5.29564 28.8437 6.05871 29.1598 6.62131 29.7224C7.18393 30.2851 7.5 31.0481 7.5 31.8437Z"
					fill="#DFDBFB"
				/>
				<path
					d="M40.5675 6.97C40.5233 6.76417 40.5006 6.55428 40.5 6.34375H7.5C7.5 7.1394 7.18393 7.90246 6.62131 8.46507C6.05871 9.02767 5.29564 9.34375 4.5 9.34375V28.8437C5.28592 28.843 6.04046 29.1521 6.6 29.704H39.0675C39.4653 29.704 39.8469 29.546 40.1282 29.2646C40.4094 28.9834 40.5675 28.6018 40.5675 28.204V6.97Z"
					fill="#F2F0FD"
				/>
				<path
					d="M28.5 34.7188V44.6573L25.5 42.4688L22.5 44.6573V38.6388L25.5 40.8275V35.6078C25.6709 35.5358 25.8313 35.4515 25.9792 35.3561C26.337 35.11 26.801 34.962 27.2917 34.9382C27.7112 34.928 28.1227 34.8529 28.5 34.7188Z"
					fill="#F0AE42"
				/>
				<path
					d="M17.2502 30.8221C17.5877 31.1798 17.7904 31.6438 17.8232 32.1346C17.8472 32.8913 18.1586 33.6106 18.694 34.1461C19.2295 34.6814 19.9487 34.9928 20.7055 35.0168C21.1963 35.0497 21.6602 35.2523 22.018 35.5898C22.5631 36.0749 23.2675 36.343 23.9972 36.343C24.727 36.343 25.4312 36.0749 25.9765 35.5898C26.3342 35.2523 26.7982 35.0497 27.289 35.0168C28.0457 34.9928 28.765 34.6814 29.3005 34.1461C29.8358 33.6106 30.1472 32.8913 30.1712 32.1346C30.2057 31.643 30.4105 31.1789 30.7502 30.8221C31.2353 30.277 31.5032 29.5726 31.5032 28.8428C31.5032 28.1131 31.2353 27.4088 30.7502 26.8636C30.4127 26.5058 30.2101 26.0419 30.1772 25.5511C30.1532 24.7943 29.8418 24.0751 29.3065 23.5397C28.771 23.0042 28.0517 22.6928 27.295 22.6688C26.8028 22.6358 26.3375 22.4321 25.9795 22.0928C25.4342 21.6077 24.73 21.3398 24.0002 21.3398C23.2705 21.3398 22.5661 21.6077 22.021 22.0928C21.6632 22.4303 21.1993 22.633 20.7085 22.6658C19.9517 22.6898 19.2325 23.0012 18.697 23.5367C18.1616 24.0721 17.8502 24.7913 17.8262 25.5481C17.7932 26.0402 17.5895 26.5055 17.2502 26.8636C16.7651 27.4088 16.4971 28.1131 16.4971 28.8428C16.4971 29.5726 16.7651 30.277 17.2502 30.8221Z"
					fill="#FDB022"
				/>
				<path
					d="M24 32.5938C26.0711 32.5938 27.75 30.9148 27.75 28.8438C27.75 26.7727 26.0711 25.0938 24 25.0938C21.929 25.0938 20.25 26.7727 20.25 28.8438C20.25 30.9148 21.929 32.5938 24 32.5938Z"
					fill="#F9D266"
				/>
				<path
					d="M20.25 28.8438C20.2542 29.4675 20.4153 30.08 20.7188 30.625C21.2637 30.9285 21.8763 31.0897 22.5 31.0938C23.4945 31.0938 24.4483 30.6986 25.1517 29.9954C25.8549 29.2921 26.25 28.3384 26.25 27.3438C26.2458 26.72 26.0847 26.1075 25.7812 25.5625C25.2363 25.2592 24.6237 25.0979 24 25.0938C23.0055 25.0938 22.0516 25.4888 21.3483 26.192C20.6451 26.8954 20.25 27.8493 20.25 28.8438Z"
					fill="#FCE797"
				/>
				<path
					d="M17.25 8.59375H30.75V10.0938H17.25V8.59375ZM12.75 11.5938H35.25V13.0938H12.75V11.5938ZM9.75 14.5938H38.25V16.0937H9.75V14.5938Z"
					fill="#DFDBFB"
				/>
				<path
					d="M33.75 28.0938H38.25V29.5938H33.75V28.0938ZM9.75 28.0938H14.25V29.5938H9.75V28.0938Z"
					fill="#DFDBFB"
				/>
				<path
					d="M25.5 35.8601V42.566L22.5 39.7546L19.5 42.566V34.7188C19.8773 34.8909 20.2889 34.9868 20.7083 34.9999C21.1991 35.0308 21.663 35.2205 22.0208 35.5369C22.4903 35.9276 23.0795 36.1693 23.7044 36.2275C24.3291 36.2857 24.9576 36.1567 25.5 35.8601Z"
					fill="#F9D266"
				/>
			</svg>
		),
		// url: `${admin_url}admin.php?page=quizpress-certificates`,
		docsUrl:
			'https://quizpress.pro/docs/how-to-use-quizpress-certificate-builder/',
	},
	{
		label: __('StoreEngine', 'quizpress'),
		name: 'storeengine',
		is_pro: false,
		is_coming_soon: true,
		details: __(
			'Sell certificates, quiz access, or digital products directly with StoreEngine integration.',
			'quizpress'
		),
		icon: (
			<svg
				width="36"
				height="36"
				viewBox="0 0 48 48"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M18.0577 5.72266C17.9329 6.60586 17.3377 6.85546 16.9825 7.32586C14.5057 10.5899 12.8545 14.1995 13.3345 18.5387C13.4881 19.9307 14.1313 21.2363 14.9569 22.3787C17.6737 26.0939 21.5521 27.7835 25.4977 29.3291C26.9665 29.9051 28.4545 30.3947 29.9137 31.0091C31.0657 31.4987 32.1313 32.1899 33.0145 33.1499C34.8385 35.1275 34.6465 37.4603 32.4865 39.0059C30.5377 40.4075 28.3489 40.6091 26.0929 40.3115C24.9313 40.1579 23.8369 39.7547 22.7425 39.3131C20.3905 38.3627 17.9809 37.9691 15.4753 38.5163C13.4401 38.9579 11.7217 40.0043 10.3489 41.6363C9.71527 42.3947 9.42727 42.6251 8.76487 41.5595C7.90087 40.1675 6.81607 38.9483 6.02887 37.4699C5.04967 35.6267 4.36807 33.6587 3.98407 31.6235C3.15847 27.2651 3.42727 22.9451 4.92487 18.7595C6.58567 14.1131 9.40807 10.5035 13.3825 7.93066C14.8225 6.98026 16.3585 6.27946 18.0577 5.72266Z"
					fill="#008DFF"
				/>
				<path
					d="M43.0847 33.8979C42.8639 32.9763 42.7295 32.2947 42.5375 31.6323C40.9055 25.7955 37.0847 22.5123 31.8143 20.8419C29.6255 20.1507 27.3503 19.9299 25.2287 18.8547C23.6351 18.0579 22.8959 15.4851 23.6447 13.9779C24.6623 11.9235 26.2175 10.6947 28.4063 10.5027C31.5071 10.2339 34.4735 10.7235 37.1807 12.4323C41.8271 15.3699 44.7263 20.2083 44.4767 26.8707C44.3807 29.1843 43.9871 31.4595 43.0847 33.8979Z"
					fill="#FF5000"
				/>
			</svg>
		),
		// url: `${admin_url}admin.php?page=quizpress-certificates`,
		// docsUrl:
		// 	'https://quizpresslms.net/docs/how-to-use-quizpress-certificate-builder/',
	},
	{
		label: __('WooCommerce', 'quizpress'),
		name: 'woocommerce',
		is_pro: false,
		is_coming_soon: false,
		details: __(
			'Monetize quizzes effortlessly by selling them as WooCommerce products and bundles.',
			'quizpress'
		),
		icon: (
			<svg
				width="36"
				height="36"
				viewBox="0 0 48 48"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clipPath="url(#clip0_2488_13665)">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M20.3922 18C19.3148 18 18.6133 18.3508 17.9869 19.5283L15.1307 24.915V20.1296C15.1307 18.7015 14.4542 18 13.2015 18C11.9488 18 11.4227 18.4259 10.7963 19.6285L8.09041 24.915V20.1797C8.09041 18.6514 7.46405 18 5.93573 18H2.82898C1.65142 18 1 18.5512 1 19.5534C1 20.5556 1.62636 21.1569 2.77887 21.1569H4.05664V27.195C4.05664 28.8987 5.20915 29.9009 6.86275 29.9009C8.51634 29.9009 9.26797 29.2495 10.0948 27.7211L11.8987 24.3388V27.195C11.8987 28.8736 13.0011 29.9009 14.6797 29.9009C16.3584 29.9009 16.9847 29.3246 17.9368 27.7211L22.0959 20.7059C22.9978 19.1776 22.3715 18 20.3671 18C20.3671 18 20.3671 18 20.3922 18Z"
						fill="#873EFF"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M28.209 18C24.8016 18 22.2209 20.5305 22.2209 23.963C22.2209 27.3954 24.8266 29.9009 28.209 29.9009C31.5913 29.9009 34.1719 27.3704 34.197 23.963C34.197 20.5305 31.5913 18 28.209 18ZM28.209 26.2429C26.9312 26.2429 26.0543 25.2908 26.0543 23.963C26.0543 22.6351 26.9312 21.658 28.209 21.658C29.4867 21.658 30.3636 22.6351 30.3636 23.963C30.3636 25.2908 29.5118 26.2429 28.209 26.2429Z"
						fill="#873EFF"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M41.0117 18C37.6293 18 35.0237 20.5305 35.0237 23.963C35.0237 27.3954 37.6293 29.9009 41.0117 29.9009C44.394 29.9009 46.9997 27.3704 46.9997 23.963C46.9997 20.5556 44.394 18 41.0117 18ZM41.0117 26.2429C39.7089 26.2429 38.8821 25.2908 38.8821 23.963C38.8821 22.6351 39.7339 21.658 41.0117 21.658C42.2895 21.658 43.1664 22.6351 43.1664 23.963C43.1664 25.2908 42.3145 26.2429 41.0117 26.2429Z"
						fill="#873EFF"
					/>
				</g>
				<defs>
					<clipPath id="clip0_2488_13665">
						<rect
							width="46"
							height="11.9009"
							fill="white"
							transform="translate(1 18)"
						/>
					</clipPath>
				</defs>
			</svg>
		),
		// url: `${admin_url}admin.php?page=quizpress-certificates`,
		docsUrl:
			'https://quizpress.pro/docs/how-to-sell-quiz-with-woocommerce/',
		required_plugin: [
			{
				plugin_dir_path: 'woocommerce/woocommerce.php',
				plugin_name: 'WooCommerce',
			},
		],
	},
];

const Addons = () => {
	const addonsSavedData = useSelector((state) => state.addons);

	return (
		<>
			<TopBar
				leftContent={() => (
					<>
						<span className="gamify-topbar-logo gamify-icon gamify-icon--gamify">
							<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
								<rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" />
								<path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" />
							</svg>
						</span>
						<span className="gamify-icon gamify-icon--angle-right">   <FaChevronRight />
						</span>
						<GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
					</>
				)}
			/>
			<Box className="quizpress-page-content quizpress-page-content--addons">
				<Heading className="quizpress-heading">
					{__('Add-ons', 'quizpress')}
				</Heading>
				<Formik
					enableReinitialize={true}
					initialValues={infoCardsData.reduce((acc, cur) => {
						acc[cur.name] = false;
						return acc;
					}, {})}
				>
					{({ setFieldValue, values }) => {
						return (
							<Flex flexWrap="wrap" gap={6}>
								{infoCardsData.map((item, index) => {
									return (
										<AddonCard
											item={item}
											key={index}
											index={index}
											value={values[item.name]}
											setFieldValue={setFieldValue}
										/>
									);
								})}
							</Flex>
						);
					}}
				</Formik>
			</Box>
		</>
	);
};

export default Addons;
