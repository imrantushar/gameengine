import React, { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { Box, Button, Icon } from '@chakra-ui/react';
import { notification_position } from '@GFUtils/helper';
import { Link } from 'react-router-dom';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { RiErrorWarningLine } from 'react-icons/ri';
import { BiErrorCircle } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';
import { IoCloseOutline } from 'react-icons/io5';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';

const iconType = (type) => {
	switch (type) {
		case 'success':
			return IoMdCheckmarkCircleOutline;
		case 'warning':
			return RiErrorWarningLine;
		case 'error':
			return BiErrorCircle;
		case 'info':
		case 'notification':
		default:
			return FiInfo;
	}
};

const Notification = () => {
	const notificationRef = useRef(null);
	const targetElement = document.querySelector('#gameengine-admin-app');
	const notification = useSelector((state) => state.notification);

	const dispatch = useDispatch();

	useEffect(() => {
		if (notification.isShow && targetElement) {
			notificationRef.current.style.position = 'fixed';
			if(notification_position === 'top-left'){
				notificationRef.current.style.left = '10%';
				notificationRef.current.style.top = '8%';
			}
			if(notification_position === 'top-right'){
				notificationRef.current.style.right = '-6%';
				notificationRef.current.style.top = '8%';
			}
			if(notification_position === 'top-center'){
				notificationRef.current.style.left = '45%';
				notificationRef.current.style.top = '8%';
			}
			if(notification_position === 'bottom-left'){
				notificationRef.current.style.left = '10%';
				notificationRef.current.style.bottom = '8%';
			}
			if(notification_position === 'bottom-right'){
				notificationRef.current.style.right = '-6%';
				notificationRef.current.style.bottom = '8%';
			}
			if(!notification_position || notification_position === 'bottom-center'){
				notificationRef.current.style.left = '45%';
				notificationRef.current.style.bottom = '8%';
			}
			notificationRef.current.style.transform = 'translateX(-39%)';
			document.body.appendChild(notificationRef.current);
		} else if (
			notificationRef.current &&
			notificationRef.current.parentNode === document.body
		) {
			document.body.removeChild(notificationRef.current);
		}

		return () => {
			if (
				notificationRef.current &&
				notificationRef.current.parentNode === document.body
			) {
				document.body.removeChild(notificationRef.current);
			}
		};
	}, [notification.isShow]);

	useEffect(() => {	
		if (notification.isShow){
			// if (notification.type === "notification") {
			// 	playAudio('notification')
			// };
			const timeout_id = setTimeout(() => {
				closeHandler();
			}, 6000);

			return () => clearTimeout(timeout_id);
		}
	}, [notification.isShow]);

	const closeHandler = () => {
		dispatch(
			showNotification({
				message: '',
				isShow: false,
				type: '',
			})
		);
	};

	return (
		<>
			{notification?.isShow &&
				createPortal(
					<div
						className={`gameengine-notification ${notification.type &&
							`gameengine-notification--${notification.type}`
							}`}
						ref={notificationRef}
						
					>
						{notification?.linkTo ? (
							<Link to={notification.linkTo}>
								<Box textDecoration={'none'} className="gameengine-notification__message">
									<Icon as={iconType(notification?.type)} size="md" />

									{notification.isHtml ? (
										<div
											dangerouslySetInnerHTML={{
												__html: __(
													notification.message,
													'gameengine'),
											}}
										/>
									) : (
										__(
											notification.message,
											'gameengine')
									)}
								</Box>
							</Link>
						) : (
							<div className="gameengine-notification__message">
								<Icon as={iconType(notification?.type)} size="md" />

								{notification.message}
							</div>
						)}
						<Button
							onClick={closeHandler}
							aria-label={__(
								'Close notification',
								'gameengine'
							)}
							padding={0}
							minWidth="auto"
							bg='transparent'
						>
							<IoCloseOutline />
						</Button>
					</div>,
					document.body
				)}
		</>
	);
};

export default Notification;
