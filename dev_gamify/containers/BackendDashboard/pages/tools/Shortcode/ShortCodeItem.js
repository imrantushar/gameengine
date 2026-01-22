import React, { useRef } from 'react';

import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { Box, Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { clearBtn } from '../../../../../../assets/scss/chakra/recipe';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { FaRegCopy } from 'react-icons/fa6';
import { AiOutlineQuestion } from 'react-icons/ai';

const ShortCodeItem = ({ shortCodeItem }) => {
	const { title, shortCode, description, url } = shortCodeItem;
	const shortCodeRef = useRef(null);
	const dispatch = useDispatch();
	const copyToClipboard = (e) => {
		shortCodeRef.current.select();
		document.execCommand('copy');
		e.target.focus();
		dispatch(
			showNotification({
				message: __('Copied', 'academy'),
				isShow: true,
				type: 'success',
			})
		);
	};

	return (
		<Flex className="academy-short-code-item" justify={'space-between'} align={'flex-start'} paddingBottom={'24px'}>
			<Box className="academy-short-code-item__info" width={'100%'}>
				<GFLabel type="title" margin={0} label={title} />
			</Box>
			<Flex className="academy-short-code-item__body" direction={'column'} width={'100%'}>
				<Flex className="academy-short-code-details" align={'center'} gap={'20px'}>
					<Flex className="academy-short-code-text" width={'100%'} align={'center'}>
						<Input
							type="text"
							ref={shortCodeRef}
							className="academy-short-code-text__shortcode"
							name={shortCode}
							value={shortCode}
							readOnly
							border={'1px solid var(--gamify-border-color) !important'}
							borderTopRightRadius={'0 !important'}
							borderBottomRightRadius={'0 !important'}
							borderRight={'none !important'}
							outline={'none'}
							boxShadow={"none !important"}
						/>
						<Button
							onClick={copyToClipboard}
							className="academy-btn--copy"
							{...clearBtn}
							border={'1px solid var(--gamify-border-color)'}
							borderRadius={'4px'}
							borderTopLeftRadius={'0 !important'}
							borderBottomLeftRadius={'0 !important'}
							height={'40px'}
						>
							<Icon as={FaRegCopy} />
						</Button>
					</Flex>
					<Button
						className="academy-btn--link"
						as={'a'}
						link={url}
						target="_blank"
						type="link"
						{...clearBtn}
						border={'1px solid var(--gamify-border-color)'}
						borderRadius={'50%'}
						width={'40px'}
						height={'40px'}
					>
						<Icon as={AiOutlineQuestion} />
					</Button>
				</Flex>
				<Flex className="academy-short-code-description" paddingTop={'4px'}>
					<Flex wordBreak={'break-all'}>
						<Text
							fontWeight={"400"}
							fontStyle={"italic"}
							fontSize={"12px"}
							lineHeight={"22px"}
							color={"#707070"}
							margin={"0"}
						>
							{__('You can use: ', 'academy') + description}
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default ShortCodeItem;
