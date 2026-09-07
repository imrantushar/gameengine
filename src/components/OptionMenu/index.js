import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiDotsHorizontal } from "react-icons/hi";

const OptionMenu = props => {
  const {
    icon = <HiDotsHorizontal />,
    options = [],
    iconClass,
    suffix = '',
    alwaysShowOptions = false
  } = props;

  const [itemSelected, setItemSelected] = useState(false);
  const menuItemRef = useRef(null);
  const relativeTo = useRef(null);

  const handleClick = e => {
    if (
      menuItemRef?.current &&
      !menuItemRef?.current?.contains(e.target) &&
      !relativeTo.current.contains(e.target)
    ) {
      setItemSelected(false);
    }
  };

  const handleMenuToggle = () => {
    setItemSelected(!itemSelected);
  };

  useEffect(() => {
    if (!alwaysShowOptions) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [alwaysShowOptions]);

  useEffect(() => {
    if (alwaysShowOptions) return;

    if (itemSelected && relativeTo.current) {
      const rect = relativeTo.current.getBoundingClientRect();
      const x = rect.left + window.pageXOffset;
      const y = rect.top + window.pageYOffset;
      const buttonHeight = relativeTo.current.offsetHeight;
      menuItemRef.current.style.position = 'absolute';
      menuItemRef.current.style.left = `${x - 168}px`;
      menuItemRef.current.style.top = `${y + buttonHeight + 2}px`;
      document.body.appendChild(menuItemRef.current);
    } else if (menuItemRef.current && menuItemRef.current.parentNode === document.body) {
      document.body.removeChild(menuItemRef.current);
    }
  }, [itemSelected, alwaysShowOptions]);

  const renderOptions = () => (
    <div
      className={[
        'gameengine-dropdown-menu__lists',
        alwaysShowOptions ? 'gameengine-dropdown-menu--inline' : '',
        suffix ? `gameengine-dropdown-menu--list-${suffix}` : '',
      ].filter(Boolean).join(' ')}
      ref={menuItemRef}
    >
      <ul
        className={[
          alwaysShowOptions
            ? 'gameengine-dropdown-menu__inline flex'
            : 'gameengine-more-options relative min-w-[175px] z-[99999] rounded-md border border-solid border-[var(--gameengine-border-color)] bg-[var(--gameengine-background)] m-0 p-2 shadow-[0px_12px_24px_-4px_rgba(16,24,40,0.08)]',
          'list-none',
        ].filter(Boolean).join(' ')}
      >
        {options.map((item, itemIndex) => {
          const handleItemClick = () => {
            setItemSelected(false);
            if ('button' === item.type) {
              return item?.onClick();
            }
            return null;
          };

          const inlineFormClass = [
            alwaysShowOptions ? 'gameengine-dropdown-menu__inline-form' : 'gameengine-more-options__item',
            !alwaysShowOptions
              ? 'cursor-pointer mb-0 rounded-md list-none'
              : [
                  // inline-form border separator except last child
                  'not-last:border-r not-last:border-[var(--gameengine-border-color)] not-last:pr-0.5 not-last:mr-0.5',
                ].join(' '),
          ].filter(Boolean).join(' ');

          const buttonBaseClass = alwaysShowOptions
            ? 'gameengine-btn--inline p-0 text-[var(--gameengine-warn-muted)] flex items-center gap-2'
            : [
                'flex items-center gap-2 cursor-pointer border-none w-full',
                'text-[var(--gameengine-font-color)] rounded-md px-2.5 py-2 mb-1',
                'text-sm transition-colors duration-150',
                'hover:bg-[var(--gameengine-secondary-color)] hover:text-[var(--gameengine-font-color)] hover:rounded',
                'bg-transparent',
              ].join(' ');

          return (
            <React.Fragment key={itemIndex}>
              {item.action ? (
                <form
                  className={inlineFormClass}
                  action={item.action}
                  method={item.method}
                >
                  <button
                    type="submit"
                    className={buttonBaseClass}
                    suffix={`${alwaysShowOptions ? 'inline' : 'block'}`}
                  >
                    {item.icon && (
                      <span className="menu-item-icon text-base leading-none">
                        {item.icon}
                      </span>
                    )}
                    <span className=" pointer-events-none text-[14px]">
                      {item.label}
                    </span>
                  </button>
                  {item.hasBorder && (
                    <hr className="gameengine-option-separator my-1 border-[var(--gameengine-border-color)]" />
                  )}
                </form>
              ) : (
                <li className={inlineFormClass}>
                  <button
                    type="button"
                    className={[
                      buttonBaseClass,
                      item.suffix === 'trash' ? 'gameengine-btn--trash !text-[#FF4D4D] hover:!text-[#FF4D4D]' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={handleItemClick}
                  >
                    {item.icon && (
                      <span className="menu-item-icon text-base leading-none">
                        {item.icon}
                      </span>
                    )}
                    <span className=" pointer-events-none text-[14px]">
                      {item.label}
                    </span>
                  </button>
                  {item.hasBorder && (
                    <hr className="gameengine-option-separator my-1 border-[var(--gameengine-border-color)]" />
                  )}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {!alwaysShowOptions && (
        <button
          className={[
            'gameengine-dropdown-menu',
            suffix ? `gameengine-dropdown-menu--${suffix}` : '',
            // Tailwind UI
            'relative rounded border border-solid border-[var(--gameengine-border-color)] cursor-pointer bg-transparent px-1 py-0.5',
            'transition-colors duration-150',
            'hover:bg-[var(--gameengine-secondary-color)] focus:bg-[var(--gameengine-secondary-color)]',
            'focus:outline-none',
          ].filter(Boolean).join(' ')}
          type="button"
          ref={relativeTo}
          onClick={handleMenuToggle}
        >
          {iconClass ? iconClass : icon}
        </button>
      )}

      {alwaysShowOptions
        ? renderOptions()
        : itemSelected && createPortal(renderOptions(), document.body)}
    </>
  );
};

export default OptionMenu;
