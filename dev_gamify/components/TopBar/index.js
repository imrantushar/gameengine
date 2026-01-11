import React from 'react';
import { Flex } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';

import './styles.scss';

const TopBar = ({
	rightContent = () => null,
	middleContent = () => null,
	leftContent = () => null,
}) => {
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
				{leftContent ? leftContent() : null}

				{middleContent ? middleContent() : null}

				{rightContent ? rightContent() : null}
			</Flex>
		</React.Fragment>
	);
};

export default TopBar;
