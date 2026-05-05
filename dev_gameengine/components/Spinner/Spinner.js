import React from 'react';

const Spinner = ({ size = 'md', color, style: styleProp, className }) => {
  const sz = size === 'sm' ? '16px' : size === 'lg' ? '32px' : size === 'xl' ? '48px' : '20px';
  return (
    <span
      className={className}
      style={{
        width: sz,
        height: sz,
        border: `2px solid ${color || 'currentColor'}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'gf-spin 0.7s linear infinite',
        ...styleProp,
      }}
    />
  );
};

export default Spinner;
