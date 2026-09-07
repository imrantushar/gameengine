import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './styles.scss';

const GAP = 8;

function computePosition(triggerRect, tipWidth, tipHeight, placement) {
  const { top, bottom, left, right, width, height } = triggerRect;

  let tipTop, tipLeft;
  const [side, align = 'center'] = placement.split('-');

  switch (side) {
    case 'top':
      tipTop = top - tipHeight - GAP;
      break;
    case 'bottom':
      tipTop = bottom + GAP;
      break;
    case 'left':
      tipLeft = left - tipWidth - GAP;
      break;
    case 'right':
      tipLeft = right + GAP;
      break;
    default:
      tipTop = top - tipHeight - GAP;
  }

  if (side === 'top' || side === 'bottom') {
    if (align === 'start') tipLeft = left;
    else if (align === 'end') tipLeft = right - tipWidth;
    else tipLeft = left + width / 2 - tipWidth / 2;
  }

  if (side === 'left' || side === 'right') {
    if (align === 'start') tipTop = top;
    else if (align === 'end') tipTop = bottom - tipHeight;
    else tipTop = top + height / 2 - tipHeight / 2;
  }

  return { tipTop, tipLeft };
}

export default function KodezenTooltip({
  children,
  openerType = 'text',
  openerContent,
  variant = 'blue',
  placement = 'top-center',
  arrow = 'center',
  contentWidth = '240px',
  suffix,
  delay = 150,
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ tipTop: 0, tipLeft: 0 });
  const triggerRef = useRef(null);
  const tipRef = useRef(null);
  const hideTimer = useRef(null);

  const measure = useCallback(() => {
    if (!triggerRef.current || !tipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const { offsetWidth: tipWidth, offsetHeight: tipHeight } = tipRef.current;
    setCoords(computePosition(triggerRect, tipWidth, tipHeight, placement));
  }, [placement]);

  useEffect(() => {
    if (visible) measure();
  }, [visible, measure]);

  const showTip = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setVisible(true);
  };

  const hideTip = () => {
    hideTimer.current = setTimeout(() => setVisible(false), delay);
  };

  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const triggerProps = {
    onMouseEnter: showTip,
    onMouseLeave: hideTip,
  };

  const trigger =
    openerType === 'text' ? (
      <p
        ref={triggerRef}
        className="text-sm font-normal leading-5 break-words text-[var(--gameengine-font-color)]"
        style={{ margin: 0 }}
        {...triggerProps}
      >
        {openerContent}
      </p>
    ) : (
      <button
        ref={triggerRef}
        className="p-0 h-auto break-words [min-width:auto]"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        {...triggerProps}
      >
        {openerContent}
      </button>
    );

  const tooltipClasses = [
    'kodezen-tooltip',
    'kodezen-tooltip__variant',
    `kodezen-tooltip__variant--${variant}`,
    suffix ? `kodezen-tooltip__${suffix}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {trigger}
      {createPortal(
        <div
          ref={tipRef}
          className={`${tooltipClasses} relative`}
          style={{
            position: 'fixed',
            top: coords.tipTop,
            left: coords.tipLeft,
            zIndex: 99999,
            pointerEvents: visible ? 'auto' : 'none',
            opacity: visible ? 1 : 0,
            maxWidth: contentWidth,
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={hideTip}
        >
          <div className="kodezen-tooltip__content" style={{ wordBreak: 'break-all' }}>
            {children}
          </div>
          <div className={`kodezen-tooltip__arrow kodezen-tooltip__arrow--${arrow}`} />
        </div>,
        document.body
      )}
    </>
  );
}
