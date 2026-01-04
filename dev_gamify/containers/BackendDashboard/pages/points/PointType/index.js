
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
import { FaArrowRotateRight, FaChevronRight, FaGamepad, FaWordpressSimple } from 'react-icons/fa6';
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
} from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { AiFillInteraction } from 'react-icons/ai';


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
            borderRadius="4px"
            height='100%'
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

            <Flex direction="column" gap="16px">
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

            <Divider width='100%' margin='12px 0' />

            <Flex padding="0 24px 0 24px" justifyContent='flex-end'>
                <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>
                    {__('Done', 'gamify')}
                </Button>
            </Flex>
        </CustomCollapsible>
    );
};


// # WRAPPER
const HookConfigurationForm = ({ hookId, type, hookInfo, dispatch, currentSettings, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) => {
    const HookConfigurationFormControlled = ({ isOpen: innerIsOpen, setIsOpen: innerSetIsOpen }) => {
        const [isOpenState, setIsOpenState] = useState(false);
        const isControlled = typeof externalIsOpen !== 'undefined' && typeof externalSetIsOpen === 'function';
        const isOpen = isControlled ? externalIsOpen : (typeof innerIsOpen !== 'undefined' ? innerIsOpen : isOpenState);
        const setIsOpen = isControlled ? externalSetIsOpen : (typeof innerSetIsOpen === 'function' ? innerSetIsOpen : setIsOpenState);

        const handleChange = (field, value) => {
            dispatch(updateHookSettings({
                type: type,
                hookId: hookInfo.id,
                settings: { [field]: value }
            }));
        };

        return (
            <Box background="white" borderRadius="4px" >
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

    return <HookConfigurationFormControlled isOpen={externalIsOpen} setIsOpen={externalSetIsOpen} />;
};



// # MAIN
const PointType = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');

    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);
    const [openedAwardHooks, setOpenedAwardHooks] = useState([]);
    const [openedDeductHooks, setOpenedDeductHooks] = useState([]);
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);


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
        dispatch(fetchTriggers());
    }, [dispatch]);


    // EDIT MODE
    useEffect(() => {
        if (editId) dispatch(fetchPointTypeById(editId));
        else dispatch(resetPointTypeForm());
    }, [editId, dispatch]);



    // === FIXED UNIQUE IDs ===
    const availableAwardHooks = allHooks.filter((hook) => {
        if (selectedAwardHookIds.includes(hook.id)) return false;
        if (selectedFilterHookType.length > 0) {
            return selectedFilterHookType.includes(hook.category);
        }

        return true;
    });

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
                setOpenedAwardHooks([pureId]);
            }
            if (over.id === "awards-available") {
                dispatch(removeAwardHook(pureId));
                setOpenedAwardHooks(prev => prev.filter(id => id !== pureId));
            }
        }

        // ---------------- DEDUCT ZONE ----------------
        if (draggedId.startsWith("deduct_")) {
            const pureId = draggedId.replace("deduct_", "");

            if (over.id === "deductions-sidebar") {
                dispatch(addDeductHook(pureId));
                setOpenedDeductHooks([pureId]);
            }
            if (over.id === "deductions-available") {
                dispatch(removeDeductHook(pureId));
                setOpenedDeductHooks(prev => prev.filter(id => id !== pureId));
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
            if (!currentPointTypeId) navigate(`${route_path}admin.php?page=gamify-points`);
        } else {
            alert("Error saving. Check console.");
        }
    };


    const hookTypeOptions = Array.from(
        new Set(allHooks.map((hook) => hook.category))
    ).map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
    }));
    const hookCategoryIconMap = {
        wordpress: {
            icon: FaWordpressSimple,
            bg: "blue.500",
        },
        gamify: {
            icon: FaGamepad,
            bg: "purple.500",
        },
        interaction: {
            icon: AiFillInteraction,

        },
    };
    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" />
                                <path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" />
                            </svg>
                        </span>
                        <span className="gamify-icon gamify-icon--angle-right">   <FaChevronRight />
                        </span>
                        <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto" paddingBottom="50px">
                <Flex width="100%" direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>


                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Point Types`, 'gamify')} />

                    <Flex gap="24px">
                        <LabeledInput style={{ width: '50%' }} label="Point Name" value={name} onChange={(e) => {
                            const value = e.target.value;
                            dispatch(setPointName(value));
                            dispatch(setPluralName(value ? `${value}s` : ""));

                        }} />
                        <LabeledInput style={{ width: '50%' }} label="Plural Name" value={pluralName} />
                    </Flex>



                    {/* # DND */}
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <CustomCollapsible label="Automatic Point Awards" isOpen={pointAwards} onClick={() => setPointAwards(!pointAwards)} />
                        {pointAwards && (
                            <Flex gap="24px" marginBottom="24px">

                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                    <Flex direction="column" gap="12px">
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, "gamify")} margin='0' />
                                        <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`Drag hooks to activate.`, "gamify")} color="var(--gamify-font-color)" margin='0' />
                                    </Flex>
                                    <Flex as="label" direction="column" gap={2}>
                                        <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                            <Text fontWeight="500" fontSize="0.875rem" margin='0 0 8px 0'>
                                                {__("Filter Hooks Type", "gamify")}
                                            </Text>

                                            <Select
                                                isMulti
                                                placeholder={__("Select hook type", "gamify")}
                                                classNamePrefix="gamify-select"
                                                options={hookTypeOptions}
                                                onChange={(opts) => {
                                                    const values = opts ? opts.map(o => o.value) : [];
                                                    setSelectedFilterHookType(values);
                                                }}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: "48px",
                                                        borderRadius: "6px",
                                                        borderColor: "#d0d5dd",
                                                        boxShadow: "none",
                                                        "&:hover": {
                                                            borderColor: "#d0d5dd",
                                                        },
                                                    }),

                                                    multiValue: (base) => ({
                                                        ...base,
                                                        background: "#F8FAFC",
                                                        padding: "2px 6px",
                                                        borderRadius: "6px",
                                                    }),

                                                    multiValueLabel: (base) => ({
                                                        ...base,
                                                        color: "#1E293B",
                                                        fontSize: "14px",
                                                    }),

                                                    multiValueRemove: (base) => ({
                                                        ...base,
                                                        color: "#64748B",
                                                        ":hover": {
                                                            backgroundColor: "transparent",
                                                            color: "#334155",
                                                        },
                                                    }),
                                                }}
                                            />
                                        </Box>
                                    </Flex>

                                    <DroppableArea id="awards-available">
                                        {availableAwardHooks.map((item) => {
                                            const categoryConfig = hookCategoryIconMap[item.category] || {};
                                            const CategoryIcon = categoryConfig.icon;
                                            const bgColor = categoryConfig.bg || "gray.500";
                                            return (
                                                <Box key={item.id}>
                                                    <DraggableItem id={`award_${item.id}`}>
                                                        <Box
                                                            padding="12px"
                                                            borderRadius="6px"
                                                            border="1px solid var(--gamify-border-color)"
                                                        >
                                                            <Flex justify="space-between" align="center">

                                                                <Flex gap='5px'>
                                                                    {CategoryIcon &&
                                                                        <Box
                                                                            bg={bgColor}
                                                                            borderRadius="full"
                                                                            width="24px"
                                                                            height="24px"
                                                                            display="flex"
                                                                            alignItems="center"
                                                                            justifyContent="center"
                                                                            color="white"
                                                                        >
                                                                            <Icon as={CategoryIcon} boxSize={3} />
                                                                        </Box>
                                                                    }

                                                                    <Text margin="0" fontSize="1rem" fontWeight="600">
                                                                        {__(item.label, "gamify")}
                                                                    </Text>
                                                                </Flex>
                                                                <Box
                                                                    bg="green.500"
                                                                    borderRadius="full"
                                                                    width="24px"
                                                                    height="24px"
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                    color="white"
                                                                >
                                                                    <Icon as={FaArrowRotateRight} boxSize={3} />
                                                                </Box>
                                                            </Flex>
                                                        </Box>
                                                    </DraggableItem>

                                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                                        {item.subTitle}
                                                    </Text>
                                                </Box>
                                            );
                                        })}


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
                                                    isOpen={openedAwardHooks.includes(hook.id)}
                                                    setIsOpen={(val) => {
                                                        if (val) setOpenedAwardHooks(prev => prev.includes(hook.id) ? prev : [...prev, hook.id]);
                                                        else setOpenedAwardHooks(prev => prev.filter(id => id !== hook.id));
                                                    }}
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
                                                    isOpen={openedDeductHooks.includes(hook.id)}
                                                    setIsOpen={(val) => {
                                                        if (val) setOpenedDeductHooks(prev => prev.includes(hook.id) ? prev : [...prev, hook.id]);
                                                        else setOpenedDeductHooks(prev => prev.filter(id => id !== hook.id));
                                                    }}
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
