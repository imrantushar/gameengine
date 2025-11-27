import React, { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Text, Button, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { sliceString } from '@Utils/helper';
import { clearBtn, clearPrimaryBtn } from '../../../assets/scss/chakra/recipe';

const GFLabel = ({
	type = "title",
	label = "",
	fontSize = "",
	fontWeight = "",
	textTransform = "",
	margin = "",
	padding = "",
	color = "",
	bg = "",
	borderRadius = "",
	href = null,
	textAlign = "",
	borderBottomWidth = "",
	borderColor = "",
	icon,
	whiteSpace = "",
	lineClamp = "",
	truncate,
	lineHeight,
	enableSlice = false,
	sliceLength = 100,
	sliceMore = '...',
	showToggle = true,
	seeMoreText = __('See more', 'gamifymunity'),
	seeLessText = __('See less', 'gamifymunity'),
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const variantStyles = {
		heading: {
			fontSize: "24px",
			fontWeight: "600",
			color: "var(--gamify-font-color)",
		},
		title: {
			fontSize: "sm",
			fontWeight: "medium",
			color: "var(--gamify-font-color)",
		},
		subtitle: {
			fontSize: "sm",
			fontWeight: "normal",
			color: "gray.600",
		},
		miniTitle: {
			fontSize: "xs",
			fontWeight: "normal",
			color: "gray.600",
		},
		basic: {
			fontSize: "14px",
			fontWeight: "500",
			color: "var(--gamify-font-color)",
		},
		simple: {
			fontSize: "14px",
			fontWeight: "400",
			color: "var(--gamify-gray-color)",
		},
		simpleLight: {
			fontSize: "12px",
			fontWeight: "400",
			color: "var(--gamify-gray-color)",
		},
		bold: {
			fontSize: "16px",
			fontWeight: "500",
			color: "var(--gamify-font-color)",
		},
		boldLight: {
			fontSize: "16px",
			fontWeight: "500",
			color: "var(--gamify-gray-color)",
		},
		inputLabel: {
			fontSize: "14px",                 
			fontWeight: "600",              
			fontStyle: "normal",
			lineHeight: "20px",
			color: "var(--gamify-font-color)", 
		}
		
	};

	const styles = variantStyles[type] || variantStyles?.title;

	const textProps = {
		fontSize: fontSize || styles?.fontSize,
		fontWeight: fontWeight || styles?.fontWeight,
		textTransform: textTransform,
		color: color || styles?.color,
		bg: bg,
		borderRadius: borderRadius,
		margin: margin,
		padding: padding,
		fontFamily: "var(--gamify-font)",
		textAlign: textAlign,
		borderBottomWidth: borderBottomWidth,
		borderColor: borderColor,
		whiteSpace: whiteSpace,
		truncate: truncate,
		lineClamp: lineClamp,
		lineHeight: lineHeight,
		margin:'0'
	};

	const needsSlicing = enableSlice && label && label.length > sliceLength;

	const getDisplayText = () => {
		if (!enableSlice || !needsSlicing) {
			return label;
		}

		if (isExpanded) {
			return label;
		}

		return sliceString(label, sliceLength, sliceMore);
	};

	const displayText = getDisplayText();

	const toggleExpansion = () => {
		setIsExpanded(!isExpanded);
	};

	const renderContent = () => {
		if (href) {
			return (
				<Button {...clearBtn}>
					<Link to={href} color="var(--gamify-primary-color)">
						{displayText}
					</Link>
				</Button>
			);
		}

		if (icon) {
			return (
				<Flex alignItems="center" gap="2">
					{icon} {displayText}
				</Flex>
			);
		}

		return displayText;
	};

	return (
		<>
			<Text  {...textProps}>
				{renderContent()}

				{enableSlice && needsSlicing && showToggle && !href && (
					<Button
						{...clearPrimaryBtn}
						fontSize="14px"
						fontWeight="400"
						lineHeight="24px"
						variant="plain"
						size="md"
						marginLeft={1}
						onClick={toggleExpansion}
					>
						{isExpanded ? seeLessText : seeMoreText}
					</Button>
				)}
			</Text>
		</>
	);
};

export default GFLabel;
