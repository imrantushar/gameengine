import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Flex,
    Icon,
    Spinner,
    Text,
    Input,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FaArrowRotateRight } from 'react-icons/fa6';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';
import Select from 'react-select';

// Components
import TopBar from '@Components/TopBar';
import GFLabel from '@Components/Labels/GFLabel';
import LabeledInput from '@Components/LabeledInput';
import CustomCollapsible from '@Components/Collapsible';
import Divider from '@Components/Divider';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

// Redux Actions
import {
    setPointName,
    setPluralName,
    fetchTriggers,
    savePointType,
    addAwardHook,
    removeAwardHook,
    addDeductHook,
    removeDeductHook,
    updateHookSettings
} from '../../../../redux/Slices/pointTypeSlice';

// --- Draggable Item ---
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: "grab",
        zIndex: isDragging ? 999 : 1
    };
    return (
        <Box ref={setNodeRef} {...listeners} {...attributes} style={style} marginBottom="8px">
            {children}
        </Box>
    );
};

// --- Droppable Area ---
const DroppableArea = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <Box
            ref={setNodeRef}
            minHeight="200px"
            background={isOver ? "rgba(79,70,229,0.04)" : "transparent"}
            borderRadius="4px"
            border={isOver ? "1px dashed #4F46E5" : "1px solid transparent"}
            transition="all 0.2s"
        >
            <Box marginTop="12px">{children}</Box>
        </Box>
    );
};

// --- Reusable Hook Configuration Form ---
// This replaces 'PointsLogins' and works for ANY hook
const HookConfigurationForm = ({ hookId, type, hookInfo, dispatch, currentSettings }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Default values or current values from Redux
    const settings = currentSettings || { points: '', limit: 'unlimited', label: '', url: '' };

    const handleChange = (field, value) => {
        dispatch(updateHookSettings({
            type: type, // 'award' or 'deduct'
            hookId: hookId,
            settings: { [field]: value }
        }));
    };

    return (
        <Box background="white" borderRadius="4px" border="1px solid var(--gamify-border-color)">
            <CustomCollapsible
                label={hookInfo?.label || hookId}
                desc={hookInfo?.subTitle}
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                singleIcon={true}
            >
                <Flex gap='12px' padding="0 24px">
                    <Flex as="label" direction="column" gap={2} width="50%">
                        <Text className='gamify-title' fontSize="sm" fontWeight="500">{__('Points', 'gamify')}</Text>
                        <Input
                            className="gamify-input"
                            type="number"
                            placeholder={__('100', 'gamify')}
                            value={settings.points}
                            onChange={(e) => handleChange('points', e.target.value)}
                        />
                    </Flex>
                    <Flex as="label" direction="column" gap={2} width="50%">
                        <Text className='gamify-title' fontSize="sm" fontWeight="500">{__('Limit', 'gamify')}</Text>
                        <Select
                            placeholder={__('Select limit', 'gamify')}
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            options={[
                                { label: 'Unlimited', value: 'unlimited' },
                                { label: '1 per day', value: '1_per_day' },
                                { label: '1 time only', value: '1_time' },
                            ]}
                            value={settings.limit ? { label: settings.limit, value: settings.limit } : null}
                            onChange={(opt) => handleChange('limit', opt.value)}
                        />
                    </Flex>
                </Flex>

                <Flex direction="column" gap={2} padding="12px 24px">
                    <Text className='gamify-title' fontSize="sm" fontWeight="500">{__('Log Label', 'gamify')}</Text>
                    <Input
                        className="gamify-input"
                        type="text"
                        placeholder={__('e.g. Daily Login Bonus', 'gamify')}
                        value={settings.label}
                        onChange={(e) => handleChange('label', e.target.value)}
                    />
                </Flex>

                <Flex direction="column" gap={2} padding="0 24px 24px 24px">
                    <Text className='gamify-title' fontSize="sm" fontWeight="500">{__('Reference URL (Optional)', 'gamify')}</Text>
                    <Input
                        className="gamify-input"
                        type="text"
                        placeholder={__('https://...', 'gamify')}
                        value={settings.url}
                        onChange={(e) => handleChange('url', e.target.value)}
                    />
                </Flex>

                {/* The Save button inside individual item is visual, as state updates instantly */}
                <Flex padding="0 24px 24px" justifyContent='flex-end'>
                    <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>
                        {__('Done', 'gamify')}
                    </Button>
                </Flex>
            </CustomCollapsible>
        </Box>
    );
};


const PointType = () => {
    const dispatch = useDispatch();

    // Local UI toggle state
    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);

    // Get State from Redux
    const {
        name,
        pluralName,
        allHooks,
        selectedAwardHookIds,
        selectedDeductHookIds,
        hookSettings,
        status,
        saveStatus
    } = useSelector((state) => state.pointType);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Fetch Data
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchTriggers());
        }
    }, [status, dispatch]);

    // --- Logic for Award Hooks ---
    // Filter hooks that are NOT selected in awards
    const availableAwardHooks = allHooks.filter(h => !selectedAwardHookIds.includes(h.id));
    // Get full objects for selected awards
    const activeAwardHooks = selectedAwardHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    // --- Logic for Deduct Hooks ---
    // Filter hooks that are NOT selected in deductions
    const availableDeductHooks = allHooks.filter(h => !selectedDeductHookIds.includes(h.id));
    // Get full objects for selected deductions
    const activeDeductHooks = selectedDeductHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);


    // Handle Drag End
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        const draggedId = active.id;
        const dropZoneId = over.id;

        // --- Awards Dragging ---
        // Available -> Active
        if (availableAwardHooks.some(h => h.id === draggedId) && dropZoneId === 'awards-sidebar') {
            dispatch(addAwardHook(draggedId));
        }
        // Active -> Available (Remove)
        if (selectedAwardHookIds.includes(draggedId) && dropZoneId === 'awards-available') {
            dispatch(removeAwardHook(draggedId));
        }

        // --- Deductions Dragging ---
        // Available -> Active
        if (availableDeductHooks.some(h => h.id === draggedId) && dropZoneId === 'deductions-sidebar') {
            dispatch(addDeductHook(draggedId));
        }
        // Active -> Available (Remove)
        if (selectedDeductHookIds.includes(draggedId) && dropZoneId === 'deductions-available') {
            dispatch(removeDeductHook(draggedId));
        }
    };

    // Main Save Handler
    const handleSave = async () => {
        if (!name) {
            alert('Please enter a Point Name');
            return;
        }

        // Prepare Data Payload
        const payload = {
            name,
            plural_name: pluralName,
            // Combine awards and deductions into requirements list
            requirements: [
                ...selectedAwardHookIds.map(id => ({
                    trigger_key: id,
                    action_type: 'award',
                    parameters: hookSettings[`award_${id}`] || {}
                })),
                ...selectedDeductHookIds.map(id => ({
                    trigger_key: id,
                    action_type: 'deduct',
                    parameters: hookSettings[`deduct_${id}`] || {}
                }))
            ]
        };

        const resultAction = await dispatch(savePointType(payload));

        if (savePointType.fulfilled.match(resultAction)) {
            alert("Saved Successfully!");
        } else {
            console.error("Save failed:", resultAction.payload);
            alert("Error saving.");
        }
    };

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"></span>
                        <span className="gamify-icon gamify-icon--angle-right"></span>
                        <GFLabel as="h2" color="#4F46E5" type="subtitle" fontWeight="medium" label={__("Dashboard", "gamify")} />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto" paddingBottom="50px">
                <Flex width="100%" direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>

                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Point Types`, 'gamify')} />

                    <LabeledInput label="Point Name" placeholder="Academy Lms" value={name} onChange={(e) => dispatch(setPointName(e.target.value))} />
                    <LabeledInput label="Plural Name" placeholder="Skill Tones" value={pluralName} onChange={(e) => dispatch(setPluralName(e.target.value))} />

                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>

                        {/* ================= AWARDS SECTION ================= */}
                        <CustomCollapsible label="Automatic Point Awards" isOpen={pointAwards} onClick={() => setPointAwards(!pointAwards)} />
                        {pointAwards && (
                            <Flex gap="24px" marginBottom="24px">
                                {/* Available Awards */}
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                    <Flex flexDirection='column' gap='12px'>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, 'gamify')} />
                                        <Text fontSize="12px" color="gray.500">{__(`Drag hooks to the right to activate.`, 'gamify')}</Text>
                                    </Flex>
                                    <DroppableArea id="awards-available">
                                        {status === 'loading' ? <Flex justify="center"><Spinner /></Flex> :
                                            availableAwardHooks.map(item => (
                                                <Box key={item.id}>
                                                    <DraggableItem id={item.id}>
                                                        <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                            <Flex justify="space-between" align="center">
                                                                <Text margin='0' fontWeight="600">{item.label}</Text>
                                                                <Box bg="green.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FaArrowRotateRight} boxSize={3} /></Box>
                                                            </Flex>
                                                        </Box>
                                                    </DraggableItem>
                                                    <Text fontSize="xs" color="gray.500" mt={1}>{item.subTitle}</Text>
                                                </Box>
                                            ))
                                        }
                                    </DroppableArea>
                                </Flex>

                                {/* Active Awards */}
                                <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                    <Flex flexDirection='column' gap='12px'>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Hooks`, 'gamify')} />
                                        <Text fontSize="12px" color="gray.500">{__(`Configure points for these actions.`, 'gamify')}</Text>
                                    </Flex>
                                    <DroppableArea id="awards-sidebar">
                                        {activeAwardHooks.map(hook => (
                                            <DraggableItem key={hook.id} id={hook.id}>
                                                <HookConfigurationForm
                                                    hookId={hook.id}
                                                    type="award"
                                                    hookInfo={hook}
                                                    dispatch={dispatch}
                                                    currentSettings={hookSettings[`award_${hook.id}`]}
                                                />
                                            </DraggableItem>
                                        ))}
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        )}

                        <Divider />

                        {/* ================= DEDUCTIONS SECTION ================= */}
                        <CustomCollapsible label="Automatic Point Deductions" isOpen={pointDeductions} onClick={() => setPointDeductions(!pointDeductions)} />
                        {pointDeductions && (
                            <Flex gap="24px">
                                {/* Available Deductions */}
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                    <Flex flexDirection='column' gap='12px'>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, 'gamify')} />
                                        <Text fontSize="12px" color="gray.500">{__(`Drag hooks to the right to activate deductions.`, 'gamify')}</Text>
                                    </Flex>
                                    <DroppableArea id="deductions-available">
                                        {availableDeductHooks.map(item => (
                                            <Box key={item.id}>
                                                <DraggableItem id={item.id}>
                                                    <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                        <Flex justify="space-between" align="center">
                                                            <Text margin='0' fontWeight="600">{item.label}</Text>
                                                            <Box bg="red.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FaArrowRotateRight} boxSize={3} /></Box>
                                                        </Flex>
                                                    </Box>
                                                </DraggableItem>
                                                <Text fontSize="xs" color="gray.500" mt={1}>{item.subTitle}</Text>
                                            </Box>
                                        ))}
                                    </DroppableArea>
                                </Flex>

                                {/* Active Deductions */}
                                <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                    <Flex flexDirection='column' gap='12px'>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Deduction Hooks`, 'gamify')} />
                                        <Text fontSize="12px" color="gray.500">{__(`Configure deductions for these actions.`, 'gamify')}</Text>
                                    </Flex>
                                    <DroppableArea id="deductions-sidebar">
                                        {activeDeductHooks.map(hook => (
                                            <DraggableItem key={hook.id} id={hook.id}>
                                                <HookConfigurationForm
                                                    hookId={hook.id}
                                                    type="deduct"
                                                    hookInfo={hook}
                                                    dispatch={dispatch}
                                                    currentSettings={hookSettings[`deduct_${hook.id}`]}
                                                />
                                            </DraggableItem>
                                        ))}
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        )}

                    </DndContext>

                    <Flex padding="24px 0" justifyContent='flex-end' borderTop='1px solid var(--gamify-border-color)'>
                        <Button
                            {...primaryBtn}
                            width='121px'
                            onClick={handleSave}
                            isLoading={saveStatus === 'saving'}
                        >
                            {__('Save Changes', 'gamify')}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default PointType;