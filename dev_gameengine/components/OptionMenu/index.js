import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@GFComponents/Button';
import { FiMoreHorizontal } from "react-icons/fi";
import { Icon } from '@GFComponents/UI';
import { HiDotsHorizontal } from "react-icons/hi";
import './styles.scss';
const OptionMenu = props => {
  const {
    icon = HiDotsHorizontal,
    options = [],
    iconClass,
    suffix = '',
    alwaysShowOptions = false
  } = props;
  const [itemSelected, setItemSelected] = useState(false);
  const menuItemRef = useRef(null);
  const relativeTo = useRef(null);
  const handleClick = e => {
    if (menuItemRef?.current && !menuItemRef?.current?.contains(e.target) && !relativeTo.current.contains(e.target)) {
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
    if (alwaysShowOptions) {
      return;
    }
    if (itemSelected && relativeTo.current) {
      const rect = relativeTo.current.getBoundingClientRect();
      const x = rect.left + window.pageXOffset;
      const y = rect.top + window.pageYOffset;
      const buttonHeight = relativeTo.current.offsetHeight;
      menuItemRef.current.style.position = 'absolute';
      menuItemRef.current.style.left = `${x - 168}px`;
      menuItemRef.current.style.top = `${y + buttonHeight - -2}px`;
      document.body.appendChild(menuItemRef.current);
    } else if (menuItemRef.current && menuItemRef.current.parentNode === document.body) {
      document.body.removeChild(menuItemRef.current);
    }
  }, [itemSelected, alwaysShowOptions]);
  
  const renderOptions = () => <div className={`gameengine-dropdown-menu__lists  ${alwaysShowOptions ? 'gameengine-dropdown-menu--inline' : ''} ${suffix && `gameengine-dropdown-menu--list-${suffix}`}`} ref={menuItemRef}>
			<ul className={`${alwaysShowOptions ? 'gameengine-dropdown-menu__inline' : 'gameengine-more-options'}`}>
				{options.map((item, itemIndex) => {
        const handleItemClick = () => {
          setItemSelected(false);
          if ('button' === item.type) {
            return item?.onClick();
          }
          return null;
        };
        return <React.Fragment key={itemIndex}>
							{item.action ? <form className={`${alwaysShowOptions ? 'gameengine-dropdown-menu__inline-form' : 'gameengine-more-options__item'}`} action={item.action} method={item.method}>
									<button type="submit" lassName='flex items-center gap-2 ' suffix={`${alwaysShowOptions ? 'inline' : 'block'}`}>
										{item.icon && <span className="menu-item-icon">{item.icon}</span>}
										{item.label}
									</button>
									{item.hasBorder && <hr className="gameengine-option-separator" />}
								</form> : <li className={`${alwaysShowOptions ? 'gameengine-dropdown-menu__inline-form' : 'gameengine-more-options__item'}`}>
									<button type="button" className='flex items-center gap-2' onClick={handleItemClick}>
										{item.icon && <span className="menu-item-icon">{item.icon}</span>}
										{item.label}
									</button>
									{item.hasBorder && <hr className="gameengine-option-separator" />}
								</li>}
						</React.Fragment>;
      })}
			</ul>
		</div>;
  return <>
			{!alwaysShowOptions && <button className={`gameengine-dropdown-menu ${suffix && `gameengine-dropdown-menu--${suffix}`}`} type="button" ref={relativeTo} onClick={handleMenuToggle}>
					{iconClass ? iconClass : <Icon as={icon} />}
				</button>}
			{alwaysShowOptions ? renderOptions() : itemSelected && createPortal(renderOptions(), document.body)}
		</>;
};
export default OptionMenu;