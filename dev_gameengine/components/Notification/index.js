import React, { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { notification_position } from '@GFUtils/helper';
import { Link } from 'react-router-dom';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { RiErrorWarningLine } from 'react-icons/ri';
import { BiErrorCircle } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';
import { IoCloseOutline } from 'react-icons/io5';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import ShareButton from '@GFComponents/ShareButton';

const iconType = type => {
  switch (type) {
    case 'success':
      return <IoMdCheckmarkCircleOutline size="20px" />;
    case 'warning':
      return <RiErrorWarningLine size="20px" />;
    case 'error':
      return <BiErrorCircle size="20px" />;
    case 'info':
      return <FiInfo size="20px" />;
    default:
      return <FiInfo size="20px" />;
  }
};

const Notification = () => {
  const notificationRef = useRef(null);
  const targetElement = document.querySelector('#gameengine-admin-app');
  const notification = useSelector(state => state.notification);
  const shareEnabled = window.GameEngineGlobal?.social_sharing !== false;
  const dispatch = useDispatch();
  useEffect(() => {
    if (notification.isShow && targetElement) {
      notificationRef.current.style.position = 'fixed';
      if (notification_position === 'top-left') {
        notificationRef.current.style.left = '10%';
        notificationRef.current.style.top = '8%';
      }
      if (notification_position === 'top-right') {
        notificationRef.current.style.right = '-6%';
        notificationRef.current.style.top = '8%';
      }
      if (notification_position === 'top-center') {
        notificationRef.current.style.left = '45%';
        notificationRef.current.style.top = '8%';
      }
      if (notification_position === 'bottom-left') {
        notificationRef.current.style.left = '10%';
        notificationRef.current.style.bottom = '8%';
      }
      if (notification_position === 'bottom-right') {
        notificationRef.current.style.right = '-6%';
        notificationRef.current.style.bottom = '8%';
      }
      if (!notification_position || notification_position === 'bottom-center') {
        notificationRef.current.style.left = '45%';
        notificationRef.current.style.bottom = '8%';
      }
      notificationRef.current.style.transform = 'translateX(-39%)';
      document.body.appendChild(notificationRef.current);
    } else if (notificationRef.current && notificationRef.current.parentNode === document.body) {
      document.body.removeChild(notificationRef.current);
    }
    return () => {
      if (notificationRef.current && notificationRef.current.parentNode === document.body) {
        document.body.removeChild(notificationRef.current);
      }
    };
  }, [notification.isShow]);
  useEffect(() => {
    if (notification.isShow) {
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
    dispatch(showNotification({
      message: '',
      isShow: false,
      type: ''
    }));
  };

  return (
    <>
      {notification?.isShow && createPortal(
        <div className={`gameengine-notification ${notification.type && `gameengine-notification--${notification.type}`}`} ref={notificationRef}>
          {notification?.linkTo ? (
            <Link to={notification.linkTo}>
              <div className="gameengine-notification__message no-underline">
                {iconType(notification?.type)}

                {notification.isHtml ? <div dangerouslySetInnerHTML={{
                  __html: __(notification.message, 'gameengine')
                }} /> : __(notification.message, 'gameengine')}
              </div>
            </Link>
          ) : (
            <div className="gameengine-notification__message">
              {iconType(notification?.type)}

              {notification.message}
            </div>
          )}

          {shareEnabled && notification.shareData && (
            <ShareButton
              title={notification.shareData.title || ''}
              text={notification.shareData.text || notification.message || ''}
              url={notification.shareData.url || window.location.href}
              size={16}
            />
          )}
          <button className="p-0 bg-transparent [min-width:auto] border-0 text-white text-[20px]" onClick={closeHandler} aria-label={__('Close notification', 'gameengine')}>
            <IoCloseOutline />
          </button>
        </div>, document.body)}
    </>
  );
};

export default Notification;
