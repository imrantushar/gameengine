import React from 'react';
import { __ } from '@wordpress/i18n';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import { plugin_root_url } from '@GFUtils/helper';
import { employeeBatch1, employeeBatch2, employeeBatch3 } from './helper';

const batches = [ employeeBatch1, employeeBatch2, employeeBatch3 ];

const HireUs = () => {
	return (
		<Flex
			alignItems="center"
			justifyContent="space-between"
			gap={ 6 }
			flexWrap="wrap"
			padding={{ base: 4, md: 6 }}
			background="#FFF"
			boxShadow="var(--gameengine-shadow)"
			borderRadius="4px"
			mt="24px"
		>
			<Box flex="1" minW="220px">
				<Text
					fontSize="20px"
					fontWeight="500"
					color="var(--gameengine-font-color)"
					lineHeight="30px"
					m={ 0 }
					mb={ '8px !important' }
				>
					{ __( 'Need Expert Help? Hire Our Professionals', 'gameengine' ) }
				</Text>
				<Text
					fontSize="14px"
					fontWeight="400"
					color="var(--gameengine-secondary)"
					lineHeight="20px"
					m={ 0 }
					maxW={'85%'}
				>
					{ __(
						'Get access to a skilled team of designers, developers, marketers, and content experts—ready to bring your ideas to life.',
						'gameengine'
					) }
				</Text>
				<Flex gap={ 3 } alignItems="center" marginTop={'24px'}>
					<Button
						as="a"
						href="https://kodezen.agency/request-a-free-call/"
						target="_blank"
						rel="noopener noreferrer"
						bg="var(--gameengine-primary)"
						color="white"
						height="40px"
						px={ 5 }
						fontSize="14px"
						fontWeight="500"
						borderRadius="4px"
						_hover={ { color: "white", bg: 'var(--gameengine-primary)', opacity: 0.9 } }
						cursor="pointer"
					>
						{ __( 'Hire Us', 'gameengine' ) }
					</Button>
					<Button
						as="a"
						href="https://kodezen.agency/"
						target="_blank"
						rel="noopener noreferrer"
						bg="transparent"
						color="var(--gameengine-secondary)"
						height="40px"
						px={ 5 }
						fontSize="14px"
						fontWeight="500"
						borderRadius="4px"
						border="1px solid"
						borderColor="gray.300"
						_hover={ { bg: 'gray.50' } }
						cursor="pointer"
					>
						{ __( 'Learn More', 'gameengine' ) }
					</Button>
				</Flex>
			</Box>

			{/* Right: avatar grid */}
			<Flex direction="column" gap={ 2 } flexShrink={ 0 }>
				{ batches.map( ( batch, batchIndex ) => (
					<Flex key={ batchIndex } gap={ 2 } alignItems="center" justifyContent={'center'}>
						{ batch.map( ( emp ) => (
							<Image
								key={ emp.name }
								src={ plugin_root_url + emp.src}
								alt={ emp.name }
								title={ emp.name }
								boxSize="40px"
								borderRadius="full"
								objectFit="cover"
								border="2px solid white"
								boxShadow="0 0 0 1px var(--chakra-colors-gray-200)"
								flexShrink={ 0 }
							/>
						) ) }
					</Flex>
				) ) }
			</Flex>
		</Flex>
	);
};

export default HireUs;
