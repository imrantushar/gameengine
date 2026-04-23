import React, { createContext, useContext, useState, forwardRef, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { extractStyleProps } from './utils';

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
