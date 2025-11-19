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
	const buttonClasses = [ `gamify-btn gamify-btn--${ size }` ];

	if ( preset ) {
		buttonClasses.push( 'gamify-btn--preset-' + preset );
	}
	if ( iconPosition ) {
		buttonClasses.push( 'gamify-btn--icon-' + iconPosition );
	}
	if ( isCircle ) {
		buttonClasses.push( 'gamify-btn--circle' );
	}
	if ( border ) {
		buttonClasses.push( 'gamify-btn--border-' + border );
	}
	if ( borderRadius ) {
		buttonClasses.push( 'gamify-btn--border-' + borderRadius );
	}
	if ( isDisabled ) {
		buttonClasses.push( 'gamify-btn--disabled' );
	}
	if ( suffix ) {
		buttonClasses.push( 'gamify-btn--' + suffix );
	}
	if ( prefix ) {
		buttonClasses.push( 'gamify-btn--' + prefix );
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
							<span className="gamify-btn--label">
								{ loadingLabel }
							</span>
						) }
					</>
				) : (
					<>
						{ label && (
							<span className="gamify-btn--label">
								{ label }
							</span>
						) }
					</>
				) }
				{ iconPosition === 'right' && icon }
				{ ! isPro && (
					<span className="gamify-pro-badge">
						{ __( 'PRO', 'gamify' ) }
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
						<span className="gamify-btn--label">
							{ loadingLabel }
						</span>
					) }
				</>
			) : (
				<>
					{ label && (
						<span className="gamify-btn--label">{ label }</span>
					) }
				</>
			) }
			{ iconPosition === 'right' && ! isLoading && icon }
			{ ! isPro && (
				<span className="gamify-pro-badge">
					{ __( 'PRO', 'gamify' ) }
				</span>
			) }
		</button>
	);
};

Button.propTypes = propTypes;
export default Button;
