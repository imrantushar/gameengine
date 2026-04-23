import React, { useEffect, useRef, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, RadioGroup, Switch } from '@GFUtils/ui';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import GameEngineInput from '@GFComponents/GameEngineInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Select from 'react-select';
import HookConfigurationForm from './HookConfigurationForm';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useDispatch } from 'react-redux';
import { FaAngleDown } from 'react-icons/fa6';
import { RiArrowRightSLine } from 'react-icons/ri';

// # DRAGGABLE
const DraggableItem = ({
  id,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.85 : 1,
    cursor: "grab",
    zIndex: isDragging ? 999 : 1
  };
  return <div style={style} ref={setNodeRef} {...listeners} {...attributes} marginBottom="24px">
            {children}
        </div>;
};

// # DROPPABLE
const DroppableArea = ({
  id,
  children
}) => {
  const {
    setNodeRef
  } = useDroppable({
    id
  });
  return <div className="rounded h-full transition-all duration-200" ref={setNodeRef}>
            {children}
        </div>;
};
const Requirements = props => {
  const {
    label,
    onClick,
    open,
    parent,
    child,
    childLeft,
    childRight,
    filterHookType,
    selectedFilterType,
    renderHookCard,
    allHooks,
    hookTypeOptions,
    hookSettings,
    openHookType,
    setOpenHookType,
    selectedHookIds,
    actionName,
    scope
  } = props;
  const dispatch = useDispatch();
  const [dropdownTab, setDropdownTab] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const menuItemRef = useRef(null);
  const relativeTo = useRef(null);

  // const handleClick = (e) => {
  //     if (
  //         menuItemRef?.current &&
  //         !menuItemRef?.current?.contains(e.target) &&
  //         !relativeTo.current.contains(e.target)
  //     ) {
  //         setShowDropdown(false);
  //     }
  // };

  const tabArray = [{
    label: __('All', 'gameengine'),
    value: 'all'
  }, ...hookTypeOptions];

  // useEffect(() => {
  //     document.addEventListener('mousedown', handleClick);
  //     return () => document.removeEventListener('mousedown', handleClick);
  // }, []);

  const tabContainerRef = useRef(null);
  const scrollLeft = () => {
    tabContainerRef.current?.scrollBy({
      left: -150,
      behavior: 'smooth'
    });
  };
  const scrollRight = () => {
    tabContainerRef.current?.scrollBy({
      left: 150,
      behavior: 'smooth'
    });
  };
  return <CollapsibleItem
  // translators: %s: label
  label={sprintf(__('%s', 'gemboards'), label)} onClick={onClick} open={open} dynamicClasses={parent}>
            {open && <div className={`${`${child} gameengine-fade-in-up` + " " + "flex w-full"} gap-6 mt-6`}>
                    <div className={`${`${childLeft + " " + "flex flex-col"} w-1/2 rounded gap-6 [padding:24px_24px_0_24px]`} [box-shadow:var(--gameengine-shadow)]`}>
                        <div className="flex flex-col gap-1">
                            <GFLabel type="plainHeading" margin={0} label={__("Available Hooks", "gameengine")} />
                            <GFLabel type="subtitle" color="var(--gameengine-font-color)" label={__("To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.", "gameengine")} />
                        </div>

                        <div className="flex items-center relative">
                            {tabArray.length > 4 && <button className="absolute bg-white p-0 rounded-full text-[var(--gameengine-font-color)] [border:1px_solid_var(--gameengine-border-color)] left-0 z-[2]" onClick={scrollLeft}>
                                    <Icon as={RiArrowRightSLine} transform="rotate(180deg)" />
                                </button>}

                            <div className="flex gap-4 overflow-x-auto overflow-y-hidden border-b border-gray-200" ref={tabContainerRef} mx={tabArray.length > 4 ? "32px" : "0"} style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                {tabArray.map((item, index) => {
              const isActive = selectedFilterType === item.value || selectedFilterType === '' && item.value === 'all';
              return <button 
                key={index}
                className={`bg-transparent outline-none cursor-pointer h-auto text-[13px] font-[500] pb-2.5 -mb-[1px] shadow-none whitespace-nowrap ${isActive ? 'text-[#1a73e8] border-0 border-b-2 border-solid border-[#1a73e8]' : 'text-gray-600 border-0 border-b-2 border-solid border-transparent hover:text-gray-900 hover:border-gray-300'}`}
                style={{ minWidth: 'auto', paddingInline: '0', background: 'transparent' }}
                onClick={() => filterHookType(item.value)}>
                                            {item.label}
                                        </button>;
            })}
                            </div>

                            {tabArray.length > 4 && <button className="absolute bg-white p-0 rounded-full text-[var(--gameengine-font-color)] [border:1px_solid_var(--gameengine-border-color)] right-0 z-[2]" onClick={scrollRight}>
                                    <Icon as={RiArrowRightSLine} />
                                </button>}
                        </div>

                        <DroppableArea id={`${actionName}s-available`}>
                            <div className="gameengine-fade-in" key={selectedFilterType}>
                                {allHooks.filter(item => !selectedHookIds?.includes(item?.id)).filter(item => selectedFilterType.length === 0 || selectedFilterType === item.integrationSlug || selectedFilterType === 'all').map(h => <div key={h.id}>
                                            {renderHookCard(h, actionName)}
                                            <p className="mt-1 text-xs text-gray-500">{h.subTitle}</p>
                                        </div>)}
                            </div>
                        </DroppableArea>
                    </div>

                    <div className={`${`${childRight} w-1/2 rounded [padding:24px_24px_0_24px]`} [box-shadow:var(--gameengine-shadow)]`}>
                        <div className="flex flex-col gap-1 mb-6">
                            <GFLabel type="plainHeading" margin={0} label={__("Active Hooks", "gameengine")} />
                            <GFLabel type="subtitle" color="var(--gameengine-font-color)" label={__("The following hooks are used for all users", "gameengine")} />
                        </div>

                        <DroppableArea id={`${actionName}s-sidebar`}>
                            {selectedHookIds && selectedHookIds.map(id => allHooks?.find(h => h.id === id)).filter(Boolean).map(h => <DraggableItem key={`${actionName}_${h.id}`} id={`${actionName}_${h.id}`}>
                                        <HookConfigurationForm hookId={h.id} type={actionName} hookInfo={h} dispatch={dispatch} currentSettings={hookSettings[`${actionName}_${h.id}`]} isOpen={openHookType.includes(h.id)} setIsOpen={v => setOpenHookType(v ? [...openHookType, h.id] : openHookType.filter(i => i !== h.id))} scope={scope} />
                                    </DraggableItem>)}
                        </DroppableArea>
                    </div>
                </div>}
        </CollapsibleItem>;
};
export default Requirements;