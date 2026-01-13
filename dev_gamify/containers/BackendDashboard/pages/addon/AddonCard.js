import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import CustomSwitch from '@GFComponents/CustomSwitch';
import { toggleAddonStatus } from '../../../../redux/Slices/addonsSlice/addonsSlice';
import { resetStatus as resetPointStatus } from '../../../../redux/Slices/pointTypesSlice/pointTypeSlice';
import { resetStatus as resetAchievementStatus } from '../../../../redux/Slices/achivementSlice/achievementsSlice';
import { fetchTriggers as refreshPointTriggers } from '../../../../redux/Slices/pointTypesSlice/pointTypeSlice';
import { fetchTriggers as refreshAchievementTriggers } from '../../../../redux/Slices/achivementSlice/achievementsSlice';

const AddonCard = ({ item }) => {
	const dispatch = useDispatch();

	// Redux State 
	const { activeAddons = [] } = useSelector(state => state.addons || {});
	const isReduxActive = activeAddons?.includes(item.name);

	// Local State for Instant UI Update (Optimistic UI)
	const [localChecked, setLocalChecked] = useState(isReduxActive);
	const [isUpdating, setIsUpdating] = useState(false);

	// Redux 
	useEffect(() => {
		setLocalChecked(isReduxActive);
	}, [isReduxActive]);

	const onChangeHandler = async (e) => {
		const newStatus = e.target.checked;

		setLocalChecked(newStatus);
		setIsUpdating(true);

		const result = await dispatch(toggleAddonStatus({
			addon: item.name,
			status: newStatus
		}));


		if (toggleAddonStatus.fulfilled.match(result)) {
			// 🔥 Force trigger refresh on other pages
			dispatch(resetPointStatus());
			dispatch(resetAchievementStatus());
			dispatch(refreshPointTriggers());
			dispatch(refreshAchievementTriggers());

			// No reload needed now!
		} else {
			setLocalChecked(!newStatus);
			alert(__("Failed to update status.", "gamify"));
		}

		setIsUpdating(false);
	};

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
						<Box pointerEvents={isUpdating ? 'none' : 'auto'} opacity={isUpdating ? 0.6 : 1}>
							<CustomSwitch
								name={item.name}
								value={localChecked} // For custom logic
								checked={localChecked} // Standard HTML attribute
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
