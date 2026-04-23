import React, { forwardRef } from 'react';
import { extractStyleProps } from './utils';

export const Button = forwardRef(({
  children,
  className,
  style: styleProp,
  loading,
  isLoading,
  disabled,
  isDisabled,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  const isDisabledFinal = disabled || isDisabled || loading || isLoading;
  const finalStyle = {
    cursor: isDisabledFinal ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    background: 'transparent',
    padding: '0',
    ...extracted,
    ...styleProp
  };
  return <button type={type} ref={ref} disabled={isDisabledFinal} className={className} style={finalStyle} onClick={onClick} {...rest}>
            {(loading || isLoading) && <span className="gf-spinner-inline rounded-full inline-block" style={{
      width: '14px',
      height: '14px',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      animation: 'gf-spin 0.7s linear infinite'
    }} />}
            {children}
        </button>;
});

export const CloseButton = forwardRef(({
  onClick,
  className,
  style: styleProp,
  disabled,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  const finalStyle = {
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    lineHeight: 1,
    ...extracted,
    ...styleProp
  };
  return <button ref={ref} type="button" onClick={onClick} className={className} style={finalStyle} disabled={disabled} {...rest}>
            ✕
        </button>;
});
