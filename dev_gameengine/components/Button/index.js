import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const propTypes = {
	label: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	size: PropTypes.string,
	className: PropTypes.string,
	preset: PropTypes.string,
	bg: PropTypes.string,
	onClick: PropTypes.func,
	type: PropTypes.string,
	link: PropTypes.string,
	isLoading: PropTypes.bool,
	loadingLabel: PropTypes.string,
	loadingStatus: PropTypes.string,
	icon: PropTypes.any,
	iconPosition: PropTypes.string,
	border: PropTypes.string,
	borderRadius: PropTypes.string,
	isCircle: PropTypes.bool,
	isDisabled: PropTypes.bool,
	style: PropTypes.object,
	suffix: PropTypes.string,
	prefix: PropTypes.string,
	target: PropTypes.string,
	isPro: PropTypes.bool,
};

const Button = ( {
	label = '',
	size = 'md',
	className = '',
	preset = 'purple',
	onClick = () => {},
	type = 'button',
	link = '#',
	isLoading = false,
	loadingLabel = null,
	icon = null,
	iconPosition = null,
	isCircle = false,
	border = null,
	isDisabled = false,
	borderRadius = null,
	style = {},
	suffix = '',
	target = '',
	isPro = true,
	id,
	prefix = '',
} ) => {
	const buttonClasses = [ `gameengine-btn gameengine-btn--${ size }` ];

	if ( preset ) {
		buttonClasses.push( 'gameengine-btn--preset-' + preset );
	}
	if ( iconPosition ) {
		buttonClasses.push( 'gameengine-btn--icon-' + iconPosition );
	}
	if ( isCircle ) {
		buttonClasses.push( 'gameengine-btn--circle' );
	}
	if ( border ) {
		buttonClasses.push( 'gameengine-btn--border-' + border );
	}
	if ( borderRadius ) {
		buttonClasses.push( 'gameengine-btn--border-' + borderRadius );
	}
	if ( isDisabled ) {
		buttonClasses.push( 'gameengine-btn--disabled' );
	}
	if ( suffix ) {
		buttonClasses.push( 'gameengine-btn--' + suffix );
	}
	if ( prefix ) {
		buttonClasses.push( 'gameengine-btn--' + prefix );
	}

	if ( 'link' === type ) {
		const targetAttribute = target ? { target } : {};
		return (
			<a
				href={ link }
				className={ className ? className : buttonClasses.join( ' ' ) }
				type={ type }
				onClick={ onClick }
				disabled={ isDisabled || isLoading }
				style={ style }
				rel="noreferrer"
				id={ id }
				{ ...targetAttribute }
			>
				{ iconPosition !== 'right' && icon }

				{ isLoading ? (
					<>
						<Spinner />
						{ loadingLabel && (
							<span className="gameengine-btn--label">
								{ loadingLabel }
							</span>
						) }
					</>
				) : (
					<>
						{ label && (
							<span className="gameengine-btn--label">
								{ label }
							</span>
						) }
					</>
				) }
				{ iconPosition === 'right' && icon }
				{ ! isPro && (
					<span className="gameengine-pro-badge">
						{ __( 'PRO', 'gameengine' ) }
					</span>
				) }
			</a>
		);
	}

	return (
		<button
			className={ className ? className : buttonClasses.join( ' ' ) }
			type={ type }
			onClick={ onClick }
			disabled={ isDisabled || isLoading }
			style={ style }
			id={ id }
		>
			{ iconPosition !== 'right' && ! isLoading && icon }

			{ isLoading ? (
				<>
					<Spinner />
					{ loadingLabel && (
						<span className="gameengine-btn--label">
							{ loadingLabel }
						</span>
					) }
				</>
			) : (
				<>
					{ label && (
						<span className="gameengine-btn--label">{ label }</span>
					) }
				</>
			) }
			{ iconPosition === 'right' && ! isLoading && icon }
			{ ! isPro && (
				<span className="gameengine-pro-badge">
					{ __( 'PRO', 'gameengine' ) }
				</span>
			) }
		</button>
	);
};

Button.propTypes = propTypes;
export default Button;
