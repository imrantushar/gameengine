import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Formik } from 'formik';
import Modal from 'react-modal';
import { __ } from '@wordpress/i18n';
import { suffixClassNames, contentClassNames } from './helper';
import { CloseButton, Button } from '@chakra-ui/react';
import { outlineBtn, primaryBtn } from '../../../assets/scss/chakra/recipe';
import OptionMenu from '@GFComponents/OptionMenu';

import './styles.scss';

const propTypes = {
	title: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	isOpen: PropTypes.bool,
	isLoading: PropTypes.bool,
	isLargeAvailable: PropTypes.bool,
	isSmallAvailable: PropTypes.bool,
	isEnabledResizer: PropTypes.bool,
	onAfterOpen: PropTypes.func,
	onRequestClose: PropTypes.func,
	cancelButtonLabel: PropTypes.string,
	submitButtonLabel: PropTypes.string,
	style: PropTypes.object,
	suffix: PropTypes.string,
	size: PropTypes.string,
	formik: PropTypes.object,
	isEnabledFooter: PropTypes.bool,
};

if ( document.getElementById( 'gamifywrap' ) ) {
	Modal.setAppElement( '#gamifywrap' );
} else if ( document.getElementById( 'gamifyModalWrap' ) ) {
	Modal.setAppElement( '#gamifyModalWrap' );
} else if ( document.getElementById( 'gamifyFrontendWrap' ) ) {
	Modal.setAppElement( '#gamifyFrontendWrap' );
}

export default function ReactModalFormik( {
	children,
	suffix = '',
	title = '',
	isOpen = false,
	isSmallAvailable = true,
	isLargeAvailable = true,
	isEnabledFooter = true,
	isEnabledResizer = true,
	onAfterOpen,
	onRequestClose,
	cancelButtonLabel = __( 'Cancel', 'gamify' ),
	submitButtonLabel = __( 'Update', 'gamify' ),
	size = 'medium',
	formik = {},
	style = {
		overlay: {
			background: 'rgba(35, 40, 45, 0.62)',
			overflowY: 'scroll',
			display: 'flex',
			justifyContent: 'center',
			zIndex: 9999,
		},
		content: {
			inset: 'unset',
			padding: 0,
			border: 0,
			overflow: 'none',
			marginTop: '50px',
		},
	},
} ) {
	const [ devicePreview, setDevicePreview ] = useState( {
		expandableSize: size,
		activeIconIndex: 3,
	} );

	const iconOptions = [
		'gamify-icon gamify-icon--large-screen',
		'gamify-icon gamify-icon--medium-screen',
		'gamify-icon gamify-icon--small-screen',
		'gamify-icon gamify-icon--columns',
	];

	const toggleIcon = ( index ) => {
		setDevicePreview( ( prevState ) => ( {
			...prevState,
			activeIconIndex: index,
			expandableSize: [ 'large', 'medium', 'small' ][ index ],
		} ) );
	};

	const modalStyle =
		devicePreview.expandableSize === 'large'
			? {
					...style,
					content: {
						...style.content,
						marginTop: '30px',
					},
			  }
			: style;
	const showLargeTab = isLargeAvailable
		? [
				{
					type: 'button',
					label: <span>{ __( 'Full screen', 'gamify' ) }</span>,
					icon: (
						<span className="gamify-icon gamify-icon--large-screen" />
					),
					onClick: () => toggleIcon( 0 ),
				},
		  ]
		: [];

	const showSmallTab = isSmallAvailable
		? [
				{
					type: 'button',
					label: <span>{ __( 'Small screen', 'gamify' ) }</span>,
					icon: (
						<span className="gamify-icon gamify-icon--small-screen" />
					),
					onClick: () => toggleIcon( 2 ),
				},
		  ]
		: [];
	const contentLabel =
		typeof title === 'object' ? title.props.children[ 0 ] : title;

	const modalClass = suffixClassNames(
		suffix,
		devicePreview?.expandableSize
	);
	const contentClass = contentClassNames( devicePreview?.expandableSize );

	return (
		<React.Fragment>
			<Modal
				isOpen={ isOpen }
				onAfterOpen={ onAfterOpen }
				onRequestClose={ onRequestClose }
				contentLabel={ contentLabel }
				style={ modalStyle }
				shouldCloseOnOverlayClick={ false }
				ariaHideApp={ true }
			>
				<Formik { ...formik }>
					{ ( { isSubmitting, handleSubmit } ) => (
						<Form>
							<div className={ modalClass }>
								<div className="gamify-react-modal__head">
									{ title && (
										<h3 className="gamify-react-modal__head-title">
											{ title }
										</h3>
									) }
									<div className="gamify-react-modal-buttons">
										{ isEnabledResizer && (
											<OptionMenu
												icon={
													iconOptions[
														devicePreview
															?.activeIconIndex
													]
												}
												options={ [
													...showLargeTab,
													{
														type: 'button',
														label: (
															<span>
																{ __(
																	'Medium screen',
																	'gamify'
																) }
															</span>
														),
														icon: (
															<span className="gamify-icon gamify-icon--medium-screen" />
														),
														onClick: () =>
															toggleIcon( 1 ),
													},
													...showSmallTab,
												] }
											/>
										) }

										<CloseButton
											size="sm"
											onClick={ () => onRequestClose() }
										/>
									</div>
								</div>
								<div className={ contentClass }>
									{ children }
								</div>
								{ isEnabledFooter && (
									<div className="gamify-react-modal__footer">
										{ cancelButtonLabel && (
											<Button
												{ ...outlineBtn }
												onClick={ () =>
													onRequestClose()
												}
											>
												{ cancelButtonLabel }
											</Button>
										) }
										<Button
											{ ...primaryBtn }
											loading={ isSubmitting }
											onClick={ handleSubmit }
										>
											{ submitButtonLabel }
										</Button>
									</div>
								) }
							</div>
						</Form>
					) }
				</Formik>
			</Modal>
		</React.Fragment>
	);
}

ReactModalFormik.propTypes = propTypes;
