import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import CustomSwitch from '@GFComponents/CustomSwitch';
import Tooltip from '@GFComponents/Tooltip';
import { toggleAddonStatus } from '../../../../redux/Slices/addonsSlice/addonsSlice';

const AddonCard = ({ item }) => {
	const dispatch = useDispatch();

	// Get active status from Redux
	const { activeAddons = [] } = useSelector(state => state.addons || {});

	const isActive = activeAddons.includes(item.name);

	// Local loading state
	const [isUpdating, setIsUpdating] = useState(false);

	const onChangeHandler = async (e) => {
		setIsUpdating(true);
		const newStatus = e.target.checked;

		// Toggle Status API Call
		const result = await dispatch(toggleAddonStatus({
			addon: item.name,
			status: newStatus
		}));

		setIsUpdating(false);

		if (toggleAddonStatus.fulfilled.match(result)) {
			// Alert for feedback
			const msg = newStatus ? __("Addon Activated!", "gamify") : __("Addon Deactivated!", "gamify");
			alert(msg);

			// Reload page to register/unregister hooks for WooCommerce
			if (item.name === 'woocommerce') {
				window.location.reload();
			}
		}
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
			boxShadow="0 0 1px 0 rgba(20, 26, 36, 0.20), 0 1px 2px 0 rgba(20, 26, 36, 0.10)"
			padding={6}
			flexDirection="column"
			borderRadius="4px"
		>
			{/* Header */}
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
				</Box>
			</Flex>

			{/* Body */}
			<Flex flexDirection="column" paddingTop={4}>
				<Text fontSize="0.875rem" fontWeight="700">{item.label}</Text>
				<Text fontSize="0.875rem" color="#738496">{item.details}</Text>
			</Flex>

			<Button variant="link" color="var(--gamify-primary)" fontSize="0.875rem" fontWeight="500" padding="0" justifyContent="start" onClick={() => window.open(item.docsUrl, '_blank')}>
				{__('Learn More', 'gamify')}
			</Button>

			{/* Footer with Switch */}
			<Flex justifyContent="space-between" alignItems="center" paddingTop={6} borderTop="1px solid #CBD1D7">
				<div className="quizepress-dashboard-addon-footer--left">
					<span>{!item.required_plugin ? __('No extra plugin required', 'gamify') : __('Required plugins', 'gamify')}</span>
				</div>
				<Box>
					{item.is_coming_soon ? (
						<Badge colorScheme="orange">{__('Coming Soon', 'gamify')}</Badge>
					) : (
						<Box pointerEvents={isUpdating ? 'none' : 'auto'} opacity={isUpdating ? 0.6 : 1}>
							<CustomSwitch
								name={item.name}
								// Ensure your switch supports these props
								isChecked={isActive}
								checked={isActive}
								onChange={onChangeHandler}
							/>
						</Box>
					)}
				</Box>
			</Flex>
		</Flex>
	);
};

export default AddonCard;