import React, { forwardRef } from 'react';
import { extractStyleProps } from './utils';

export const Spinner = ({
  size = 'md',
  color,
  style: styleProp,
  className
}) => {
  const sz = size === 'sm' ? '16px' : size === 'lg' ? '32px' : size === 'xl' ? '48px' : '20px';
  const finalStyle = {
    width: sz,
    height: sz,
    border: `2px solid ${color || 'currentColor'}`,
    borderTopColor: 'transparent',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'gf-spin 0.7s linear infinite',
    ...styleProp
  };
  return <span className={className} style={finalStyle} />;
};

export const Skeleton = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted
  } = extractStyleProps(props);
  const finalStyle = {
    background: 'linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'gf-shimmer 1.5s infinite',
    borderRadius: '4px',
    display: 'block',
    ...extracted,
    ...styleProp
  };
  return <span ref={ref} className={className} style={finalStyle}>{children}</span>;
});

export const SkeletonText = ({
  noOfLines = 3,
  spacing = '8px',
  style: styleProp
}) => <div className="flex flex-col" style={{
  gap: spacing,
  ...styleProp
}}>
        {Array.from({
    length: noOfLines
  }).map((_, i) => <Skeleton key={i} height="14px" width={i === noOfLines - 1 ? '60%' : '100%'} />)}
    </div>;
