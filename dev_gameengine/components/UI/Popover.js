import React, { createContext, useContext, forwardRef } from 'react';
import { extractStyleProps } from './utils';

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
