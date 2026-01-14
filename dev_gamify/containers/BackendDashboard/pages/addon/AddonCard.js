import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { __, sprintf } from '@wordpress/i18n';
import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import CustomSwitch from '@GFComponents/CustomSwitch';
import { fetchAddons, saveAddon } from '@GFRedux//Slices/addonsSlice/addonsSlice';
import { useFormikContext } from 'formik';
import { is_pro } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { fetchSettings } from '@GFRedux/Slices/settingsSlice/settingsSlice';

const AddonCard = ({ item, index, value }) => {
	const {values,setFieldValue } = useFormikContext()
	const [updating, setUpdating] = useState(false);
	const dispatch = useDispatch();

	const onChangeHandler = () => {
		setUpdating(true)
		const status = !value;
		dispatch(saveAddon({ addon: item.name, status })).then(({ payload }) => {
			console.log({payload})
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
		});
	};

	// const isShowProTag = !is_pro && item.is_pro;

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
			boxShadow="var(--gamify-shadow)"
			padding={6}
			flexDirection="column"
			borderRadius="4px"
		>
			<Flex justifyContent="space-between" width="100%" height="50px">
				<Box p={2} border={getIconBorder()} borderRadius="4px">
					{item.icon}
				</Box>
				<Box height="fit-content">
					{item.is_pro && (
						<Badge colorScheme="green" padding="4px 12px" borderRadius="10px">
							{__('Pro', 'gamify')}
						</Badge>
					)}
					{item.is_coming_soon && (
						<Badge colorPalette="orange" padding="4px 12px" borderRadius="10px">{__('Coming Soon', 'gamify')}</Badge>
					)}
				</Box>
			</Flex>

			<Flex direction="column" justifyContent="space-between" gap={2} minH="124px" p="16px 0">
				<Flex flexDirection="column" gap={1}>
					<Text fontSize="14px" fontWeight="500" color="var(--gamify-font-color)" m={0}>{item.label}</Text>
					<Text fontSize="12px" fontWeight="400" color="#738496" m={0}>{item.details}</Text>
				</Flex>

				<Button variant="link" color="var(--gamify-primary)" fontSize="14px" fontWeight="500" padding="0" height="auto" justifyContent="start" onClick={() => window.open(item.docsUrl, '_blank')}>
					{__('Learn More', 'gamify')}
				</Button>
			</Flex>

			<Flex direction="column" gap="8px" paddingTop={6} borderTop="1px solid var(--gamify-border-color)">
				<Text fontSize="14px" fontWeight="500" color="var(--gamify-font-color)" m={0}>
					{!item.required_plugin ? __('No extra plugin required', 'gamify') : __('Required plugins', 'gamify')}
				</Text>

				<Flex justifyContent="space-between" alignItems="center" width="100%">
					{item?.required_plugin?.length > 0 && (
						<>
							{item.required_plugin.map((childItem, childItemIndex) => (
								<Text fontSize="14px" fontWeight="400" color="#738496" m={0} key={childItemIndex}>
									{childItem.plugin_name}
								</Text>
							))}
						</>
					)}

					{!item.is_coming_soon && (
						<Box pointerEvents={updating ? 'none' : 'auto'} opacity={updating ? 0.6 : 1}>
							<CustomSwitch
								name={item.name}
								value={values[item.name]} // Standard HTML attribute
								onChange={onChangeHandler}
							/>
						</Box>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
};

export default AddonCard;
