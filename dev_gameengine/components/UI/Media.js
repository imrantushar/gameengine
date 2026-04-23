import React from 'react';
import { el } from './utils';

export const Icon = ({
  as: Component,
  boxSize,
  size,
  color,
  style: styleProp,
  className,
  ...rest
}) => {
  if (!Component) return null;
  const sz = boxSize ? `${parseFloat(boxSize) * 4}px` : size === 'md' ? '20px' : size === 'sm' ? '16px' : size === 'lg' ? '24px' : undefined;
  const s = {
    ...(sz ? {
      width: sz,
      height: sz
    } : {}),
    ...(color ? {
      color
    } : {}),
    ...styleProp
  };
  return <Component style={Object.keys(s).length ? s : undefined} className={className} {...rest} />;
};

export const Image = el('img');
