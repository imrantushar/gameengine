import React, { createContext, useContext, forwardRef } from 'react';
import { extractStyleProps } from './utils';

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
