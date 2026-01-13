import React from 'react';
import { Modal } from '@wordpress/components';
import './styles.scss';
import './suffix.scss';

const WPModal = ({
	children,
	suffix = '',
	title = '',
	isOpen = false,
	onRequestClose,
	isFullScreen = false,
	shouldCloseOnClickOutside = false,
	size = 'medium',
}) => {
	const classes = [
		"gamify-wp-modal",
		`gamify-wp-modal--${size}`,
		suffix && `gamify-wp-modal--${suffix}`,
	].filter(Boolean).join(" ");

	return (
		<React.Fragment>
			{isOpen && (
				<Modal
					title={title}
					onRequestClose={onRequestClose}
					contentLabel={title}
					isFullScreen={isFullScreen}
					shouldCloseOnClickOutside={shouldCloseOnClickOutside}
					className={classes}
				>
					<div className="gamify-wp-modal__content">
						{children}
					</div>
				</Modal>
			)}
		</React.Fragment>
	);
}

export default WPModal;
