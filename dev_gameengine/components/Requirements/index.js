import React, { useEffect, useRef, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Box, Button, Flex, Icon, RadioGroup, Switch, Text } from '@chakra-ui/react';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import GameEngineInput from '@GFComponents/GameEngineInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Select from 'react-select';
import HookConfigurationForm from './HookConfigurationForm';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useDispatch } from 'react-redux';
import { FaAngleDown } from 'react-icons/fa6';

// # DRAGGABLE
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: "grab",
        zIndex: isDragging ? 999 : 1
    };

    return (
        <Box ref={setNodeRef} {...listeners} {...attributes} style={style} marginBottom="24px">
            {children}
        </Box>
    );
};

// # DROPPABLE
const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <Box ref={setNodeRef} borderRadius="4px" height='100%' transition="all 0.2s">
            {children}
        </Box>
    );
};

const Requirements = (props) => {
    const {
        label, onClick, open, parent, child, childLeft, childRight, filterHookType, selectedFilterType, renderHookCard, allHooks, hookTypeOptions, hookSettings, openHookType, setOpenHookType, selectedHookIds, actionName, scope,
    } = props;
    const dispatch = useDispatch();
    const [dropdownTab, setDropdownTab] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const menuItemRef = useRef(null);
    const relativeTo = useRef(null);
    
    const handleClick = (e) => {
		if (
			menuItemRef?.current &&
			!menuItemRef?.current?.contains(e.target) &&
			!relativeTo.current.contains(e.target)
		) {
			setShowDropdown(false);
		}
	};

    const tabArray = [
        { label: __('All', 'gameengine'), value: 'all' },
        ...hookTypeOptions,
    ]
    
    useEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);
    return (
        <CollapsibleItem
            // translators: %s: label
            label={sprintf(
                __('%s', 'gemboards'),
                label,
            )}
            onClick={onClick}
            open={open}
            dynamicClasses={parent}
        >
            {open && (
                <Flex gap="24px" mt={6} width="100%" className={`${child} gameengine-fade-in-up`}>
                    <Flex className={childLeft} width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gameengine-shadow)" direction="column" gap="24px">
                        <Flex direction="column" gap="4px">
                            <GFLabel type="plainHeading" margin={0} label={__("Available Hooks", "gameengine")} />
                            <GFLabel
                                type="subtitle"
                                color="var(--gameengine-font-color)"
                                label={__("To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.", "gameengine")}
                            />
                        </Flex>
                        <Box display={'flex'} borderBottom="2px solid var(--gameengine-border-color)">
                            {tabArray.slice(0, 4).map((item, index) => {
                                return (
                                    <Button
                                        minW={'auto'}
                                        variant={'plain'}
                                        onClick={() => {
                                            filterHookType(item.value)
                                            setDropdownTab(null)
                                        }}
                                        key={index}
                                        bg={'transparent'}
                                        height={'35px'}
                                        fontSize={'12px'}
                                        fontWeight={'500'}
                                        lineHeight={'20px'}
                                        padding={'0 12px'}
                                        color={'var(--gameengine-font-color)'}
                                        _after={{
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            bottom: "-3px",
                                            width: "100%",
                                            height: "2px",
                                            bg: "var(--gameengine-primary)",
                                            transform:
                                                selectedFilterType === item.value ? "scaleX(1)" : "scaleX(0)",
                                            transformOrigin: "left",
                                            transition: "transform 0.2s ease",
                                        }}
                                        _hover={{
                                            _after: {
                                                transform: "scaleX(1)",
                                            },
                                        }}
                                    >{item.label}</Button>
                                )
                            })}
                            {tabArray.length > 4 && (
                                <Box position={'relative'}>
                                    <Button
                                        minW={'auto'}
                                        variant={'plain'}
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        bg={'transparent'}
                                        height={'35px'}
                                        fontSize={'12px'}
                                        fontWeight={'500'}
                                        lineHeight={'20px'}
                                        padding={'0 12px'}
                                        minWidth={'100px'}
                                        display={'flex'}
                                        alignItems={'center'}
                                        justifyContent={'space-between'}
                                        color={'var(--gameengine-font-color)'}
                                        ref={relativeTo}
                                        _after={{
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            bottom: "-3px",
                                            width: "100%",
                                            height: "2px",
                                            bg: "var(--gameengine-primary)",
                                            transform:
                                                selectedFilterType === dropdownTab?.value ? "scaleX(1)" : "scaleX(0)",
                                            transformOrigin: "left",
                                            transition: "transform 0.2s ease",
                                        }}
                                        _hover={{
                                            _after: {
                                                transform: "scaleX(1)",
                                            },
                                        }}
                                    >
                                        {dropdownTab?.label ? dropdownTab?.label : __('More', 'gameengine')}
                                        <Icon as={FaAngleDown} width={'12px'}/>
                                    </Button>
                                    {showDropdown && (
                                        <Flex 
                                            flexDirection={'column'} 
                                            position={'absolute'} 
                                            top={'35px'} 
                                            left={'6px'}
                                            background={'#FFFFFF'}
                                            boxShadow={'var(--gameengine-shadow)'}
                                            borderRadius={'0 0 4px 4px'}
                                            maxHeight={'200px'}
                                            overflowY={'scroll'}
                                        >
                                            {tabArray.slice(4, tabArray.length).map((item, index) => {
                                                return (
                                                    <Button
                                                        minW={'auto'}
                                                        variant={'plain'}
                                                        ref={menuItemRef}
                                                        onClick={() => {
                                                            filterHookType(item.value)
                                                            setDropdownTab(item)
                                                        }}
                                                        key={index}
                                                        bg={'transparent'}
                                                        height={'35px'}
                                                        fontSize={'12px'}
                                                        fontWeight={'500'}
                                                        lineHeight={'20px'}
                                                        padding={'0 12px'}
                                                        color={'var(--gameengine-font-color)'}
                                                        _after={{
                                                            content: '""',
                                                            position: "absolute",
                                                            left: 0,
                                                            bottom: "-3px",
                                                            width: "100%",
                                                            height: "2px",
                                                            bg: "var(--gameengine-primary)",
                                                            transform:
                                                                selectedFilterType === item.value ? "scaleX(1)" : "scaleX(0)",
                                                            transformOrigin: "left",
                                                            transition: "transform 0.2s ease",
                                                        }}
                                                        _hover={{
                                                            _after: {
                                                                transform: "scaleX(1)",
                                                            },
                                                        }}
                                                    >{item.label}</Button>
                                                )
                                            })}
                                        </Flex>
                                    )}
                                </Box>
                            )}
                        </Box>

                        <DroppableArea id={`${actionName}s-available`}>
                            <Box key={selectedFilterType} className="gameengine-fade-in">
                                {allHooks
                                    .filter(item => !selectedHookIds?.includes(item?.id))
                                    .filter(item => selectedFilterType.length === 0 || selectedFilterType === item.integrationSlug || selectedFilterType === 'all')
                                    .map(h => (
                                        <Box key={h.id}>
                                            {renderHookCard(h, actionName)}
                                            <Text fontSize="xs" color="gray.500" mt={1}>{h.subTitle}</Text>
                                        </Box>
                                    ))}
                            </Box>
                        </DroppableArea>
                    </Flex>

                    <Box className={childRight} width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gameengine-shadow)">
                        <Flex direction="column" gap="4px" mb={6}>
                            <GFLabel type="plainHeading" margin={0} label={__("Active Hooks", "gameengine")} />
                            <GFLabel
                                type="subtitle"
                                color="var(--gameengine-font-color)"
                                label={__("The following hooks are used for all users", "gameengine")}
                            />
                        </Flex>

                        <DroppableArea id={`${actionName}s-sidebar`}>
                            {selectedHookIds && selectedHookIds
                                .map(id => allHooks?.find(h => h.id === id))
                                .filter(Boolean)
                                .map(h => (
                                    <DraggableItem key={`${actionName}_${h.id}`} id={`${actionName}_${h.id}`}>
                                        <HookConfigurationForm
                                            hookId={h.id}
                                            type={actionName}
                                            hookInfo={h}
                                            dispatch={dispatch}
                                            currentSettings={hookSettings[`${actionName}_${h.id}`]}
                                            isOpen={openHookType.includes(h.id)}
                                            setIsOpen={v =>
                                                setOpenHookType(
                                                    v ? [...openHookType, h.id] : openHookType.filter(i => i !== h.id)
                                                )
                                            }
                                            scope={scope}
                                        />
                                    </DraggableItem>
                                ))
                            }
                        </DroppableArea>
                    </Box>
                </Flex>
            )}
        </CollapsibleItem>
    );
};

export default Requirements;
