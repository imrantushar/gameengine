import React from 'react';
import { __ } from '@wordpress/i18n';
import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import CustomSwitch from '@GFComponents/CustomSwitch';
import Tooltip from '@GFComponents/Tooltip';

const AddonCard = ( { item, index, value, setFieldValue } ) => {
	const allAddons = [];

	const onChangeHandler = () => {
		
	};

	const getIconBorder = () => {
		if ( item.name === 'certificates' ) {
			return '1px solid #7b68ee';
		} else if ( item.name === 'storeengine' ) {
			return '1px solid #008dff';
		} else if ( item.name === 'woocommerce' ) {
			return '1px solid #873eff';
		}
	};

	return (
		<Flex
			width="calc((100% / 3) - 16px)"
			background="#FFF"
			boxShadow="0 0 1px 0 rgba(20, 26, 36, 0.20), 0 1px 2px 0 rgba(20, 26, 36, 0.10)"
			padding={ 6 }
			flexDirection="column"
			borderRadius="4px"
		>
			<Flex justifyContent="space-between" width="100%" height="50px">
				<Box p={ 2 } border={ getIconBorder() } borderRadius="4px">
					{ item.icon }
				</Box>
				<Box height="fit-content">
					{ item.is_pro && (
						<Badge
							colorPalette="green"
							padding="4px 12px"
							borderRadius="10px"
						>
							{ __( 'Pro', 'gamify' ) }
						</Badge>
					) }
				</Box>
			</Flex>

			<Flex flexDirection="column" paddingTop={ 4 }>
				<Text fontSize="0.875rem" fontWeight="700">
					{ item.label }
				</Text>
				<Text fontSize="0.875rem" color="#738496">
					{ item.details }
				</Text>
			</Flex>
			<Button
				variant="plain"
				color="var(--gamify-primary)"
				fontSize="0.875rem"
				fontWeight="500"
				padding="0"
				display="flex"
				justifyContent="start"
				onClick={ () => window.open( item.docsUrl, '_blank' ) }
			>
				{ __( 'Learn More', 'gamify' ) }
			</Button>
			<Flex
				justifyContent="space-between"
				alignItems="center"
				paddingTop={ 6 }
				borderTop="1px solid #CBD1D7"
			>
				<div className="quizepress-dashboard-addon-footer--left">
					<span>
						{ ! item.required_plugin
							? __( 'No extra plugin required', 'quizepress' )
							: __( 'Required plugins', 'quizepress' ) }
					</span>
					{ item?.required_plugin?.length > 0 && (
						<Tooltip>
							{ item.required_plugin.map(
								( childItem, childItemIndex ) => (
									<span key={ childItemIndex }>
										{ childItem.plugin_name }
									</span>
								)
							) }
						</Tooltip>
					) }
				</div>
				<Box>
					{ item.is_coming_soon ? (
						<Badge colorPalette="orange">
							{ __( 'Coming Soon', 'gamify' ) }
						</Badge>
					) : (
						<CustomSwitch
							name={ item.name }
							value={ allAddons[ item.name ] }
							onChange={ onChangeHandler }
						/>
					) }
				</Box>
			</Flex>
		</Flex>
	);
};

export default AddonCard;
