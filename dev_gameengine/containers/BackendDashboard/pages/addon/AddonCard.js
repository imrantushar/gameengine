import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { __, sprintf } from '@wordpress/i18n';
import { Badge, Box, Flex, Icon, Text, Image } from '@chakra-ui/react';
import CustomSwitch from '@GFComponents/CustomSwitch';
import { fetchAddons, saveAddon } from '@GFRedux//Slices/addonsSlice/addonsSlice';
import { useFormikContext } from 'formik';
import { admin_url, is_pro } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { fetchSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import { LuSettings } from 'react-icons/lu';
import { FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { fetchAdminMenuItems } from '@GFRedux/Slices/menuSlice/menuSlice';
import KodezenTooltip from '@GFComponents/Tooltip/KodezenTooltip';
import { TbExternalLink } from 'react-icons/tb';

const AddonCard = ({ item, index, value }) => {
	const { values, setFieldValue } = useFormikContext();
	const [updating, setUpdating] = useState(false);
	const dispatch = useDispatch();

	const onChangeHandler = () => {
		setUpdating(true);
		const status = !value;
		dispatch(saveAddon({ addon: item.name, status })).then(({ payload }) => {
			if (payload) {
				if (payload?.success) {
					setFieldValue(item.name, status);
					dispatch(fetchAddons());
					const statusMessage = payload?.active_addons[item.name]
						? __('Activated', 'academy')
						: __('Deactivate', 'academy');
					dispatch(
						showNotification({
							message: sprintf(
								// translators: %1$s: AddonName, %2$s: AddonStatus
								__('%1$s successfully %2$s', 'academy'),
								item.label,
								statusMessage
							),
							isShow: true,
							type: 'success',
						})
					);
					setUpdating(false);
					dispatch(fetchSettings());
					dispatch(fetchAdminMenuItems());
				} else {
					setFieldValue(item.name, false);
					dispatch(
						showNotification({
							message: payload.data,
							isShow: true,
							type: 'error',
						})
					);
					setUpdating(false);
				}
			}
		});
	};

	const isShowProTag = !is_pro && item.is_pro;
	const showSwitch = !item.is_coming_soon && !isShowProTag;
	const showSettings = item?.route && !item.is_coming_soon && values[item.name] === true;

	const getIconBorderColor = () => {
		if (item.name === 'certificates') return '#7b68ee';
		if (item.name === 'storeengine') return '#008dff';
		if (item.name === 'woocommerce') return '#873eff';
		return '#e2e8f0';
	};

	return (
		<Flex
			width="calc((100% / 4) - 12px)"
			background="#FFF"
			boxShadow="var(--gameengine-shadow)"
			padding="16px"
			flexDirection="column"
			gap="12px"
			borderRadius="6px"
			border="1px solid var(--gameengine-border-color)"
		>
			<Flex justifyContent="space-between" alignItems="flex-start">
				<Box
					p="8px"
					border={`1px solid ${getIconBorderColor()}`}
					borderRadius="6px"
					display="flex"
					alignItems="center"
					justifyContent="center"
					width="40px"
					height="40px"
				>
					{item.icon ? (
						item.icon
					) : (
						<Image src={item.image} width="24px" height="24px" objectFit="contain" />
					)}
				</Box>

				<Flex alignItems="center" gap="8px">
					{showSettings && (
						<Link to={admin_url + item?.route}>
							<Icon as={LuSettings} boxSize="18px" color="var(--gameengine-font-color)" />
						</Link>
					)}

					{item.is_coming_soon ? (
						<Badge colorPalette="orange" padding="3px 10px" borderRadius="10px" fontSize="11px">
							{__('Coming Soon', 'gameengine')}
						</Badge>
					) : isShowProTag ? (
						<KodezenTooltip
							openerContent={
								<Icon as={FaLock} boxSize="15px" color="orange.400" />
							}
							contentWidth="fit-content"
						>
							<Text fontSize="13px" fontWeight="400" m={0}>
								{__('Available in pro', 'gameengine')}
							</Text>
						</KodezenTooltip>
					) : (
						<Box
							pointerEvents={updating ? 'none' : 'auto'}
							opacity={updating ? 0.6 : 1}
						>
							{showSwitch && (
								<CustomSwitch
									name={item.name}
									value={values[item.name]}
									onChange={onChangeHandler}
								/>
							)}
						</Box>
					)}
				</Flex>
			</Flex>

			<Flex alignItems="center" gap="6px">
				<Text
					fontSize="14px"
					fontWeight="600"
					color="var(--gameengine-font-color)"
					m={0}
					lineHeight="1.4"
				>
					{item.label}
				</Text>
				{item.docsUrl && (
					<a
						href={item.docsUrl}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							color: '#718096',
							lineHeight: 1,
						}}
					>
						<TbExternalLink size={15} color='var(--gameengine-primary)' />
					</a>
				)}
			</Flex>

			<Text
				fontSize="12px"
				fontWeight="400"
				color="#738496"
				m={0}
				lineHeight="1.6"
			>
				{item.details}
			</Text>
		</Flex>
	);
};

export default AddonCard;