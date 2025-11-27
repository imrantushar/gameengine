import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { createPortal } from 'react-dom';
import './styles.scss';

const propTypes = {
	children: PropTypes.object,
	value: PropTypes.string,
	options: PropTypes.object,
	onChangeHandler: PropTypes.func,
};

const StatusOptions = ( props ) => {
	const {
		value = 'pending',
		options = {},
		onChangeHandler = () => {},
		suffix = '',
	} = props;

	const [ isOpenDropdown, setOpenDropdown ] = useState( false );

	const statusLabel = {
		publish: __( 'Published', 'gamify' ),
		pending: __( 'Pending', 'gamify' ),
		draft: __( 'Draft', 'gamify' ),
		trash: __( 'Trash', 'gamify' ),
		completed: __( 'Approved', 'gamify' ),
		approved: __( 'Approve', 'gamify' ),
		processing: __( 'Processing', 'gamify' ),
		cancel: __( 'Cancel', 'gamify' ),
		private: __( 'Private', 'gamify' ),
		future: __( 'Scheduled', 'gamify' ),
	};

	const menuItemRef = useRef( null );
	const relativeTo = useRef( null );

	const handleClick = ( e ) => {
		if (
			menuItemRef?.current &&
			! menuItemRef?.current?.contains( e.target )
		) {
			setOpenDropdown( false );
		}
	};

	const handleMenuToggle = () => {
		setOpenDropdown( ! isOpenDropdown );
	};

	useEffect( () => {
		document.addEventListener( 'mousedown', handleClick );
		return () => document.removeEventListener( 'mousedown', handleClick );
	}, [] );

	useEffect( () => {
		if ( isOpenDropdown && relativeTo.current ) {
			const rect = relativeTo.current.getBoundingClientRect();
			const x = rect.left + window.pageXOffset;
			const y = rect.top + window.pageYOffset;
			const buttonHeight = relativeTo.current.offsetHeight;
			menuItemRef.current.style.position = 'absolute';
			menuItemRef.current.style.left = `${ x - 50 }px`;
			menuItemRef.current.style.top = `${ y + buttonHeight + 5 }px`;
			document.body.appendChild( menuItemRef.current );
		} else if (
			relativeTo.current &&
			relativeTo.current.parentNode === document.body
		) {
			document.body.removeChild( menuItemRef.current );
		}
	}, [ isOpenDropdown, relativeTo ] );

	return (
		<>
			<button
				className={ `gamify-dropdown-option gamify-dropdown-option--${ value } 
				${ suffix && 'gamify-dropdown-option--' + suffix }` }
				type="button"
				ref={ relativeTo }
				onClick={ handleMenuToggle }
			>
				<span className="label">{ statusLabel[ value ] }</span>
				<span
					className={ `gamify-icon gamify-icon--arrow-down` }
				/>
			</button>
			{ createPortal(
				<div
					className="gamify-dropdown-option__lists"
					ref={ menuItemRef }
				>
					{ isOpenDropdown && (
						<ul className="gamify-more-status-options">
							{ options.items.map( ( item, index ) => (
								<li
									className={ `gamify-more-status-options__item gamify-more-status-options__item--${
										item.value
									} ${ item.value === value && 'active' }` }
									role="presentation"
									onClick={ () => {
										onChangeHandler( item.value );
										setOpenDropdown( false );
									} }
									key={ index }
								>
									{ item.label }
								</li>
							) ) }
						</ul>
					) }
				</div>,
				document.body
			) }
		</>
	);
};

StatusOptions.propTypes = propTypes;
export default StatusOptions;
