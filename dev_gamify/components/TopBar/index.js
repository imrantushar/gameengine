import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { gIcon } from '@GFUtils/icons';
import GFLabel from '@GFComponents/Labels/GFLabel';

import './styles.scss';

const TopBar = ({
	rightContent,
	middleContent,
	leftContent,
	path,
}) => {
	const pathName = path ? path : __("Gamify", "gamify");

	return (
		<React.Fragment>
			<Flex
				direction={{ base: 'column', md: 'row' }}
				justifyContent="space-between"
				align={{ base: 'flex-start', md: 'center' }}
				bg="var(--gamify-background)"
				boxShadow={'var(--gamify-shadow)'}
				width="100%"
				position="sticky"
				top="32px"
				mb="24px"
				p="20px 24px"
				zIndex={999}
				className='gamify-topbar'
			>
				{leftContent ? (
					leftContent
				) : (
					<Flex align="center" gap={2}>
						{gIcon()}
						<Box width="4px" height="6px" bg="var(--gamify-primary)" />
						<GFLabel type="subtitle" fontWeight="medium" label={pathName} />
					</Flex>
				)}

				{middleContent ? middleContent : null}

				{rightContent ? rightContent : null}
			</Flex>
		</React.Fragment>
	);
};

export default TopBar;
