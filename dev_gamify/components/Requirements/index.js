import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Box, Flex, Text } from '@chakra-ui/react';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import GamifyInput from '@GFComponents/GamifyInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Select from 'react-select';
import HookConfigurationForm from './HookConfigurationForm';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useDispatch } from 'react-redux';

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
        label, onClick, open, parent, child, childLeft, childRight, filterHookType, renderHookCard, allHooks, hookTypeOptions, hookSettings, openHookType, setOpenHookType, selectedHookIds, actionName
    } = props;
    const dispatch = useDispatch();

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
                <Flex gap="24px" mt={6} width="100%" className={child}>
                    <Flex className={childLeft} width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px">
                        <Flex direction="column" gap="4px">
                            <GFLabel type="plainHeading" margin={0} label={__("Available Hooks", "gamify")} />
                            <GFLabel
                                type="subtitle"
                                color="var(--gamify-font-color)"
                                label={__("To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.", "gamify")}
                            />
                        </Flex>

                        <Box p="12px" border="1px solid var(--gamify-border-color)" borderRadius="4px">
                            <GamifyInput label={__("Filter Hooks Type", "gamify")}>
                                <Select
                                    className="gamify-select"
                                    classNamePrefix="gamify-select"
                                    isMulti
                                    options={hookTypeOptions}
                                    placeholder={__("Select hook type", "gamify")}
                                    onChange={filterHookType}
                                />
                            </GamifyInput>
                        </Box>

                        <DroppableArea id={`${actionName}s-available`}>
                            {allHooks
                                .filter(item => !selectedHookIds?.includes(item?.id))
                                .map(h => (
                                    <Box key={h.id}>
                                        {renderHookCard(h, actionName)}
                                        <Text fontSize="xs" color="gray.500" mt={1}>{h.subTitle}</Text>
                                    </Box>
                                ))}
                        </DroppableArea>
                    </Flex>

                    <Box className={childRight} width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)">
                        <Flex direction="column" gap="4px" mb={6}>
                            <GFLabel type="plainHeading" margin={0} label={__("Active Hooks", "gamify")} />
                            <GFLabel
                                type="subtitle"
                                color="var(--gamify-font-color)"
                                label={__("The following hooks are used for all users", "gamify")}
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
