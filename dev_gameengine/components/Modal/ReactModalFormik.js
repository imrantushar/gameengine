import React, { useEffect, useState, useRef } from 'react';
import { Form, Formik } from 'formik';
import { __ } from '@wordpress/i18n';
import { suffixClassNames, contentClassNames } from './helper';
import { MdFullscreen, MdPhoneAndroid, MdLaptopMac, MdViewColumn } from 'react-icons/md';
import { Spinner } from '@GFUtils/ui';
import './styles.scss';
import './suffix.scss';
import OptionMenu from '@GFComponents/OptionMenu';
import { outlineBtn, primaryBtn, xCloseBtn } from '../../../assets/scss/chakra/recipe';
const ReactModalFormik = ({
  children,
  suffix = '',
  title = '',
  isOpen = false,
  isSmallAvailable = true,
  isLargeAvailable = false,
  isEnabledResize = false,
  isEnabledFooter = true,
  position = 'center',
  onAfterOpen,
  onRequestClose,
  cancelButtonLabel = __('Cancel', 'gameengine'),
  submitButtonLabel = __('Update', 'gameengine'),
  size = 'medium',
  formik = {},
  style = {
    overlay: {
      background: 'rgba(41, 42, 46, 0.28))',
      overflowY: 'scroll',
      display: 'flex',
      justifyContent: 'center',
      zIndex: 9999
    },
    content: {
      inset: 'unset',
      padding: 0,
      border: 0,
      overflow: 'none',
      marginTop: '50px'
    }
  }
}) => {
  const [devicePreview, setDevicePreview] = useState({
    expandableSize: size,
    activeIconIndex: 3
  });
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const iconOptions = [<MdFullscreen />, <MdLaptopMac />, <MdPhoneAndroid />, <MdViewColumn />];
  const toggleIcon = index => {
    setDevicePreview(prevState => ({
      ...prevState,
      activeIconIndex: index,
      expandableSize: ['large', 'medium', 'small'][index]
    }));
  };

  // Get positioning styles based on position prop
  const getPositionStyles = () => {
    const baseOverlay = {
      ...style.overlay,
      display: 'flex',
      justifyContent: 'center'
    };
    const baseContent = {
      ...style.content
    };
    switch (position) {
      case 'top':
        return {
          overlay: {
            ...baseOverlay,
            alignItems: 'flex-start',
            paddingTop: '20px'
          },
          content: {
            ...baseContent,
            marginTop: '0px'
          }
        };
      case 'bottom':
        return {
          overlay: {
            ...baseOverlay,
            alignItems: 'flex-end',
            paddingBottom: '20px'
          },
          content: {
            ...baseContent,
            marginTop: '0px',
            marginBottom: '0px'
          }
        };
      case 'center':
      default:
        return {
          overlay: {
            ...baseOverlay,
            alignItems: 'center'
          },
          content: {
            ...baseContent,
            marginTop: devicePreview?.expandableSize === 'large' ? '30px' : '50px'
          }
        };
    }
  };
  const modalStyle = getPositionStyles();
  const showLargeTab = isLargeAvailable ? [{
    type: 'button',
    label: <span>{__('Full screen', 'gameengine')}</span>,
    icon: MdFullscreen,
    onClick: () => toggleIcon(0)
  }] : [];
  const showSmallTab = isSmallAvailable ? [{
    type: 'button',
    label: <span>{__('Small screen', 'gameengine')}</span>,
    icon: MdPhoneAndroid,
    onClick: () => toggleIcon(2)
  }] : [];
  const contentLabel = typeof title === 'object' ? title.props.children[0] : title;
  const modalClass = suffixClassNames(suffix, devicePreview?.expandableSize);
  const contentClass = contentClassNames(devicePreview?.expandableSize);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape' && isOpen && onRequestClose) {
        onRequestClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onRequestClose]);

  // Handle body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('ReactModal__Body--open');
      return () => document.body.classList.remove('ReactModal__Body--open');
    }
  }, [isOpen]);

  // Handle after open callback
  useEffect(() => {
    if (isOpen && onAfterOpen) {
      onAfterOpen();
    }
  }, [isOpen, onAfterOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setDevicePreview(prevState => ({
          ...prevState,
          activeIconIndex: 0,
          expandableSize: 'large'
        }));
      } else {
        setDevicePreview({
          activeIconIndex: 3,
          expandableSize: size
        });
      }
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  // Handle focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const handleTabKey = e => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        };
        modalRef.current.addEventListener('keydown', handleTabKey);
        firstElement.focus();
        return () => {
          if (modalRef.current) {
            modalRef.current.removeEventListener('keydown', handleTabKey);
          }
        };
      }
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return <div ref={overlayRef} className={`gameengine-modal-overlay gameengine-modal-overlay--${position}`} style={modalStyle.overlay} role="dialog" aria-modal="true" aria-label={contentLabel}>
			<div ref={modalRef} className={modalClass} style={modalStyle.content} role="document">
				<Formik {...formik}>
					{({
          isSubmitting
        }) => <Form>
							<div className="gameengine-modal__head">
								{title && <p className="text-lg font-semibold leading-5 m-0 text-[var(--gameengine-font-black)]">{title}</p>}
								<div className="gameengine-modal-buttons">
									{isEnabledResize && <OptionMenu icon={iconOptions[devicePreview?.activeIconIndex]} options={[...showLargeTab, {
                type: 'button',
                label: <span>{__('Medium screen', 'gameengine')}</span>,
                icon: MdLaptopMac,
                onClick: () => toggleIcon(1)
              }, ...showSmallTab]} />}

									<button onClick={onRequestClose} disabled={isSubmitting} style={xCloseBtn} />
								</div>
							</div>

							<div className={contentClass}>{children}</div>

							{isEnabledFooter && <div className="gameengine-modal__footer">
									<button style={outlineBtn} onClick={onRequestClose}>
										{cancelButtonLabel}
									</button>

									<button type="submit" style={primaryBtn} disabled={isSubmitting}>
										{isSubmitting ? <>
												<Spinner color="var(--gameengine-primary-color)" css={{
                  "--spinner-track-color": "var(--gameengine-secondary-color)"
                }} />

												{submitButtonLabel}
											</> : submitButtonLabel}
									</button>
								</div>}
						</Form>}
				</Formik>
			</div>
		</div>;
};
export default ReactModalFormik;