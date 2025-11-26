import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Flex,
    Icon,
    Spinner,
    Text,
    Input,
    useToast, // Ensure ChakraProvider is wrapping your App
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
import GFSelect from '@Components/Select';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

// Redux Actions
import {
    setPointName,
    setPluralName,
    fetchTriggers,
    savePointType,
    updatePointType,
    fetchPointTypeById,
    resetPointTypeForm,
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

// --- Hook Configuration Form (Reusable) ---
const HookConfigurationForm = ({ hookId, type, hookInfo, dispatch, currentSettings }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Default settings structure
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
                    <LabeledInput
                        label="Points"
                        placeholder="100"
                        type="number"
                        value={settings.points}
                        onChange={(e) => handleChange('points', e.target.value)}
                    />
                    <GFSelect
                        label="Limit"
                        placeholder="Choose limit"
                        items={[
                            { label: 'Unlimited', value: 'unlimited' },
                            { label: '1 per day', value: '1_per_day' },
                            { label: '1 time only', value: '1_time' },
                        ]}
                        value={settings.limit}
                        onChange={(val) => handleChange('limit', val)}
                    />
                </Flex>

                <Box padding="0 24px">
                    <LabeledInput
                        label="Log Label"
                        placeholder={__('e.g. Daily Login Bonus', 'gamify')}
                        type="text"
                        value={settings.label}
                        onChange={(e) => handleChange('label', e.target.value)}
                    />
                </Box>

                <Box padding="0 24px">
                    <LabeledInput
                        label="Reference URL (Optional)"
                        type="text"
                        placeholder={__('https://...', 'gamify')}
                        value={settings.url}
                        onChange={(e) => handleChange('url', e.target.value)}
                    />
                </Box>

                <Divider width='100%' margin='24px 0' />

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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');

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
        saveStatus,
        currentPointTypeId
    } = useSelector((state) => state.pointType);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // 1. Load Initial Data (Triggers)
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchTriggers());
        }
    }, [status, dispatch]);

    // 2. Handle Edit vs Add Mode
    useEffect(() => {
        if (editId) {
            dispatch(fetchPointTypeById(editId));
        } else {
            dispatch(resetPointTypeForm());
        }
    }, [editId, dispatch]);

    // --- Logic for Award Hooks ---
    const availableAwardHooks = allHooks.filter(h => !selectedAwardHookIds.includes(h.id));
    const activeAwardHooks = selectedAwardHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    // --- Logic for Deduct Hooks ---
    const availableDeductHooks = allHooks.filter(h => !selectedDeductHookIds.includes(h.id));
    const activeDeductHooks = selectedDeductHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    // Handle Drag End
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        const draggedId = active.id;
        const dropZoneId = over.id;

        // Awards Dragging
        if (availableAwardHooks.some(h => h.id === draggedId) && dropZoneId === 'awards-sidebar') {
            dispatch(addAwardHook(draggedId));
        }
        if (selectedAwardHookIds.includes(draggedId) && dropZoneId === 'awards-available') {
            dispatch(removeAwardHook(draggedId));
        }

        // Deductions Dragging
        if (availableDeductHooks.some(h => h.id === draggedId) && dropZoneId === 'deductions-sidebar') {
            dispatch(addDeductHook(draggedId));
        }
        if (selectedDeductHookIds.includes(draggedId) && dropZoneId === 'deductions-available') {
            dispatch(removeDeductHook(draggedId));
        }
    };

    // Save Handler
    const handleSave = async () => {
        if (!name) {
            alert('Please enter a Point Name');
            return;
        }

        const payload = {
            name,
            plural_name: pluralName,
            requirements: [
                // Awards
                ...selectedAwardHookIds.map(id => ({
                    trigger_key: id,
                    action_type: 'award',
                    parameters: hookSettings[`award_${id}`] || {}
                })),
                // Deductions
                ...selectedDeductHookIds.map(id => ({
                    trigger_key: id,
                    action_type: 'deduct',
                    parameters: hookSettings[`deduct_${id}`] || {}
                }))
            ]
        };

        let resultAction;
        if (currentPointTypeId) {
            // Update
            resultAction = await dispatch(updatePointType({ id: currentPointTypeId, data: payload }));
        } else {
            // Create
            resultAction = await dispatch(savePointType(payload));
        }

        if (savePointType.fulfilled.match(resultAction) || updatePointType.fulfilled.match(resultAction)) {
            alert(currentPointTypeId ? "Updated Successfully!" : "Saved Successfully!");
            if (!currentPointTypeId) {
                navigate('/points'); // Redirect to list on create
            }
        } else {
            console.error("Save failed:", resultAction.payload);
            alert("Error saving. Check console.");
        }
    };

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"></span>
                        <span className="gamify-icon gamify-icon--angle-right"></span>
                        <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
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
                                        <Text fontSize="14px" fontWeight='400' color="var(--gamify-font-color)" margin='0'>{__(`Drag hooks to activate.`, 'gamify')}</Text>
                                    </Flex>

                                    <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                        <Text fontWeight="500" fontSize="0.875rem" margin='0 0 8px 0'>{__("Filter Hooks Type", "gamify")}</Text>
                                        <Select
                                            isMulti
                                            placeholder={__("Select hook type", "gamify")}
                                            classNamePrefix="gamify-select"
                                            options={[{ label: "Gamify", value: "gamify" }, { label: "WordPress", value: "wordpress" }]}
                                        />
                                    </Box>

                                    <DroppableArea id="awards-available">
                                        {status === 'loading' ? <Flex justify="center"><Spinner /></Flex> :
                                            availableAwardHooks.map(item => (
                                                <Box key={item.id}>
                                                    <DraggableItem id={item.id}>
                                                        <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                            <Flex justify="space-between" align="center">
                                                                <Text margin='0' fontSize="1rem" fontWeight="600">{__(item.label, 'gamify')}</Text>
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
                                <Flex flexDirection="column" gap="12px" width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                    <Flex flexDirection='column' gap='12px'>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Hooks`, 'gamify')} />
                                        <Text fontSize="14px"  fontWeight='400' color="var(--gamify-font-color)" margin='0'>{__(`The following hooks are used for all users`, 'gamify')}</Text>
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
                                </Flex>
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
                                        <Text fontSize="14px" fontWeight='400' color="var(--gamify-font-color)" margin='0'>{__(`Drag hooks to activate deductions.`, 'gamify')}</Text>
                                    </Flex>

                                    <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                        <Text fontWeight="500" fontSize="0.875rem" margin='0 0 8px 0'>{__("Filter Hooks Type", "gamify")}</Text>
                                        <Select
                                            isMulti
                                            placeholder={__("Select hook type", "gamify")}
                                            classNamePrefix="gamify-select"
                                            options={[{ label: "Gamify", value: "gamify" }, { label: "WordPress", value: "wordpress" }]}
                                        />
                                    </Box>

                                    <DroppableArea id="deductions-available">
                                        {status === 'loading' ? <Flex justify="center"><Spinner /></Flex> :
                                            availableDeductHooks.map(item => (
                                                <Box key={item.id}>
                                                    <DraggableItem id={item.id}>
                                                        <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                            <Flex justify="space-between" align="center">
                                                                <Text margin='0' fontSize="1rem" fontWeight="600">{__(item.label, 'gamify')}</Text>
                                                                <Box bg="red.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FaArrowRotateRight} boxSize={3} /></Box>
                                                            </Flex>
                                                        </Box>
                                                    </DraggableItem>
                                                    <Text fontSize="xs" color="gray.500" mt={1}>{item.subTitle}</Text>
                                                </Box>
                                            ))
                                        }
                                    </DroppableArea>
                                </Flex>

                                {/* Active Deductions */}
                                <Flex flexDirection="column" gap="12px" width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                    <Flex flexDirection='column' gap='12px'>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Deduction Hooks`, 'gamify')} />
                                        <Text fontSize="14px" fontWeight='400'  color="var(--gamify-font-color)" margin='0'>{__(`The following hooks are used for all users`, 'gamify')}</Text>
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
                                </Flex>
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
                            {currentPointTypeId ? __('Update', 'gamify') : __('Save Changes', 'gamify')}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default PointType;