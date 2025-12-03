
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
import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';
import LabeledInput from '@GFComponents/LabeledInput';
import CustomCollapsible from '@GFComponents/Collapsible';
import Divider from '@GFComponents/Divider';

// Imports

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
} from '@GFRedux/Slices/pointTypeSlice';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';


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
        <Box ref={setNodeRef} {...listeners} {...attributes} style={style} marginBottom="8px">
            {children}
        </Box>
    );
};


// # DROPPABLE
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


// # DYNAMIC FIELD
const DynamicField = ({ fieldKey, config, value, onChange }) => {
    if (config.type === 'select' && config.options) {
        const selectOptions = Object.entries(config.options).map(([val, label]) => ({
            value: val,
            label: label
        }));

        return (
            <Box width="100%">
                <Text className='gamify-title' fontSize="sm" fontWeight="500" mb="8px">
                    {config.label} {config.required && <span style={{ color: 'red' }}>*</span>}
                </Text>
                <Select
                    placeholder={__('Select...', 'gamify')}
                    className="gamify-select"
                    classNamePrefix="gamify-select"
                    options={selectOptions}
                    value={selectOptions.find(opt => opt.value == value) || null}
                    onChange={(val) => onChange(val ? val.value : '')}
                />
            </Box>
        );
    }

    return (
        <LabeledInput
            label={config.label}
            placeholder={config.placeholder || ''}
            type={config.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={config.required}
        />
    );
};


// # HOOK FORM
const DynamicHookForm = ({ hookId, hookInfo, type, settings, handleChange, isOpen, setIsOpen }) => {
    const fieldsConfig = type === 'award'
        ? (hookInfo.award_fields || {})
        : (hookInfo.deduct_fields || {});

    return (
        <CustomCollapsible
            label={(type === 'deduct' ? __('Deduct: ', 'gamify') : '') + (hookInfo?.label || hookId)}
            desc={hookInfo?.subTitle}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >

            <Flex direction="column" gap="16px" padding="0 24px">
                {Object.keys(fieldsConfig).map((key) => {
                    const config = fieldsConfig[key];


                    if (config.scope && !config.scope.includes('point_type')) {
                        return null;
                    }

                    const currentValue = settings[key] ?? config.default ?? '';

                    return (
                        <DynamicField
                            key={key}
                            fieldKey={key}
                            config={config}
                            value={currentValue}
                            onChange={(val) => handleChange(key, val)}
                        />
                    );
                })}
            </Flex>

            <Divider width='100%' margin='24px 0' />

            <Flex padding="0 24px 24px" justifyContent='flex-end'>
                <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>
                    {__('Done', 'gamify')}
                </Button>
            </Flex>
        </CustomCollapsible>
    );
};


// # WRAPPER
const HookConfigurationForm = ({ hookId, type, hookInfo, dispatch, currentSettings }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (field, value) => {
        dispatch(updateHookSettings({
            type: type,
            hookId: hookInfo.id,
            settings: { [field]: value }
        }));
    };

    return (
        <Box background="white" borderRadius="4px" border="1px solid var(--gamify-border-color)">
            <DynamicHookForm
                hookId={hookId}
                hookInfo={hookInfo}
                type={type}
                settings={currentSettings || {}}
                handleChange={handleChange}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
        </Box>
    );
};



// # MAIN
const PointType = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');

    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);

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


    // LOAD TRIGGERS
    useEffect(() => {
        if (status === 'idle') dispatch(fetchTriggers());
    }, [status, dispatch]);


    // EDIT MODE
    useEffect(() => {
        if (editId) dispatch(fetchPointTypeById(editId));
        else dispatch(resetPointTypeForm());
    }, [editId, dispatch]);



    // === FIXED UNIQUE IDs ===
    const availableAwardHooks = allHooks.filter(h => !selectedAwardHookIds.includes(h.id));
    const activeAwardHooks = selectedAwardHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const availableDeductHooks = allHooks.filter(h => !selectedDeductHookIds.includes(h.id));
    const activeDeductHooks = selectedDeductHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);



    // # DRAG END FIXED
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const draggedId = active.id;

        // ---------------- AWARD ZONE ----------------
        if (draggedId.startsWith("award_")) {
            const pureId = draggedId.replace("award_", "");

            if (over.id === "awards-sidebar") {
                dispatch(addAwardHook(pureId));
            }
            if (over.id === "awards-available") {
                dispatch(removeAwardHook(pureId));
            }
        }

        // ---------------- DEDUCT ZONE ----------------
        if (draggedId.startsWith("deduct_")) {
            const pureId = draggedId.replace("deduct_", "");

            if (over.id === "deductions-sidebar") {
                dispatch(addDeductHook(pureId));
            }
            if (over.id === "deductions-available") {
                dispatch(removeDeductHook(pureId));
            }
        }
    };



    // SAVE HANDLER
    const handleSave = async () => {
        if (!name) return alert('Please enter a Point Name');

        const getParameters = (hook, type) => {
            const settings = hookSettings[`${type}_${hook.id}`] || {};
            const fieldsConfig =
                type === 'award' ? (hook.award_fields || {}) : (hook.deduct_fields || {});

            const params = {};
            Object.keys(fieldsConfig).forEach(key => {
                params[key] = settings[key] ?? fieldsConfig[key].default;
            });
            return params;
        };

        const payload = {
            name,
            plural_name: pluralName,
            requirements: [
                ...activeAwardHooks.map(hook => ({
                    trigger_key: hook.id,
                    action_type: 'award',
                    parameters: getParameters(hook, 'award')
                })),

                ...activeDeductHooks.map(hook => ({
                    trigger_key: hook.id,
                    action_type: 'deduct',
                    parameters: getParameters(hook, 'deduct')
                }))
            ]
        };

        let resultAction;
        if (currentPointTypeId) {
            resultAction = await dispatch(
                updatePointType({ id: currentPointTypeId, data: payload })
            );
        } else {
            resultAction = await dispatch(savePointType(payload));
        }

        if (savePointType.fulfilled.match(resultAction) ||
            updatePointType.fulfilled.match(resultAction)) {
            alert(currentPointTypeId ? "Updated Successfully!" : "Saved Successfully!");
            if (!currentPointTypeId) navigate(`${ route_path }admin.php?page=gamify-points`);
        } else {
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

                    <LabeledInput label="Point Name" value={name} onChange={(e) => dispatch(setPointName(e.target.value))} />
                    <LabeledInput label="Plural Name" value={pluralName} onChange={(e) => dispatch(setPluralName(e.target.value))} />


                    {/* # DND */}
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <CustomCollapsible label="Automatic Point Awards" isOpen={pointAwards} onClick={() => setPointAwards(!pointAwards)} />
                        {pointAwards && (
                            <Flex gap="24px" marginBottom="24px">

                                {/* LEFT AVAILABLE */}
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">

                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, 'gamify')} />

                                    <DroppableArea id="awards-available">
                                        {availableAwardHooks.map((item) => (
                                            <Box key={item.id}>
                                                <DraggableItem id={`award_${item.id}`}>
                                                    <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                        <Flex justify="space-between" align="center">
                                                            <Text margin='0' fontSize="1rem" fontWeight="600">{__(item.label, 'gamify')}</Text>
                                                            <Box bg="green.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FaArrowRotateRight} boxSize={3} /></Box>
                                                        </Flex>
                                                    </Box>
                                                </DraggableItem>
                                                <Text fontSize="xs" color="gray.500" mt={1}>{item.subTitle}</Text>
                                            </Box>
                                        ))}
                                    </DroppableArea>
                                </Flex>


                                {/* RIGHT ACTIVE */}
                                <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">

                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Hooks`, 'gamify')} />

                                    <DroppableArea id="awards-sidebar">
                                        {activeAwardHooks.map((hook) => (
                                            <DraggableItem key={hook.id} id={`award_${hook.id}`}>
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
                        <CustomCollapsible label="Automatic Point Deductions" isOpen={pointDeductions} onClick={() => setPointDeductions(!pointDeductions)} />

                        {pointDeductions && (
                            <Flex gap="24px">

                                {/* LEFT AVAILABLE */}
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">

                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, 'gamify')} />

                                    <DroppableArea id="deductions-available">
                                        {availableDeductHooks.map((item) => (
                                            <Box key={item.id}>
                                                <DraggableItem id={`deduct_${item.id}`}>
                                                    <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                        <Flex justify="space-between" align="center">
                                                            <Text margin='0' fontSize="1rem" fontWeight="600">{__(item.label, 'gamify')}</Text>
                                                            <Box bg="red.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white"><Icon as={FaArrowRotateRight} boxSize={3} /></Box>
                                                        </Flex>
                                                    </Box>
                                                </DraggableItem>
                                                <Text fontSize="xs" color="gray.500" mt={1}>{item.subTitle}</Text>
                                            </Box>
                                        ))}
                                    </DroppableArea>
                                </Flex>


                                {/* RIGHT ACTIVE */}
                                <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">

                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Deduction Hooks`, 'gamify')} />

                                    <DroppableArea id="deductions-sidebar">
                                        {activeDeductHooks.map(hook => (
                                            <DraggableItem key={hook.id} id={`deduct_${hook.id}`}>
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
                            {currentPointTypeId ? __('Update', 'gamify') : __('Save Changes', 'gamify')}
                        </Button>
                    </Flex>


                </Flex>
            </Box>
        </>
    );
};

export default PointType;
