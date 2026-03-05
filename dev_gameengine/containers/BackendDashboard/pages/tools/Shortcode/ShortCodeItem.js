import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { Box, Button, Flex, Icon, Input, Span, Text } from '@chakra-ui/react';
import { clearBtn } from '../../../../../../assets/scss/chakra/recipe';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { FaRegCopy } from 'react-icons/fa6';
import { AiOutlineQuestion } from 'react-icons/ai';

const ShortCodeItem = ({ shortCodeItem }) => {
	const { title, subtitle, shortCode, description, url, isPro } = shortCodeItem;
	const shortCodeRef = useRef(null);
	const dispatch = useDispatch();

	const copyToClipboard = (e) => {
		if (isPro) return;
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
		<Flex
			className="academy-short-code-item"
			justify={'space-between'}
			align={'flex-start'}
			paddingBottom={'24px'}
		>
			<Box className="academy-short-code-item__info" width={'100%'}>
				<GFLabel
					type="title"
					margin={0}
					label={title}
					isPro={isPro}
				/>
				<GFLabel type="subtitle" margin={0} label={subtitle} />
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
							disabled={isPro}
							border={'1px solid var(--gameengine-border-color) !important'}
							borderTopRightRadius={'0 !important'}
							borderBottomRightRadius={'0 !important'}
							borderRight={'none !important'}
							outline={'none'}
							boxShadow={'none !important'}
							cursor={isPro ? 'not-allowed' : 'text'}
						/>
						<Button
							onClick={copyToClipboard}
							className="academy-btn--copy"
							{...clearBtn}
							border={'1px solid var(--gameengine-border-color)'}
							borderRadius={'4px'}
							borderTopLeftRadius={'0 !important'}
							borderBottomLeftRadius={'0 !important'}
							height={'40px'}
							disabled={isPro}
							cursor={isPro ? 'not-allowed' : 'pointer'}
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
						border={'1px solid var(--gameengine-border-color)'}
						borderRadius={'50%'}
						width={'40px'}
						height={'40px'}
						disabled={isPro}
						cursor={isPro ? 'not-allowed' : 'pointer'}
					>
						<Icon as={AiOutlineQuestion} />
					</Button>
				</Flex>
				<Flex className="academy-short-code-description" paddingTop={'4px'}>
					<Flex wordBreak={'break-all'}>
						<Text
							fontWeight={'400'}
							fontStyle={'italic'}
							fontSize={'12px'}
							lineHeight={'22px'}
							color={'#707070'}
							margin={'0'}
						>
							{__('You can use: ', 'academy') + shortCode} <br /> {description}
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex >
	);
};

export default ShortCodeItem;