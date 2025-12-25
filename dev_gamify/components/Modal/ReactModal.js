import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { __ } from '@wordpress/i18n';
import OptionMenu from '@GFComponents/OptionMenu';
import { suffixClassNames, contentClassNames } from './helper';
import { CloseButton } from '@chakra-ui/react';
import './styles.scss';

const propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	largeModalMarginTop: PropTypes.string,
	isOpen: PropTypes.bool,
	isEnabledHeader: PropTypes.bool,
	isEnabledResizer: PropTypes.bool,
	onAfterOpen: PropTypes.func,
	onRequestClose: PropTypes.func,
	style: PropTypes.object,
	externalComponent: PropTypes.object,
	suffix: PropTypes.string,
	size: PropTypes.string,
	isSmallAvailable: PropTypes.bool,
	isLargeAvailable: PropTypes.bool,
};

if ( document.getElementById( 'contentManagerWrap' ) ) {
	Modal.setAppElement( '#contentManagerWrap' );
}

export default function ReactModal( {
	children,
	externalComponent,
	suffix = '',
	title = '',
	subtitle = '',
	onAfterOpen,
	onRequestClose,
	isOpen = false,
	isEnabledHeader = true,
	isEnabledResizer = true,
	isSmallAvailable = true,
	isLargeAvailable = true,
	size = 'medium',
	largeModalMarginTop = '30px',
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
			overflow: 'none',
			border: 0,
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
		devicePreview?.expandableSize === 'large'
			? {
					...style,
					content: {
						...style.content,
						marginTop: largeModalMarginTop,
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
				contentLabel={ title }
				style={ modalStyle }
				shouldCloseOnOverlayClick={ false }
				ariaHideApp={ true }
			>
				<div className={ modalClass }>
					{ isEnabledHeader && (
						<div className="gamify-react-modal__head">
							{ title && (
								<>
									<h3 className="gamify-react-modal__head-title">
										{ title }
									</h3>
									{ subtitle && (
										<p>
											<span className="gamify-icon gamify-icon--angle-right"></span>
											{ subtitle }
										</p>
									) }
								</>
							) }
							<div className="gamify-react-modal-buttons">
								{ isEnabledResizer && (
									<OptionMenu
										icon={
											iconOptions[
												devicePreview?.activeIconIndex
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
												onClick: () => toggleIcon( 1 ),
											},
											...showSmallTab,
										] }
									/>
								) }
								{ externalComponent }
								<CloseButton
									size="sm"
									onClick={ () => onRequestClose() }
								/>
							</div>
						</div>
					) }
					<div className={ contentClass }>
						{ ! isEnabledHeader && (
							<CloseButton
								size="sm"
								onClick={ () => onRequestClose() }
							/>
						) }
						{ children }
					</div>
				</div>
			</Modal>
		</React.Fragment>
	);
}

ReactModal.propTypes = propTypes;
