import React from 'react';

const Switch = ({ checked = false, onChange, disabled = false, className = '' }) => {
  const handleClick = () => {
    if (!disabled) onChange?.(!checked);
  };

  return (
    <label
      className={`inline-flex items-center ${className}`}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleClick}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0"
      />
      <span
        style={{
          display: 'inline-block',
          position: 'relative',
          width: '36px',
          height: '20px',
          borderRadius: '10px',
          background: checked ? 'var(--gameengine-primary, #006BFF)' : '#CBD5E0',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked && (
            <svg viewBox="0 0 10 8" fill="none" style={{ width: '8px', height: '8px' }}>
              <path
                d="M1 4l2.5 3L9 1"
                stroke="var(--gameengine-primary, #006BFF)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    </label>
  );
};

export default Switch;
