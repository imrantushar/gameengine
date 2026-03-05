import React from 'react';
import { __ } from '@wordpress/i18n';
import { Flex, Text } from '@chakra-ui/react';

const GFLabel = ({
	type = "title",
	label = "",
	fontSize,
	fontWeight,
	textTransform,
	margin,
	padding,
	color,
	bg,
	borderRadius,
	textAlign,
	borderBottom,
	borderColor,
	whiteSpace,
	lineHeight,
	width,
	isPro = false,
}) => {
	const variantStyles = {
		heading: {
			fontSize: "20px",
			fontWeight: "500",
			color: "var(--gameengine-font-color)",
			lineHeight: "30px",
			margin: "0 0 24px 0",
			padding: "0 0 24px 0",
			borderBottom: "1px solid var(--gameengine-border-color)",
		},
		plainHeading: {
			fontSize: "20px",
			fontWeight: "500",
			color: "var(--gameengine-font-color)",
			lineHeight: "30px",
			margin: "0 0 24px 0",
			padding: "0",
			borderBottom: "none",
		},
		title: {
			fontSize: "14px",
			fontWeight: "600",
			lineHeight: "20px",
			color: "var(--gameengine-font-color)",
			margin: "0",
		},
		input: {
			fontSize: "14px",
			fontWeight: "500",
			lineHeight: "20px",
			color: "var(--gameengine-font-color)",
			margin: "0",
		},
		subtitle: {
			fontSize: "12px",
			fontWeight: "400",
			lineHeight: "16px",
			color: "#101828",
			margin: "0"
		},
		basic: {
			fontSize: "14px",
			fontWeight: "500",
			color: "var(--gameengine-font-color)",
		},
		label: {
			fontSize: "14px",
			fontWeight: "400",
			color: "var(--gameengine-font-color)",
		},
		simple: {
			fontSize: "14px",
			fontWeight: "400",
			lineHeight: "16px",
			color: "#738496",
			margin: "0"
		},
	};

	const styles = variantStyles[type] || variantStyles.title;

	const textProps = {
		fontFamily: "var(--gameengine-font)",
		fontSize: fontSize ?? styles.fontSize,
		fontWeight: fontWeight ?? styles.fontWeight,
		color: color ?? styles.color,
		lineHeight: lineHeight ?? styles.lineHeight,
		margin: margin ?? styles.margin,
		padding: padding ?? styles.padding,
		borderBottom: borderBottom ?? styles.borderBottom,
		textTransform,
		bg,
		borderRadius,
		textAlign,
		borderColor,
		whiteSpace,
		width,
	};

	if (isPro) {
		return (
			<Flex
				alignItems="center"
				{...textProps}
			>
				<Text {...textProps}>{label}</Text>
				{isPro && (
					<Text
						background="#FFA943"
						margin={0}
						marginLeft={'8px'}
						color="#fff"
						borderRadius="2px"
						padding="3px 6px"
						fontSize="10px"
						lineHeight="1"
						textTransform="uppercase"
						display="inline-flex"
						alignItems="center"
					>{__("PRO", 'gameengine')}</Text>
				)}
			</Flex>
		)
	}

	return (
		<Text {...textProps}>
			{label}
		</Text>
	);
};

export default GFLabel;
