import React, { forwardRef } from 'react';
import { el, extractStyleProps } from './utils';

export const Text = forwardRef(({
  children,
  as: Tag = 'p',
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  const finalStyle = {
    margin: 0,
    ...extracted,
    ...styleProp
  };
  return <Tag className={className} style={finalStyle} ref={ref} {...rest}>{children}</Tag>;
});

export const Span = el('span');
