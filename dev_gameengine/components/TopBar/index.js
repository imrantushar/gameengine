import React from 'react';
import { Box, Flex, Image } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { plugin_root_url } from '@GFUtils/helper';

import './styles.scss';

const TopBar = ({
	rightContent,
	middleContent,
	leftContent,
	path,
	topPosition="32px"
}) => {
	const pathName = path ? path : __("GameEngine", "gameengine");

	return (
		<React.Fragment>
			<Flex
				direction={{ base: 'column', md: 'row' }}
				justifyContent="space-between"
				align={{ base: 'flex-start', md: 'center' }}
				bg="var(--gameengine-background)"
				boxShadow={'var(--gameengine-shadow)'}
				width="100%"
				position="sticky"
				top={topPosition}
				mb="24px"
				p="20px 24px"
				zIndex={999}
				className='gameengine-topbar'
			>
				{leftContent ? (
					leftContent
				) : (
					<Flex align="center" gap={2}>
						<Image
							maxW={'36px'}
							height={'auto'}
							src={plugin_root_url + 'assets/images/logo.svg'}
						/>
						<Box width="4px" height="6px" bg="var(--gameengine-primary)" />
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
