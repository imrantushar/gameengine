/**
 * ui.js — Drop-in replacement for @chakra-ui/react
 * Provides the same API surface using plain HTML elements + inline styles.
 * No ChakraProvider required.
 */
import React, { createContext, useContext, useState, useRef, useEffect, forwardRef, cloneElement } from 'react';
import { createPortal } from 'react-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Style-prop extraction
// ─────────────────────────────────────────────────────────────────────────────
const STYLE_ALIAS = {
  p: 'padding',
  pt: 'paddingTop',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  pr: 'paddingRight',
  m: 'margin',
  mt: 'marginTop',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mr: 'marginRight',
  w: 'width',
  h: 'height',
  maxW: 'maxWidth',
  minW: 'minWidth',
  maxH: 'maxHeight',
  minH: 'minHeight',
  bg: 'background',
  boxShadow: 'boxShadow',
  shadow: 'boxShadow',
  borderRadius: 'borderRadius',
  borderColor: 'borderColor',
  borderWidth: 'borderWidth',
  borderTopWidth: 'borderTopWidth',
  borderBottomWidth: 'borderBottomWidth',
  borderLeftWidth: 'borderLeftWidth',
  borderRightWidth: 'borderRightWidth',
  lineHeight: 'lineHeight',
  letterSpacing: 'letterSpacing',
  wordBreak: 'wordBreak',
  whiteSpace: 'whiteSpace',
  zIndex: 'zIndex',
  gap: 'gap',
  alignSelf: 'alignSelf',
  justifySelf: 'justifySelf',
  flexShrink: 'flexShrink',
  flexGrow: 'flexGrow',
  overflowX: 'overflowX',
  overflowY: 'overflowY',
  cursor: 'cursor',
  visibility: 'visibility',
  opacity: 'opacity',
  userSelect: 'userSelect',
  pointerEvents: 'pointerEvents'
};
const DIRECT_STYLES = new Set(['color', 'fontSize', 'fontWeight', 'fontFamily', 'width', 'height', 'padding', 'margin', 'background', 'backgroundColor', 'border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'position', 'top', 'bottom', 'left', 'right', 'display', 'overflow', 'flex', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'outline', 'transform', 'transition', 'textAlign', 'textTransform', 'textDecoration']);

// Props that are Chakra-only and must not reach the DOM
const SKIP_PROPS = new Set(['variant', 'colorScheme', 'colorPalette', 'size', 'focusRing', 'loading', 'isDisabled', 'as', 'asChild', 'motionPreset', 'placement', 'positioning', 'interactive', 'striped', 'showColumnBorder', 'collection', 'onValueChange', 'onCheckedChange', 'checkedIcon', 'uncheckedIcon', 'inputMode']);
function resolveResponsive(val) {
  if (val && typeof val === 'object' && !Array.isArray(val) && 'base' in val) {
    return val.base;
  }
  return val;
}
function clean(val) {
  return typeof val === 'string' ? val.replace(/\s*!important/gi, '') : val;
}
export function extractStyleProps(props) {
  const style = {};
  const rest = {};
  for (const [k, rawVal] of Object.entries(props)) {
    if (SKIP_PROPS.has(k) || k.startsWith('_') && k !== '_') continue;
    const val = resolveResponsive(rawVal);
    if (k === 'px') {
      style.paddingLeft = clean(val);
      style.paddingRight = clean(val);
    } else if (k === 'py') {
      style.paddingTop = clean(val);
      style.paddingBottom = clean(val);
    } else if (k === 'mx') {
      style.marginLeft = clean(val);
      style.marginRight = clean(val);
    } else if (k === 'my') {
      style.marginTop = clean(val);
      style.marginBottom = clean(val);
    } else if (k === 'boxSize') {
      style.width = clean(val);
      style.height = clean(val);
    } else if (k === 'direction') {
      style.flexDirection = clean(val);
    } else if (k === 'align' && !props.alignItems) {
      style.alignItems = clean(val);
    } else if (k === 'justify' && !props.justifyContent) {
      style.justifyContent = clean(val);
    } else if (k === 'wrap') {
      style.flexWrap = clean(val);
    } else if (STYLE_ALIAS[k]) {
      style[STYLE_ALIAS[k]] = clean(val);
    } else if (DIRECT_STYLES.has(k)) {
      style[k] = clean(val);
    } else {
      rest[k] = rawVal;
    }
  }
  return {
    style,
    rest
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic element factory
// ─────────────────────────────────────────────────────────────────────────────
function el(tag, baseStyle = {}) {
  const Comp = forwardRef(({
    children,
    className,
    style: styleProp,
    ...props
  }, ref) => {
    const {
      style: extracted,
      rest
    } = extractStyleProps(props);
    const finalStyle = {
      ...baseStyle,
      ...extracted,
      ...styleProp
    };
    // Remove any remaining unknown non-HTML keys (safety net)
    const {
      dangerouslySetInnerHTML,
      ...safeRest
    } = rest;
    return React.createElement(tag, {
      ...safeRest,
      ...(dangerouslySetInnerHTML ? {
        dangerouslySetInnerHTML
      } : {}),
      className,
      style: finalStyle,
      ref
    }, children);
  });
  return Comp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout primitives
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Icon — renders the `as` prop component directly
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Image
// ─────────────────────────────────────────────────────────────────────────────
export const Image = el('img');

// ─────────────────────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// CloseButton
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Form inputs
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────────────────────
export const Badge = el('span');

// ─────────────────────────────────────────────────────────────────────────────
// Separator / Divider
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton / SkeletonText
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// RadioGroup / CheckboxGroup wrappers
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Switch (compound component)
// ─────────────────────────────────────────────────────────────────────────────
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
            <label className={`${className} inline-flex items-center`} style={{
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
export const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  HiddenInput: SwitchHiddenInput,
  Control: SwitchControl
});

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox (compound component)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Table (compound — maps to native HTML table elements)
// ─────────────────────────────────────────────────────────────────────────────
const TableRoot = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <table ref={ref} className={`${className} w-full`} style={{
    borderCollapse: 'collapse',
    ...extracted,
    ...styleProp
  }} {...rest}>
            {children}
        </table>;
});
const TableScrollArea = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div ref={ref} className={`${className} overflow-x-auto w-full`} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</div>;
});
const TableHeader = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <thead ref={ref} className={className} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</thead>;
});
const TableBody = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <tbody ref={ref} className={className} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</tbody>;
});
const TableRow = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <tr ref={ref} className={className} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</tr>;
});
const TableCell = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <td ref={ref} className={className} style={{
    padding: '8px 12px',
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</td>;
});
const TableColumnHeader = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <th ref={ref} className={`${className} text-left font-semibold`} style={{
    padding: '8px 12px',
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</th>;
});
export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollArea: TableScrollArea,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  ColumnHeader: TableColumnHeader
});

// ─────────────────────────────────────────────────────────────────────────────
// Portal
// ─────────────────────────────────────────────────────────────────────────────
export const Portal = ({
  children,
  container
}) => {
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;
  return createPortal(children, target);
};

// ─────────────────────────────────────────────────────────────────────────────
// Dialog (compound modal)
// ─────────────────────────────────────────────────────────────────────────────
const DialogCtx = createContext({});
const DialogRoot = ({
  children,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : isOpen;
  const setOpen = val => {
    if (!isControlled) setIsOpen(val);
    onOpenChange?.(val);
  };
  return <DialogCtx.Provider value={{
    open,
    setOpen
  }}>
            {children}
        </DialogCtx.Provider>;
};
const DialogTrigger = ({
  children,
  asChild
}) => {
  const {
    setOpen
  } = useContext(DialogCtx);
  const child = React.Children.only(children);
  const trigger = asChild ? child : <button type="button">{children}</button>;
  return cloneElement(trigger, {
    onClick: e => {
      trigger.props.onClick?.(e);
      setOpen(true);
    }
  });
};
const DialogBackdrop = ({
  style: styleProp
}) => {
  const {
    setOpen
  } = useContext(DialogCtx);
  return <div onClick={() => setOpen(false)} className="fixed" style={{
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 9998,
    ...styleProp
  }} />;
};
const DialogPositioner = ({
  children,
  style: styleProp
}) => <div className="fixed flex items-center justify-center overflow-y-auto p-5" style={{
  inset: 0,
  zIndex: 9999,
  ...styleProp
}}>
        {children}
    </div>;
const DialogContent = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div ref={ref} className={`${className} relative bg-white rounded-lg w-full overflow-y-auto`} style={{
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '900px',
    maxHeight: '90vh',
    ...extracted,
    ...styleProp
  }} {...rest} onClick={e => e.stopPropagation()}>
            {children}
        </div>;
});
const DialogBody = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div ref={ref} className={`${className} p-6`} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>
            {children}
        </div>;
});
const DialogCloseTrigger = ({
  children,
  asChild
}) => {
  const {
    setOpen
  } = useContext(DialogCtx);
  const child = React.Children.only(children);
  const trigger = asChild ? child : <button type="button">{children}</button>;
  return cloneElement(trigger, {
    onClick: e => {
      trigger.props.onClick?.(e);
      setOpen(false);
    },
    style: {
      ...trigger.props.style,
      position: 'absolute',
      top: '16px',
      right: '16px'
    }
  });
};
const DialogPortal = ({
  children
}) => {
  const {
    open
  } = useContext(DialogCtx);
  if (!open) return null;
  return createPortal(children, document.body);
};
export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Backdrop: DialogBackdrop,
  Positioner: DialogPositioner,
  Content: DialogContent,
  Body: DialogBody,
  CloseTrigger: DialogCloseTrigger,
  Portal: DialogPortal
});

// ─────────────────────────────────────────────────────────────────────────────
// Menu (controlled — open prop driven)
// ─────────────────────────────────────────────────────────────────────────────
const MenuCtx = createContext({
  open: false
});
const MenuRoot = ({
  children,
  open = false,
  ...props
}) => <MenuCtx.Provider value={{
  open
}}>{children}</MenuCtx.Provider>;
const MenuTrigger = ({
  children,
  asChild
}) => {
  const child = React.Children.only(children);
  return asChild ? child : <span>{children}</span>;
};
const MenuPositioner = ({
  children,
  style: styleProp,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const {
    open
  } = useContext(MenuCtx);
  const {
    style: extracted
  } = extractStyleProps(props);
  if (!open) return null;
  return <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="absolute pointer-events-auto" style={{
    zIndex: 9999,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '6px',
    ...extracted,
    ...styleProp
  }}>
            {children}
        </div>;
};
const MenuContent = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div ref={ref} className={`${className} bg-white rounded-md p-2`} style={{
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    fontSize: '13px',
    lineHeight: '1.4',
    ...extracted,
    ...styleProp
  }} {...rest}>
            {children}
        </div>;
});
export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Positioner: MenuPositioner,
  Content: MenuContent
});

// ─────────────────────────────────────────────────────────────────────────────
// Popover (controlled — open prop driven)
// ─────────────────────────────────────────────────────────────────────────────
const PopoverCtx = createContext({
  open: false
});
const PopoverRoot = ({
  children,
  open = false,
  ...props
}) => <PopoverCtx.Provider value={{
  open
}}>{children}</PopoverCtx.Provider>;
const PopoverTrigger = ({
  children,
  asChild
}) => {
  const child = React.Children.only(children);
  return asChild ? child : <span>{children}</span>;
};
const PopoverPositioner = ({
  children,
  style: styleProp,
  onMouseEnter,
  onMouseLeave
}) => {
  const {
    open
  } = useContext(PopoverCtx);
  if (!open) return null;
  return <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="absolute pointer-events-auto" style={{
    zIndex: 9999,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '6px',
    ...styleProp
  }}>
            {children}
        </div>;
};
const PopoverContent = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div ref={ref} className={`${className} bg-white rounded-md p-3`} style={{
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    fontSize: '13px',
    lineHeight: '1.5',
    ...extracted,
    ...styleProp
  }} {...rest}>
            {children}
        </div>;
});
export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Positioner: PopoverPositioner,
  Content: PopoverContent
});

// ─────────────────────────────────────────────────────────────────────────────
// createListCollection — no-op, items passed directly
// ─────────────────────────────────────────────────────────────────────────────
export function createListCollection({
  items = []
}) {
  return {
    items
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inject global CSS for animations (once)
// ─────────────────────────────────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('gf-ui-animations')) {
  const style = document.createElement('style');
  style.id = 'gf-ui-animations';
  style.textContent = `
        @keyframes gf-spin { to { transform: rotate(360deg); } }
        @keyframes gf-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
  document.head.appendChild(style);
}