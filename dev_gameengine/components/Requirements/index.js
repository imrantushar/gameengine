import React, { useRef } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import GFLabel from '@GFComponents/Labels/GFLabel';
import HookConfigurationForm from './HookConfigurationForm';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableHook } from './SortableHook';
import { useDispatch } from 'react-redux';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import EmptyState from './EmptyState';

// # DROPPABLE
// Highlights while a card is held over it, so the target column is obvious
// before the pointer is released.
const DroppableArea = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`gameengine-hook-dropzone${isOver ? ' is-over' : ''}`}
    >
      {children}
    </div>
  );
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
    scope,
    externalClasses,
    // How a hook id becomes a drag id. Defaults to the prefixed form the
    // points and achievements editors use; levels drags by bare hook id.
    itemId = (hookId) => `${actionName}_${hookId}`,
  } = props;
  const dispatch = useDispatch();

  const tabArray = [{
    label: __('All', 'gameengine'),
    value: 'all'
  }, ...hookTypeOptions];

  const tabContainerRef = useRef(null);

  const activeHooks = (selectedHookIds || [])
    .map(id => allHooks?.find(h => h.id === id))
    .filter(Boolean);
  const activeHookIds = activeHooks.map(h => itemId(h.id));

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

  return (
    <CollapsibleItem
      // translators: %s: label
      label={sprintf(__('%s', 'gemboards'), label)}
      onClick={onClick}
      open={open}
      dynamicClasses={`${parent} ${externalClasses}`}
    >
      {open && (
        <div className={`${`${child} gameengine-fade-in-up` + " " + "flex w-full"} gap-6 mt-6`}>
          <div className={`${`${childLeft + " " + "flex flex-col"} w-1/2 rounded gap-6 [padding:24px_24px_0_24px]`} [box-shadow:var(--gameengine-shadow)]`}>
            <div className="flex flex-col gap-1">
              <GFLabel type="plainHeading" margin={0} label={__("Available Hooks", "gameengine")} />
              <GFLabel type="subtitle" color="var(--gameengine-font-color)" label={__("To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.", "gameengine")} />
            </div>

            <div className="flex items-center relative gameengine-border-bottom">
              {tabArray.length > 4 && <button className="absolute top-[-4px] bg-[var(--gameengine-background)] p-1 rounded-full text-[var(--gameengine-font-color)] [border:1px_solid_var(--gameengine-border-color)] left-0 z-[2] text-[16px] leading-4" onClick={scrollLeft}>
                <RiArrowLeftSLine />
              </button>}

              <div className={`flex gap-4 overflow-x-auto overflow-y-hidden w-[${tabArray.length > 4 ? "80%" : "100%"}] ${tabArray.length > 4 ? "mx-auto" : ""}`} ref={tabContainerRef} mx={tabArray.length > 4 ? "32px" : "0"} style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {tabArray.map((item, index) => {
                  const isActive = selectedFilterType === item.value || selectedFilterType === '' && item.value === 'all';
                  return <button
                    key={index}
                    className={`bg-transparent outline-none cursor-pointer h-auto text-[13px] font-[500] pb-2.5 -mb-[1px] shadow-none whitespace-nowrap ${isActive ? 'text-[var(--gameengine-primary)] border-0 border-b-2 border-solid border-[var(--gameengine-primary)]' : 'text-[var(--gameengine-warn-muted)] border-0 border-b-2 border-solid border-transparent hover:text-[var(--gameengine-font-color)] hover:border-[var(--gameengine-border-color)]'}`}
                    style={{ minWidth: 'auto', paddingInline: '0', background: 'transparent' }}
                    onClick={() => filterHookType(item.value)}>
                    {item.label}
                  </button>;
                })}
              </div>

              {tabArray.length > 4 && <button className="absolute top-[-4px] bg-[var(--gameengine-background)] p-1 rounded-full text-[var(--gameengine-font-color)] [border:1px_solid_var(--gameengine-border-color)] right-0 z-[2] text-[16px] leading-4" onClick={scrollRight}>
                <RiArrowRightSLine />
              </button>}
            </div>

            <DroppableArea id={`${actionName}s-available`}>
              <div className="gameengine-fade-in" key={selectedFilterType}>
                {allHooks.filter(item => !selectedHookIds?.includes(item?.id)).filter(item => selectedFilterType.length === 0 || selectedFilterType === item.integrationSlug || selectedFilterType === 'all').map(h => <div key={h.id}>
                  {renderHookCard(h, actionName)}
                  <p className="mt-1 text-xs text-[var(--gameengine-warn-muted)]">{h.subTitle}</p>
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
              {!selectedHookIds || selectedHookIds.length === 0 ? (
                <EmptyState />
              ) : (
                <SortableContext items={activeHookIds} strategy={verticalListSortingStrategy}>
                  {activeHooks.map(h => <SortableHook key={itemId(h.id)} id={itemId(h.id)}>
                    <HookConfigurationForm hookId={h.id} type={actionName} hookInfo={h} dispatch={dispatch} currentSettings={hookSettings[`${actionName}_${h.id}`]} isOpen={openHookType.includes(h.id)} setIsOpen={v => setOpenHookType(v ? [...openHookType, h.id] : openHookType.filter(i => i !== h.id))} scope={scope} />
                  </SortableHook>)}
                </SortableContext>
              )}
            </DroppableArea>
          </div>
        </div>
      )}
    </CollapsibleItem>
  );
};

export default Requirements;
