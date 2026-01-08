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
    Tooltip,
    Center,
    VStack
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FaArrowRotateRight, FaChevronRight, FaGamepad, FaWordpressSimple, FaLock } from 'react-icons/fa6';
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
    updateHookSettings,
    fetchDynamicOptions
} from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { AiFillInteraction } from 'react-icons/ai';
import { SiWoocommerce } from "react-icons/si";


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
    const { setNodeRef } = useDroppable({ id });
    return (
        <Box ref={setNodeRef} borderRadius="4px" minH="150px" height='100%' transition="all 0.2s">
            <Box marginTop="12px">{children}</Box>
        </Box>
    );
};


// # DYNAMIC FIELD (UPDATED: Added 'type' prop to handle Labels)
const DynamicField = ({ fieldKey, config, value, onChange, integrationSlug, type }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const isProActive = false;
    const isDisabled = config.is_pro && !isProActive;

    useEffect(() => {
        if (config.dynamic && !isDisabled) {
            setLoading(true);
            dispatch(fetchDynamicOptions({
                integration: config.dynamic.integration || integrationSlug,
                query: config.dynamic.query
            })).unwrap()
                .then(res => setDynamicOptions(res))
                .finally(() => setLoading(false));
        }
    }, [config.dynamic, isDisabled, dispatch, integrationSlug]);

    // 🔥 Dynamic Label Logic: Award vs Deduct
    let displayLabel = config.label;
    if (fieldKey === 'points') {
        displayLabel = type === 'award' ? __('Points to Award', 'gamify') : __('Points to Deduct', 'gamify');
    } else if (fieldKey === 'log_label') {
        displayLabel = type === 'award' ? __('Award Log Description', 'gamify') : __('Deduction Log Description', 'gamify');
    }

    const labelElement = (
        <Flex align="center" gap={2} mb="8px">
            <Text className='gamify-title' fontSize="sm" fontWeight="500" m="0">
                {displayLabel} {config.required && <span style={{ color: 'red' }}>*</span>}
            </Text>
            {config.is_pro && <Icon as={FaLock} color="orange.400" boxSize={3} />}
        </Flex>
    );

    if (config.type === 'select' || config.type === 'dynamic_select') {
        const optionsSource = config.options
            ? (Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([val, lbl]) => ({ value: val, label: lbl })))
            : dynamicOptions;

        return (
            <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
                {labelElement}
                <Select
                    isDisabled={isDisabled}
                    isLoading={loading}
                    placeholder={isDisabled ? __('Upgrade to Pro', 'gamify') : __('Select...', 'gamify')}
                    className="gamify-select"
                    classNamePrefix="gamify-select"
                    options={optionsSource}
                    value={optionsSource.find(opt => opt.value == value) || null}
                    onChange={(val) => onChange(val ? val.value : '')}
                />
            </Box>
        );
    }

    if (config.type === 'switch') {
        return (
            <Flex align="center" justify="space-between" width="100%" p={2} border="1px dashed" borderColor="gray.200" borderRadius="md" opacity={isDisabled ? 0.6 : 1}>
                <Box>
                    <Text fontSize="sm" fontWeight="600">{displayLabel}</Text>
                    {config.description && <Text fontSize="xs" color="gray.500">{config.description}</Text>}
                </Box>
                <Button size="xs" isDisabled={isDisabled} onClick={() => onChange(!value)} colorScheme={value ? "blue" : "gray"}>
                    {value ? __('Enabled', 'gamify') : __('Disabled', 'gamify')}
                </Button>
            </Flex>
        );
    }

    return (
        <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
            <LabeledInput
                label={displayLabel}
                placeholder={isDisabled ? __('Locked Feature', 'gamify') : (config.placeholder || '')}
                type={config.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={config.required}
                disabled={isDisabled}
            />
        </Box>
    );
};


// # HOOK FORM
const DynamicHookForm = ({ hookId, hookInfo, type, settings, handleChange, isOpen, setIsOpen }) => {
    const fieldsConfig = hookInfo.schema || [];

    return (
        <CustomCollapsible
            label={(type === 'deduct' ? __('Deduct: ', 'gamify') : '') + (hookInfo?.label || hookId)}
            desc={hookInfo?.subTitle}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >
            <Flex direction="column" gap="16px" p={4}>
                {fieldsConfig.map((config) => {
                    if (config.scope && !config.scope.includes('point_type')) {
                        return null;
                    }

                    return (
                        <DynamicField
                            key={config.key}
                            fieldKey={config.key}
                            config={config}
                            value={settings[config.key] ?? config.default ?? ''}
                            integrationSlug={hookInfo.integrationSlug}
                            type={type} // 🔥 Passing 'award' or 'deduct' to fix labels
                            onChange={(val) => handleChange(config.key, val)}
                        />
                    );
                })}
            </Flex>

            <Divider width='100%' margin='12px 0' />

            <Flex padding="0 24px 12px 24px" justifyContent='flex-end'>
                <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>
                    {__('Done', 'gamify')}
                </Button>
            </Flex>
        </CustomCollapsible>
    );
};


// # WRAPPER
const HookConfigurationForm = ({ hookId, type, hookInfo, dispatch, currentSettings, isOpen, setIsOpen }) => {
    const handleChange = (field, value) => {
        dispatch(updateHookSettings({
            type: type,
            hookId: hookInfo.id,
            settings: { [field]: value }
        }));
    };

    return (
        <Box background="white" borderRadius="4px" mb={2}>
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


// # MAIN COMPONENT
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
    const [selectedDeductFilterType, setSelectedDeductFilterType] = useState([]);

    const {
        name,
        pluralName,
        allHooks,
        hookSettings,
        selectedAwardHookIds,
        selectedDeductHookIds,
        saveStatus,
        currentPointTypeId
    } = useSelector((state) => state.pointType);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => { dispatch(fetchTriggers()); }, [dispatch]);
    useEffect(() => {
        if (editId) dispatch(fetchPointTypeById(editId));
        else dispatch(resetPointTypeForm());
    }, [editId, dispatch]);

    // 🔥 Icons configuration
    const hookCategoryIconMap = {
        wordpress: { icon: FaWordpressSimple, bg: "#21759b" },
        woocommerce: { icon: SiWoocommerce, bg: "#96588a" },
        gamify: { icon: FaGamepad, bg: "#006BFF" },
        interaction: { icon: AiFillInteraction, bg: "#ff5722" },
    };
    const availableAwardHooks = allHooks.filter(hook => {
        if (selectedAwardHookIds.includes(hook.id)) return false;
        return (
            selectedFilterHookType.length === 0 ||
            selectedFilterHookType.includes(hook.integrationSlug)
        );
    });

    console.log(availableAwardHooks, 'availableAwardHooks');
    const activeAwardHooks = selectedAwardHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const availableDeductHooks = allHooks.filter(hook => {
        if (selectedDeductHookIds.includes(hook.id)) return false;
        return (
            selectedDeductFilterType.length === 0 ||
            selectedDeductFilterType.includes(hook.integrationSlug)
        );
    });


    const activeDeductHooks = selectedDeductHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        const draggedId = active.id;
        if (draggedId.startsWith("award_")) {
            const pureId = draggedId.replace("award_", "");
            if (over.id === "awards-sidebar") { dispatch(addAwardHook(pureId)); setOpenedAwardHooks([pureId]); }
            else if (over.id === "awards-available") { dispatch(removeAwardHook(pureId)); }
        }
        if (draggedId.startsWith("deduct_")) {
            const pureId = draggedId.replace("deduct_", "");
            if (over.id === "deductions-sidebar") { dispatch(addDeductHook(pureId)); setOpenedDeductHooks([pureId]); }
            else if (over.id === "deductions-available") { dispatch(removeDeductHook(pureId)); }
        }
    };

    const handleSave = async () => {
        if (!name) return alert('Please enter a Point Name');
        const getParamsFromSchema = (hook, type) => {
            const settings = hookSettings[`${type}_${hook.id}`] || {};
            const params = {};
            (hook.schema || []).forEach(f => { params[f.key] = settings[f.key] ?? f.default; });
            return params;
        };
        const payload = {
            name, plural_name: pluralName,
            requirements: [
                ...activeAwardHooks.map(h => ({ trigger_key: h.id, action_type: 'award', parameters: getParamsFromSchema(h, 'award') })),
                ...activeDeductHooks.map(h => ({ trigger_key: h.id, action_type: 'deduct', parameters: getParamsFromSchema(h, 'deduct') }))
            ]
        };
        const action = currentPointTypeId ? updatePointType({ id: currentPointTypeId, data: payload }) : savePointType(payload);
        const res = await dispatch(action);
        if (res.meta.requestStatus === 'fulfilled') navigate(`${route_path}admin.php?page=gamify-points`);
    };

    const hookTypeOptions = Array.from(
        new Set(allHooks.map(h => h.integrationSlug).filter(Boolean))
    ).map(slug => ({
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
        value: slug,
    }));


    // Helper function to render cards to maintain Figma design
    const renderHookCard = (item, type) => {
        const slug = item.integrationSlug || item.category || 'wordpress';
        const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
        //const config = hookCategoryIconMap[item.category] || { icon: FaWordpressSimple, bg: "gray.500" };
        return (
            <DraggableItem key={`${type}_${item.id}`} id={`${type}_${item.id}`}>
                <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)" bg="white">
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap='8px'>
                            <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                                <Icon as={config.icon} boxSize={3} />
                            </Center>
                            <Text margin="0" fontSize="1rem" fontWeight="600">{item.label}</Text>
                        </Flex>
                        <Box bg={type === 'award' ? "green.500" : "red.500"} borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={FaArrowRotateRight} boxSize={3} />
                        </Box>
                    </Flex>
                </Box>
            </DraggableItem>
        );
    };

    return (
        <>
            <TopBar leftContent={() => (
                <>
                    <Box className="gamify-topbar-logo"><svg width="36" height="36" viewBox="0 0 36 36"><rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" /><path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" /></svg></Box>
                    <Icon as={FaChevronRight} mx={2} />
                    <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                </>
            )} />

            <Box width="1174px" margin="0 auto" pb="50px">
                <Flex direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>
                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Point Types`, 'gamify')} />
                    <Flex gap="24px">
                        <LabeledInput style={{ width: '50%' }} label="Point Name" value={name} onChange={e => dispatch(setPointName(e.target.value))} />
                        <LabeledInput style={{ width: '50%' }} label="Plural Name" value={pluralName} readOnly />
                    </Flex>

                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        {/* AWARDS */}
                        <CustomCollapsible label={__("Automatic Point Awards", "gamify")} isOpen={pointAwards} onClick={() => setPointAwards(!pointAwards)} />
                        {pointAwards && (
                            <Flex gap="24px" mb={6}>
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                    <VStack align="start" spacing={1}>
                                        <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, "gamify")} m="0" />
                                        <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`Drag hooks to activate.`, "gamify")} m="0" />
                                    </VStack>
                                    <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                        <Text fontWeight="500" fontSize="0.875rem" mb="8px">{__("Filter Hooks Type", "gamify")}</Text>
                                        <Select isMulti options={hookTypeOptions} placeholder={__("Select hook type", "gamify")} onChange={v => setSelectedFilterHookType(v.map(o => o.value))} />
                                    </Box>
                                    <DroppableArea id="awards-available">
                                        {availableAwardHooks.map(h => (
                                            <Box key={h.id}>
                                                {renderHookCard(h, 'award')}
                                                <Text fontSize="xs" color="gray.500" mt={1}>{h.subTitle}</Text>
                                            </Box>
                                        ))}
                                    </DroppableArea>
                                </Flex>
                                <Box width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Hooks`, 'gamify')} mb={4} />
                                    <DroppableArea id="awards-sidebar">
                                        {activeAwardHooks.map(h => (
                                            <HookConfigurationForm key={h.id} hookId={h.id} type="award" hookInfo={h} dispatch={dispatch} currentSettings={hookSettings[`award_${h.id}`]} isOpen={openedAwardHooks.includes(h.id)} setIsOpen={v => setOpenedAwardHooks(v ? [...openedAwardHooks, h.id] : openedAwardHooks.filter(i => i !== h.id))} />
                                        ))}
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        )}

                        <Divider />
                        {/* DEDUCTIONS */}
                        <CustomCollapsible label={__("Automatic Point Deductions", "gamify")} isOpen={pointDeductions} onClick={() => setPointDeductions(!pointDeductions)} />
                        {pointDeductions && (
                            <Flex gap="24px">
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, 'gamify')} />
                                    <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                        <Text fontWeight="500" fontSize="0.875rem" mb="8px">{__("Filter Hooks Type", "gamify")}</Text>
                                        <Select isMulti options={hookTypeOptions} placeholder={__("Select hook type", "gamify")} onChange={v => setSelectedDeductFilterType(v.map(o => o.value))} />
                                    </Box>
                                    <DroppableArea id="deductions-available">
                                        {availableDeductHooks.map(h => (
                                            <Box key={h.id}>
                                                {renderHookCard(h, 'deduct')}
                                                <Text fontSize="xs" color="gray.500" mt={1}>{h.subTitle}</Text>
                                            </Box>
                                        ))}
                                    </DroppableArea>
                                </Flex>
                                <Box width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Active Deduction Hooks`, 'gamify')} mb={4} />
                                    <DroppableArea id="deductions-sidebar">
                                        {activeDeductHooks.map(h => (
                                            <HookConfigurationForm key={h.id} hookId={h.id} type="deduct" hookInfo={h} dispatch={dispatch} currentSettings={hookSettings[`deduct_${h.id}`]} isOpen={openedDeductHooks.includes(h.id)} setIsOpen={v => setOpenedDeductHooks(v ? [...openedDeductHooks, h.id] : openedDeductHooks.filter(i => i !== h.id))} />
                                        ))}
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        )}
                    </DndContext>

                    <Flex py={6} justify='flex-end' borderTop='1px solid var(--gamify-border-color)'>
                        <Button {...primaryBtn} width='140px' onClick={handleSave} isLoading={saveStatus === 'saving'}>
                            {currentPointTypeId ? __('Update Point Type', 'gamify') : __('Save Point Type', 'gamify')}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default PointType;