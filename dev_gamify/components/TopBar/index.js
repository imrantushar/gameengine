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
	const isPlainPermalink=''
	return (
		<React.Fragment>
			{isPlainPermalink && (
				<Flex
					px={6}
					py={4}
					alignItems="center"
					gap={4}
					width="100%"
					boxShadowColor={'var(--gamify-shadow)'}
					bg="var(--gamify-background)"
				>
					<Box
						bg="var(--gamify-warning)"
						borderRadius="full"
						p="12px 14px"
					>
						<Span className='gamify-icon gamify-icon--circle-alert has-gamify-blue-bg' _before={{ fontSize: '20px' }} />
					</Box>
					<Text
						m={0}
						dangerouslySetInnerHTML={{
							__html: __(
								'Your permalink settings is set to <code>plain</code>. Please update your permalink settings. gamify works better with search engine friendly permalink.',
								'gamify'
							),
						}}
					/>

					<Button {...primaryBtn} onClick={() => window.location.href = `${window.location.origin}/wp-admin/options-permalink.php`}>
						{__('Update permalink', 'gamify')}
					</Button>
				</Flex>
			)}
			<Flex
				style={topBarStyles}
				direction={{ base: 'column', md: 'row' }}
				justifyContent="space-between"
				align={{ base: 'flex-start', md: 'center' }}
				px={6}
				py={4}
				mb={6}
				borderTop={isPlainPermalink ? "1px solid var(--gamify-border-color)" : "none"}
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
