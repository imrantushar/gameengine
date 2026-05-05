import React from 'react';

const Checkbox = ({ checked = false, onChange, disabled = false, className = '' }) => {
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
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          borderRadius: '3px',
          border: `2px solid ${checked ? 'var(--gameengine-primary, #006BFF)' : '#CBD5E0'}`,
          background: checked ? 'var(--gameengine-primary, #006BFF)' : '#fff',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg viewBox="0 0 12 10" fill="none" style={{ width: '10px', height: '8px' }}>
            <path
              d="M1 5l3 4L11 1"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </label>
  );
};

export default Checkbox;
