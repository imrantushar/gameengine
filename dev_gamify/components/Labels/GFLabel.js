import React from 'react';
import { __ } from '@wordpress/i18n';
import { Text, Button } from '@chakra-ui/react';
import { clearBtn } from '../../../assets/scss/chakra/recipe';
import { Link } from 'react-router-dom';

const GFLabel = ( {
	type = 'title',
	label = '',
	as = '',
	fontSize = '',
	fontWeight = '',
	margin = '0',
	padding = '',
	href = null,
	color,
} ) => {
	const variantStyles = {
		title: {
			fontSize: 'md',
			fontWeight: 'medium',
			color: 'var(--gamify-font-color)',
		},
		subtitle: {
			fontSize: 'sm',
			fontWeight: 'normal',
			color: 'var(--gamify-text-muted)',
		},
		miniTitle: {
			fontSize: 'xs',
			fontWeight: 'medium',
			color: 'var(--gamify-text-muted)',
		},
	};

	const styles = variantStyles[ type ] || variantStyles.title;

	const textProps = {
		fontSize: fontSize || styles.fontSize,
		fontWeight: fontWeight || styles.fontWeight,
		margin,
		padding,
		fontFamily: 'var(--gamify-font)',
		as,
		color: color || styles.color,
	};

	return (
		<>
			{ href ? (
				<Button { ...clearBtn }>
					<Link to={ href } color="var(--gamify-font-color)">
						<Text { ...textProps } _hover={ { color: '#4F46E5' } }>
							{ `${ label }` }
						</Text>
					</Link>
				</Button>
			) : (
				<Text { ...textProps }>{ `${ label }` }</Text>
			) }
		</>
	);
};

export default GFLabel;
