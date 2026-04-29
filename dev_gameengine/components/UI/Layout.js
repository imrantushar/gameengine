import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { el, extractStyleProps } from './utils';

export const Box = el('div');

export const Flex = el('div', {
  display: 'flex'
});

export const Center = el('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

export const VStack = el('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

export const Separator = forwardRef(({
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted
  } = extractStyleProps(props);
  return <hr ref={ref} className={`${`${className} m-0`} [border-top:1px_solid_var(--gameengine-border-color)]`} style={{
    border: 'none',
    ...extracted,
    ...styleProp
  }} />;
});

export const Portal = ({
  children,
  container
}) => {
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;
  return createPortal(children, target);
};
