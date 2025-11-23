import React from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, Box, Span, Text } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
// import { isPlainPermalink } from '@Utils/helper';
import GFLabel from '@Components/Labels/GFLabel';
import { primaryBtn } from '../../../assets/scss/chakra/recipe';

import './styles.scss';

const propTypes = {
	title: PropTypes.string,
	render: PropTypes.func,
	rightContent: PropTypes.func,
	leftContent: PropTypes.func,
};

const TopBar = ({
	title = '',
	render = () => null,
	rightContent = () => null,
	middleContent = () => null,
	leftContent = () => null,
	topBarStyles = {},
}) => {
	// if (!is_admin) return null;
	return (
		<React.Fragment>
			<Flex
				style={topBarStyles}
				direction={{ base: 'column', md: 'row' }}
				justifyContent="space-between"
				align={{ base: 'flex-start', md: 'center' }}
				height='80px'
				px={6}
				py={4}
				mb={6}
				top="32px"
				borderBottomWidth="1px"
				borderColor="var(--gamify-border-color)"
				boxShadowColor={'var(--gamify-shadow)'}
				width="100%"
				bg="var(--gamify-background)"
				position="sticky"
				zIndex={999}
			>
				<Flex
					alignItems="center"
					gap={3}
					flexWrap="wrap"
					width="fit-content"
				>
					{render()}
					{title ? (
						<GFLabel
							label={title}
							fontSize="md"
							fontWeight="medium"
						/>
					) : null}
					{leftContent()}
				</Flex>

				{middleContent()}

				<Flex align="center" gap={2}>
					{rightContent()}
					{ /* <Button
					bg="transparent"
					borderWidth="1px"
					borderColor="var(--gamify-border-color)"
					padding="5px"
					onClick={toggleTheme}
				>
					<span
						className={`easy-content-manager-icon easy-content-manager-icon--${isDark ? 'moon' : 'sun'}`}
					/>
				</Button> */ }
				</Flex>
			</Flex>
		</React.Fragment>
	);
};

TopBar.propTypes = propTypes;
export default TopBar;
