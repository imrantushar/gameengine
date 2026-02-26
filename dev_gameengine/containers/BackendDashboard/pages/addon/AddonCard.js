import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { __, sprintf } from '@wordpress/i18n';
import { Badge, Box, Button, Flex, Icon, Separator, Text, Image } from '@chakra-ui/react';
import CustomSwitch from '@GFComponents/CustomSwitch';
import { fetchAddons, saveAddon } from '@GFRedux//Slices/addonsSlice/addonsSlice';
import { useFormikContext } from 'formik';
import { admin_url, is_pro } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { fetchSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';
import Tooltip from '@GFComponents/Tooltip';
import { LuInfo, LuLock, LuSettings } from 'react-icons/lu';
import { Link } from 'react-router-dom';

const AddonCard = ({ item, index, value }) => {
	const { values, setFieldValue } = useFormikContext()
	const [updating, setUpdating] = useState(false);
	const dispatch = useDispatch();

	const onChangeHandler = () => {
		setUpdating(true)
		const status = !value;
		dispatch(saveAddon({ addon: item.name, status })).then(({ payload }) => {
			if(payload) {
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

					setUpdating(false)
					dispatch(fetchSettings());
					// window.location.reload();
				} else {
					setFieldValue(item.name, false);
					dispatch(
						showNotification({
							message: payload.data,
							isShow: true,
							type: 'error',
						})
					);
					setUpdating(false)
				}
			}
		});
	};

	const isShowProTag = !is_pro && item.is_pro;
    const showSwitch    = !item.is_coming_soon && !isShowProTag;
	const showSettings = item?.route && !item.is_coming_soon && values[item.name] === true;
	const getIconBorder = () => {
		if (item.name === 'certificates') return '1px solid #7b68ee';
		if (item.name === 'storeengine') return '1px solid #008dff';
		if (item.name === 'woocommerce') return '1px solid #873eff';
		return '1px solid #e2e8f0';
	};

	return (
		<Flex
			width="calc((100% / 3) - 16px)"
			background="#FFF"
			boxShadow="var(--gameengine-shadow)"
			padding="24px 0"
			flexDirection="column"
			borderRadius="4px"
		>
			<Flex justifyContent="space-between" width="100%" height="50px" padding="0 24px">
				<Box p={2} border={getIconBorder()} borderRadius="4px">
					{item.icon ? item.icon : (
						<Image src={item.image} />
					)}
				</Box>
				{showSettings ? (
				<Link to={admin_url + item?.route}>
					<Icon as={LuSettings} boxSize="20px" />
				</Link>
				) : (
				<Box height="fit-content">
					{isShowProTag && (
					<Badge colorScheme="green" padding="4px 12px" borderRadius="10px">
						{__('Pro', 'gameengine')}
					</Badge>
					)}

					{item.is_coming_soon && (
					<Badge colorPalette="orange" padding="4px 12px" borderRadius="10px">
						{__('Coming Soon', 'gameengine')}
					</Badge>
					)}
				</Box>
				)}
			</Flex>

			<Flex direction="column" justifyContent="space-between" gap={2} minH="124px" p="16px 24px">
				<Flex flexDirection="column" gap={1}>
					<Text fontSize="14px" fontWeight="500" color="var(--gameengine-font-color)" m={0}>{item.label}</Text>
					<Text fontSize="12px" fontWeight="400" color="#738496" m={0}>{item.details}</Text>
				</Flex>

				<Button variant="link" color="var(--gameengine-primary)" fontSize="14px" fontWeight="500" padding="0" height="auto" justifyContent="start" onClick={() => window.open(item.docsUrl, '_blank')}>
					{__('Learn More', 'gameengine')}
				</Button>
			</Flex>

			<Separator borderColor="var(--gameengine-border-color)" />

			{item.required_plugin ? (
				<Flex justifyContent="space-between" alignItems="center" gap="4px" width="100%" p="16px 24px 0 24px">
					{item?.required_plugin?.length > 0 && (
						item.required_plugin.map((childItem, childItemIndex) => (
							<Flex alignItems="center" gap={2}>
								<Text fontSize="14px" fontWeight="500" color="var(--gameengine-font-color)" m={0}>
									{__('Required plugins', 'gameengine')}
								</Text>
								<Tooltip
									content={
										<Text fontSize="14px" fontWeight="400" m={0} key={childItemIndex}>
											{childItem.plugin_name}
										</Text>
									}
								>
									<LuInfo />
								</Tooltip>
							</Flex>
						))
					)}

					{!item.is_coming_soon && (
						<Box pointerEvents={updating ? 'none' : 'auto'} opacity={updating ? 0.6 : 1}>
							{showSwitch ? (
							<CustomSwitch
								name={item.name}
								value={values[item.name]}
								onChange={onChangeHandler}
							/>
							) : isShowProTag ? (
							<Icon as={LuLock} boxSize="20px" color="gray.600" />
							) : null}
						</Box>
					)}
				</Flex>
			) : (
				<Flex justifyContent="space-between" alignItems="flex-end" gap="4px" width="100%" p="16px 24px 0 24px">
					<Text fontSize="14px" fontWeight="500" color="var(--gameengine-font-color)" m={0}>
						{__('No extra plugin required', 'gameengine')}
					</Text>

					{!item.is_coming_soon && (
						<Box pointerEvents={updating ? 'none' : 'auto'} opacity={updating ? 0.6 : 1}>
							{showSwitch ? (
							<CustomSwitch
								name={item.name}
								value={values[item.name]}
								onChange={onChangeHandler}
							/>
							) : isShowProTag ? (
							<Icon as={LuLock} boxSize="20px" color="gray.600" />
							) : null}
						</Box>
					)}	
				</Flex>
			)}
		</Flex>
	);
};

export default AddonCard;
