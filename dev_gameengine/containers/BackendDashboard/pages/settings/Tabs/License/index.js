import React, { useState, useCallback } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import moment from 'moment';
import {
	Box,
	Button,
	Flex,
	Icon,
	Input,
	Spinner,
	Text,
} from '@chakra-ui/react';
import { LuRefreshCw, LuLink, LuKey } from 'react-icons/lu';
import { useDispatch } from 'react-redux';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { API, plugin_root_url } from '@GFUtils/helper';
import HireUs from './HireUs';

import "./styles.scss";

const SeSdk = window.SE_SDK_GAMEENGINE_PRO || {};

const licenseRequest = (endpoint, payload) =>
	API.post(SeSdk?.rest_url + endpoint, payload);

const licenseGet = (endpoint, params) =>
	API.get(SeSdk?.rest_url + endpoint, { params });

const buildPurchaseUrl = () => {
	const base = 'https://gameengine.pro/';
	try {
		const url = new URL(base);
		url.searchParams.set('utm_source', 'license-activation');
		url.searchParams.set('utm_medium', 'license-form');
		url.searchParams.set('utm_campaign', 'license-activation-upsell');
		url.searchParams.set('utm_content', 'purchase-link');
		url.searchParams.set('utm_term', 'gameengine-pro');
		url.searchParams.set('locale', SeSdk.locale);
		url.searchParams.set('wordpress', SeSdk.WordPress);
		url.searchParams.set('sdk_version', SeSdk.version);
		url.searchParams.set('instance', SeSdk.device_id);
		return url.toString();
	} catch {
		return base;
	}
};

const PURCHASE_URL = buildPurchaseUrl();

const License = () => {
	const dispatch = useDispatch();
	const [licenseKey, setLicenseKey] = useState('');
	const [licenseData, setLicenseData] = useState(SeSdk?.license);
	const [optInData, setOptInData] = useState(SeSdk?.optin);
	const [isActivating, setIsActivating] = useState(false);
	const [isDeactivating, setIsDeactivating] = useState(false);
	const [isOptinLoading, setIsOptinLoading] = useState(false);
	const [isCheckingStatus, setIsCheckingStatus] = useState(false);

	const fetchStatus = useCallback(async () => {
		setIsCheckingStatus(true);
		try {
			const { data } = await licenseGet('license/status', { force: true });
			setLicenseData(data);
		} catch (error) {
			const message = error?.response?.data?.message || __('Failed to fetch license status.', 'gameengine');
			dispatch(showNotification({ message, isShow: true, type: 'error' }));
		} finally {
			setIsCheckingStatus(false);
		}
	}, []);

	const handleActivate = async () => {
		if (!licenseKey.trim()) {
			dispatch(showNotification({ message: __('Please enter a license key.', 'gameengine'), isShow: true, type: 'error' }));
			return;
		}
		setIsActivating(true);
		try {
			const { data: { license } } = await licenseRequest('license/activate', { license: licenseKey.trim() });
			setLicenseData(license);
			setLicenseKey('');
			window.dispatchEvent( new CustomEvent( 'gameengine:license:changed', { detail: { status: license?.status } } ) );
			dispatch(showNotification({ message: __('License activated successfully.', 'gameengine'), isShow: true, type: 'success' }));
		} catch (error) {
			const message = error?.response?.data?.message || __('Failed to activate license.', 'gameengine');
			dispatch(showNotification({ message, isShow: true, type: 'error' }));
		} finally {
			setIsActivating(false);
		}
	};

	const handleDeactivate = async () => {
		setIsDeactivating(true);
		try {
			const { data: { license } } = await licenseRequest('license/deactivate', {});
			setLicenseData(license);
			window.dispatchEvent( new CustomEvent( 'gameengine:license:changed', { detail: { status: license?.status } } ) );
			dispatch(showNotification({ message: __('License deactivated successfully.', 'gameengine'), isShow: true, type: 'success' }));
		} catch (error) {
			const message = error?.response?.data?.message || __('Failed to deactivate license.', 'gameengine');
			dispatch(showNotification({ message, isShow: true, type: 'error' }));
		} finally {
			setIsDeactivating(false);
		}
	};

	const handleOptin = async (optin) => {
		setIsOptinLoading(true);
		try {
			const { data } = await licenseRequest('insights/optin', { opt_in: optin });
			setOptInData(data);
		} catch (error) {
			const message = error?.response?.data?.message || __('Failed to update opt-in setting.', 'gameengine');
			dispatch(showNotification({ message, isShow: true, type: 'error' }));
		} finally {
			setIsOptinLoading(false);
		}
	};

	const isActive = licenseData?.status === 'active';

	return (
		<>
			<>
				{isActive ? (
					<Flex
						direction="column"
						alignItems="center"
						textAlign="center"
						padding={{ base: 4, md: 6 }}
						background="#FFF"
						boxShadow="var(--gameengine-shadow)"
						borderRadius="4px"
					>
						<Text as="h2" fontSize="20px" fontWeight="700" color="var(--gameengine-font-color)" margin={0} mb={'8px'}>
							{__('GameEngine Pro — License Active', 'gameengine')}
						</Text>
						<Text fontSize="14px" color="var(--gameengine-gray-color)" margin={0} mb={'24px'}>
							{__('You have access to automatic updates, priority support, and all pro tools.', 'gameengine')}
						</Text>

						{/* Logo pill */}
						<Flex alignItems="center" gap={3} border="1px solid" borderColor="gray.200" borderRadius="full" px={5} py={2} mb={6}>
							{/* <img src={plugin_root_url + '/assets/images/logo.svg'} alt="gameengine" style={{ height: '24px' }} /> */}
							<LuLink size={14} color="#888" />
							<Icon as={LuKey} width={'16px'} color="#888" />
						</Flex>

						{/* License key + buttons */}
						<Flex gap={3} alignItems="center" flexWrap="wrap" justifyContent="center" mb={4} width="100%">
							<Input
								value={licenseData?.license ?? ''}
								readOnly
								flex="1"
								maxW="340px"
								minW="200px"
								border="1px solid var(--gameengine-border-color) !important"
								borderRadius="4px"
								height="36px"
								px={3}
								fontSize="14px"
								_focus={{ boxShadow: 'none' }}
							/>
							<Button
								size="sm"
								bg="red.500"
								color="white"
								_hover={{ bg: 'red.600' }}
								loading={isDeactivating}
								loadingText={__('Deactivating…', 'gameengine')}
								onClick={handleDeactivate}
								flexShrink={0}
								height="36px"
								cursor="pointer"
								px={4}
								borderRadius="4px"
							>
								{__('Deactivate License', 'gameengine')}
							</Button>
							<Button
								bg="blue.500"
								_hover={{ bg: 'blue.400', color: 'white' }}
								cursor="pointer"
								as="a"
								href="https://store.kodezen.com/dashboard/license-keys/"
								target="_blank"
								rel="noopener noreferrer"
								size="sm"
								color="white"
								flexShrink={0}
								height="36px"
								px={4}
								borderRadius="4px"
							>
								{__('Manage License', 'gameengine')}
							</Button>
						</Flex>

						{/* Opt-in checkbox */}
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--gameengine-font-color)' }}>
							<input
								type="checkbox"
								checked={optInData?.allowed ?? false}
								onChange={(e) => handleOptin(e.target.checked)}
								disabled={isOptinLoading}
								style={{margin: "0"}}
							/>
							<span>{__('Allow usage tracking to help improve GameEngine Pro.', 'gameengine')}</span>
						</label>

						{/* Separator */}
						<Box borderTop="1px solid" borderColor="gray.200" width="100%" my={6} />

						{/* Meta row */}
						<Flex gap={8} justifyContent="center" flexWrap="wrap" width="100%">
							<MetaItem
								label={__('Status:', 'gameengine')}
								value={isActive ? __('Active', 'gameengine') : licenseData?.status}
								valueColor={isActive ? '#1a7f37' : '#d32f2f'}
							/>
							<MetaItem
								label={__('Last Checked:', 'gameengine')}
								value={
									<Flex alignItems="center" gap={1} justifyContent="center">
										<Text as="span" fontSize="13px" fontWeight="600" color="var(--gameengine-font-color)" margin={0}>
											{moment.utc(licenseData?.updated_at).local().format('YYYY-MM-DD HH:mm:ss')}
										</Text>
										<Button
											variant="ghost"
											size="xs"
											onClick={fetchStatus}
											aria-label={__('Refresh status', 'gameengine')}
											p={1}
											minW="auto"
											h="auto"
											color="gray.500"
										>
											{isCheckingStatus ? <Spinner size="xs" /> : <LuRefreshCw size={8} />}
										</Button>
									</Flex>
								}
							/>
							<MetaItem
								label={__('Expires:', 'gameengine')}
								value={licenseData?.expires ? moment.utc(licenseData.expires).local().format('YYYY-MM-DD HH:mm') : __('N/A', 'gameengine')}
							/>
							<MetaItem
								label={__( 'Activation Remaining:', 'gameengine' )}
								value={
									licenseData?.unlimited
										?
										__( 'Unlimited', 'gameengine' )
										:
										sprintf(
											/* translators: 1: remaining activations, 2: total limit */
											__( '%1$d out of %2$s', 'gameengine' ),
											licenseData?.remaining,
											licenseData?.limit,
										)
								}
							/>
							<MetaItem
								label={__('Automatic Update:', 'gameengine')}
								value={__('Enabled', 'gameengine')}
							/>
						</Flex>
					</Flex>
				) : (
					<Flex
						direction="column"
						alignItems="center"
						textAlign="center"
						padding={{ base: 4, md: 6 }}
						background="#FFF"
						boxShadow="var(--gameengine-shadow)"
						borderRadius="4px"
					>
						<Text as="h2" fontSize="20px" fontWeight="700" color="var(--gameengine-font-color)" margin={0} mb={'8px'}>
							{__('Activate GameEngine Pro for updates & support.', 'gameengine')}
						</Text>
						<Text fontSize="14px" fontWeight={400} lineHeight={'20px'} color="var(--gameengine-gray-color)" margin={0} mb={'24px'} maxW={'75%'}>
							{__('Activate GameEngine Pro to unlock automatic updates, priority support, and all tools to manage your contacts and automate your marketing.', 'gameengine')}
						</Text>

						{/* Logo pill */}
						<Flex alignItems="center" gap={3} border="1px solid" borderColor="gray.200" borderRadius="full" px={5} py={2} margin={0} mb={'24px'}>
							<img src={plugin_root_url + '/assets/images/logo.svg'} alt="gameengine" style={{ height: '24px' }} />
							<LuLink size={14} color="#888" />
							<Icon as={LuKey} width={'16px'} height={'16px'} color="#000000" />
						</Flex>

						{/* License input + Activate button */}
						<Flex gap={3} alignItems="center" flexWrap="wrap" justifyContent="center" mb={4} width={'100%'}>
							<Input
								type="text"
								placeholder={__('Enter your license key', 'gameengine')}
								value={licenseKey}
								onChange={(e) => setLicenseKey(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') handleActivate(); }}
								flex="1"
								maxW="340px"
								minW="200px"
								border="1px solid var(--gameengine-border-color) !important"
								borderRadius="4px"
								height="36px"
								px={3}
								fontSize="14px"
								_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'var(--gameengine-border-color)' }}
							/>
							<Button
								size="sm"
								bg="var(--gameengine-primary)"
								border="1px solid var(--gameengine-primary)"
								_hover={{ opacity: 0.9 }}
								loading={isActivating}
								loadingText={__('Activating…', 'gameengine')}
								onClick={handleActivate}
								flexShrink={0}
								height="36px"
								px={4}
							>
								{__('Activate License', 'gameengine')}
							</Button>
						</Flex>

						<Text fontSize="14px" color="var(--gameengine-gray-color)" margin={0}>
							{createInterpolateElement(
								__("Don't have a license key? <PurchaseLink/>", 'gameengine'),
								{
									PurchaseLink: (
										<a
											href={PURCHASE_URL}
											target="_blank"
											rel="noopener noreferrer"
											style={{ color: 'var(--gameengine-primary)' }}
										>
											{__('Purchase one here', 'gameengine')}
										</a>
									),
								}
							)}
						</Text>
					</Flex>
				)}
			</>

			<HireUs sdk={SeSdk} />
		</>
	);
};

const MetaItem = ({ label, value, valueColor }) => (
	<Flex direction="column" alignItems="flex-start" gap={1}>
		<Text fontSize="12px" color="var(--gameengine-gray-color)" fontWeight="400" margin={0}>
			{label}
		</Text>
		{typeof value === 'string' || typeof value === 'number' ? (
			<Text fontSize="13px" fontWeight="600" color={valueColor || 'var(--gameengine-font-color)'} margin={0}>
				{value}
			</Text>
		) : (
			value
		)}
	</Flex>
);

export default License;
