import React, { useRef, useEffect, useState } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const Button = ( {
	className = '',
	label = '',
	size = 'sm',
	preset = 'purple',
	onClick,
	type = 'button',
	isLoading = false,
	loadingLabel = undefined,
	icon = undefined,
	iconPosition = undefined,
	isCircle = false,
	border = undefined,
	isDisabled = false,
	borderRadius = undefined,
	style = {},
	link = '#',
	suffix = '',
	target = undefined,
	isPro = true,
	ariaLabel = '',
	ariaHidden = false,
	id,
	...rest
} ) => {
	const [ btnWidth, setBtnWidth ] = useState( null );
	const btnRef = useRef( null );

	useEffect( () => {
		if ( btnRef.current && ! isLoading && ! btnWidth ) {
			setBtnWidth( btnRef.current.offsetWidth );
		}
	}, [ btnWidth, isLoading ] );

	const buildClassName = () => {
		if ( className ) return className;
		return [
			'gameengine-btn',
			size && `gameengine-btn--${ size }`,
			preset && `gameengine-btn--preset-${ preset }`,
			iconPosition && icon && ! isLoading && `gameengine-btn--icon-${ iconPosition }`,
			border && `gameengine-btn--border-${ border }`,
			borderRadius && `gameengine-btn--border-${ borderRadius }`,
			suffix && `gameengine-btn--${ suffix }`,
			isCircle && 'gameengine-btn--circle',
			isDisabled && 'gameengine-btn--disabled',
		].filter( Boolean ).join( ' ' );
	};

	const buttonProps = {
		...rest,
		id,
		style: {
			...style,
			...( isLoading && btnWidth ? { width: `${ btnWidth }px` } : {} ),
		},
		disabled: isDisabled || isLoading,
	};

	if ( onClick && typeof onClick === 'function' ) {
		buttonProps.onClick = onClick;
	}
	if ( ariaLabel ) buttonProps[ 'aria-label' ] = ariaLabel;
	if ( ariaHidden ) buttonProps[ 'aria-hidden' ] = ariaHidden;

	const Component = type === 'link' ? 'a' : 'button';

	if ( type === 'link' ) {
		buttonProps.href = link;
		buttonProps.target = target;
		buttonProps.rel = 'noreferrer';
	} else {
		buttonProps.type = type;
	}

	return (
		<Component ref={ btnRef } className={ buildClassName() } { ...buttonProps }>
			{ iconPosition !== 'right' && ! isLoading && icon }
			{ isLoading ? (
				<>
					<Spinner />
					{ loadingLabel && (
						<span className="gameengine-btn--label">{ loadingLabel }</span>
					) }
				</>
			) : (
				label && <span className="gameengine-btn--label">{ label }</span>
			) }
			{ iconPosition === 'right' && ! isLoading && icon }
			{ ! isPro && (
				<span className="gameengine-pro-badge">
					{ __( 'PRO', 'gameengine' ) }
				</span>
			) }
		</Component>
	);
};

Button.displayName = 'Button';
export default Button;
