import React, { createContext, useContext, useState, forwardRef } from 'react';
import { el, extractStyleProps } from './utils';

export const Input = forwardRef(({
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  const finalStyle = {
    width: '100%',
    ...extracted,
    ...styleProp
  };
  return <input className={className} style={finalStyle} ref={ref} {...rest} />;
});

export const Textarea = forwardRef(({
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  const finalStyle = {
    width: '100%',
    ...extracted,
    ...styleProp
  };
  return <textarea className={className} style={finalStyle} ref={ref} {...rest} />;
});

export const Badge = el('span');

export const RadioGroup = ({
  children,
  ...props
}) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div style={extracted} {...rest}>{children}</div>;
};

export const CheckboxGroup = ({
  children,
  ...props
}) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div style={extracted} {...rest}>{children}</div>;
};

// --- Switch ---
const SwitchCtx = createContext({});
const SwitchRoot = ({
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  style: styleProp,
  ...props
}) => {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternal(next);
    onCheckedChange?.({
      checked: next
    });
  };
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <SwitchCtx.Provider value={{
    isChecked,
    toggle,
    disabled
  }}>
            <label className={`${className} inline-flex items-center gap-3`} style={{
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...extracted,
      ...styleProp
    }} {...rest}>
                {children}
            </label>
        </SwitchCtx.Provider>;
};
const SwitchHiddenInput = () => {
  const {
    isChecked,
    toggle,
    disabled
  } = useContext(SwitchCtx);
  return <input type="checkbox" checked={isChecked} onChange={toggle} disabled={disabled} className="absolute opacity-0 w-0 h-0" />;
};
const SwitchControl = ({
  className
}) => {
  const {
    isChecked,
    toggle,
    disabled
  } = useContext(SwitchCtx);
  return <span onClick={toggle} className={`${className} inline-block relative w-9 h-5 shrink-0`} style={{
    borderRadius: '10px',
    background: isChecked ? 'var(--gameengine-primary, #006BFF)' : '#CBD5E0',
    transition: 'background 0.2s',
    cursor: disabled ? 'not-allowed' : 'pointer'
  }}>
            <span className="absolute w-4 h-4 rounded-full bg-white" style={{
      top: '2px',
      left: isChecked ? '18px' : '2px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }} />
        </span>;
};
const SwitchLabel = ({ children, className = '', style: styleProp, ...props }) => (
  <span className={`${className} text-sm`.trim()} style={styleProp} {...props}>
    {children}
  </span>
);
export const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  HiddenInput: SwitchHiddenInput,
  Control: SwitchControl,
  Label: SwitchLabel,
});

// --- Checkbox ---
const CheckboxCtx = createContext({});
const CheckboxRoot = ({
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  style: styleProp,
  ...props
}) => {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? !!checked : internal;
  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternal(next);
    onCheckedChange?.({
      checked: next
    });
  };
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <CheckboxCtx.Provider value={{
    isChecked,
    toggle,
    disabled
  }}>
            <label className={`${className} inline-flex items-center gap-1.5`} style={{
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...extracted,
      ...styleProp
    }} {...rest}>
                {children}
            </label>
        </CheckboxCtx.Provider>;
};
const CheckboxHiddenInput = () => {
  const {
    isChecked,
    toggle,
    disabled
  } = useContext(CheckboxCtx);
  return <input type="checkbox" checked={isChecked} onChange={toggle} disabled={disabled} className="absolute opacity-0 w-0 h-0" />;
};
const CheckboxControl = ({
  className
}) => {
  const {
    isChecked,
    toggle
  } = useContext(CheckboxCtx);
  return <span onClick={toggle} className={`${className} inline-flex items-center justify-center w-4 h-4 cursor-pointer shrink-0`} style={{
    borderRadius: '3px',
    border: `2px solid ${isChecked ? 'var(--gameengine-primary, #006BFF)' : '#CBD5E0'}`,
    background: isChecked ? 'var(--gameengine-primary, #006BFF)' : '#fff',
    transition: 'all 0.15s'
  }}>
            {isChecked && <svg viewBox="0 0 12 10" fill="none" className="h-2" style={{
      width: '10px'
    }}>
                    <path d="M1 5l3 4L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
        </span>;
};
export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  HiddenInput: CheckboxHiddenInput,
  Control: CheckboxControl
});

export function createListCollection({
  items = []
}) {
  return {
    items
  };
}
