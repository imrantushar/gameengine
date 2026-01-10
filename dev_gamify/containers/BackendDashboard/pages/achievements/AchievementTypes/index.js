import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Text, Switch, Checkbox, Input, Center, VStack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import GFLabel from "@GFComponents/Labels/GFLabel";
import Select from "react-select";
import CustomCollapsible from "@GFComponents/Collapsible";
import TopBar from "@GFComponents/TopBar";
import { FaArrowRotateRight, FaChevronRight, FaGamepad, FaWordpressSimple, FaLock } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import LabeledInput from "@GFComponents/LabeledInput";
import Divider from "@GFComponents/Divider";
import GamifyEditor from "@GFComponents/editor";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";

// Actions
import {
    fetchAchievementById, saveAchievement, updateAchievement, resetForm, fetchTriggers,
    fetchDynamicOptions, fetchPointTypes, fetchAchievements, setField, addHook, removeHook,
    updateHookSettings, addCategoryToList
} from "@GFRedux/Slices/achivementSlice/achievementsSlice";
import { primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import { route_path } from "@GFUtils/helper";

// --- Draggable Components ---
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: "grab",
        marginBottom: "8px"
    };
    return <Box ref={setNodeRef} {...listeners} {...attributes} style={style}>{children}</Box>;
};

const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return <Box ref={setNodeRef} minH="150px" height='100%' mt="12px">{children}</Box>;
};

// --- Updated Helper Component for Dynamic Fields ---
const DynamicAchievementField = ({ fieldKey, config, value, onChange, integrationSlug }) => {
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
            })).unwrap().then(res => setDynamicOptions(res)).finally(() => setLoading(false));
        }
    }, [config.dynamic, isDisabled, dispatch, integrationSlug]);

    const labelElement = (
        <Flex align="center" gap={2} mb="8px">
            <Text fontSize="14px" fontWeight="500" m="0" color="var(--gamify-font-color)">
                {config.label} {config.required && <span style={{ color: "red" }}>*</span>}
            </Text>
            {config.is_pro && <Icon as={FaLock} color="orange.400" boxSize={3} />}
        </Flex>
    );

    if (config.type === 'select') {
        const optionsSource = config.options
            ? (Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([val, label]) => ({ value: val, label: label })))
            : dynamicOptions;

        return (
            <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
                {labelElement}
                <Select
                    isDisabled={isDisabled} isLoading={loading}
                    options={optionsSource}
                    value={optionsSource.find(opt => opt.value == value) || null}
                    onChange={(selected) => onChange(selected ? selected.value : '')}
                    className="gamify-select" classNamePrefix="gamify-select"
                />
            </Box>
        );
    }

    return (
        <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
            <LabeledInput label={config.label} type={config.type === 'number' ? 'number' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} required={config.required} disabled={isDisabled} />
        </Box>
    );
};

const DynamicHookForm = ({ hookId, hookInfo, settings, onChange, isOpen, setIsOpen }) => {
    const schema = hookInfo.schema || [];
    return (
        <Box mb={2} bg="white" borderRadius="4px">
            <CustomCollapsible label={hookInfo?.label || hookId} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
                <Flex direction="column" gap="16px" p={4}>
                    {schema.map(config => {
                        if (config.scope && !config.scope.includes('achievement')) return null;
                        return (
                            <DynamicAchievementField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} onChange={(newValue) => onChange(config.key, newValue)} />
                        );
                    })}
                </Flex>
                <Divider width='100%' margin='12px 0' />
                <Flex justifyContent='flex-end' p={4}>
                    <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>{__('Done', 'gamify')}</Button>
                </Flex>
            </CustomCollapsible>
        </Box>
    );
};

const AchievementsType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const [message, setMessage] = useState("");
    const [openedHooks, setOpenedHooks] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [showInput, setShowInput] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);

    const {
        title, description, maxEarnings, allowUnlockWithPoints, pointsAmount, selectedPointTypeId,
        allHooks, category, selectedHookIds, hookSettings, availablePointTypes, saveStatus, congratulationsMessage, availableCategories = []
    } = useSelector(state => state.achievements);

    useEffect(() => {
        dispatch(fetchTriggers('achievement'));
        dispatch(fetchPointTypes());
        dispatch(fetchAchievements());
        if (editId) dispatch(fetchAchievementById(editId));
        else dispatch(resetForm());
    }, [dispatch, editId]);

    useEffect(() => { if (congratulationsMessage) setMessage(congratulationsMessage); }, [congratulationsMessage]);


    const hookCategoryIconMap = {
        wordpress: { icon: FaWordpressSimple, bg: "#21759b" },
        woocommerce: { icon: SiWoocommerce, bg: "#96588a" },
        gamify: { icon: FaGamepad, bg: "#006BFF" },
        interaction: { icon: AiFillInteraction, bg: "#ff5722" },
    };


    const renderHookCard = (item) => {
        const slug = item.integrationSlug || 'wordpress';
        const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
        return (
            <DraggableItem key={item.id} id={item.id}>
                <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)" bg="white">
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap='8px'>
                            <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                                <Icon as={config.icon} boxSize={3} />
                            </Center>
                            <Text margin="0" fontSize="1rem" fontWeight="600">{item.label}</Text>
                        </Flex>
                        <Box bg="green.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={FaArrowRotateRight} boxSize={3} />
                        </Box>
                    </Flex>
                </Box>
            </DraggableItem>
        );
    };

    const availableHooks = allHooks.filter(hook => !selectedHookIds.includes(hook.id) && (selectedFilterHookType.length === 0 || selectedFilterHookType.includes(hook.integrationSlug)));
    const activeHooks = selectedHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        if (availableHooks.some(i => i.id === active.id) && over.id === "awards-sidebar") {
            dispatch(addHook(active.id)); setOpenedHooks([active.id]);
        }
        if (selectedHookIds.includes(active.id) && over.id === "awards-available") {
            dispatch(removeHook(active.id));
        }
    };

    const handleSave = async () => {
        if (!title) return alert("Name is required");
        const payload = {
            title, description, category, max_earnings_per_user: maxEarnings,
            unlock_with_points_enabled: allowUnlockWithPoints,
            required_points_amount: pointsAmount, required_point_type_id: selectedPointTypeId,
            congratulations_message: message,
            requirements: activeHooks.map(h => ({
                trigger_key: h.id,
                parameters: Object.fromEntries((h.schema || []).map(f => [f.key, (hookSettings[h.id] || {})[f.key] ?? f.default]))
            }))
        };
        const result = editId ? await dispatch(updateAchievement({ id: editId, data: payload })) : await dispatch(saveAchievement(payload));
        if (result.meta.requestStatus === 'fulfilled') navigate(`${route_path}admin.php?page=gamify-achievements`);
    };

    const hookTypeOptions = Object.keys(hookCategoryIconMap).map(slug => ({ label: slug.charAt(0).toUpperCase() + slug.slice(1), value: slug }));

    return (
        <>
            <TopBar leftContent={() => (
                <Flex align="center">
                    <Box className="gamify-topbar-logo"><svg width="36" height="36" viewBox="0 0 36 36"><rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" /><path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" /></svg></Box>
                    <Icon as={FaChevronRight} mx={2} />
                    <GFLabel type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                </Flex>
            )} />

            <Box width="1174px" margin="0 auto" pb="50px">
                <Flex direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>
                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Achievement Types`, "gamify")} />

                    <Flex gap="24px">
                        <LabeledInput label="Point Name" value={title} onChange={e => dispatch(setField({ field: 'title', value: e.target.value }))} style={{ width: '50%' }} />
                        <LabeledInput label="Plural Name" style={{ width: '50%' }} value={description} onChange={e => dispatch(setField({ field: 'description', value: e.target.value }))} />
                    </Flex>

                    <Box>
                        <LabeledInput label="Maximum Earnings Per User :" type="number" value={maxEarnings} onChange={e => dispatch(setField({ field: 'maxEarnings', value: e.target.value }))} />
                        <Text fontSize="xs" mt={1} color="var(--gamify-secondary)">{__("Number of times a user can earn this badge (0 = unlimited).", "gamify")}</Text>
                    </Box>

                    {/* ACHIEVEMENT TYPE CHECKBOXES - RESTORED */}
                    <Box>
                        <GFLabel type="inputLabel" label={"Achievement Type"} />
                        <Flex mt="4px" gap="24px" p="12px" border="1px solid var(--gamify-border-color)" borderRadius="4px" flexWrap="wrap">
                            {availableCategories.map((cat, index) => (
                                <Checkbox.Root key={index} checked={category === cat} onCheckedChange={() => dispatch(setField({ field: 'category', value: cat }))}>
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control borderRadius="full" style={{ width: "20px", height: "20px", border: category === cat ? "1px solid #007AFF" : "1px solid #ccc", backgroundColor: category === cat ? "#007AFF" : "transparent" }} />
                                    <Checkbox.Label>{__(cat, "gamify")}</Checkbox.Label>
                                </Checkbox.Root>
                            ))}
                        </Flex>
                        <Text cursor="pointer" color="var(--gamify-primary)" fontWeight="500" fontSize="xs" mt={1} onClick={() => setShowInput(true)}>{__("+ Add Achievement Type", "gamify")}</Text>
                        {showInput && (
                            <Flex mt={2} gap={2}>
                                <Input size="sm" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Type name" />
                                <Button size="sm" onClick={() => setShowInput(false)}>{__("Cancel")}</Button>
                                <Button {...primaryBtn} size="sm" onClick={() => { dispatch(addCategoryToList(newCat)); dispatch(setField({ field: 'category', value: newCat })); setNewCat(""); setShowInput(false); }}>{__("Add")}</Button>
                            </Flex>
                        )}
                    </Box>

                    {/* CONGRATS MESSAGE EDITOR - RESTORED */}
                    <Box>
                        <GFLabel margin="0 0 12px 0" type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
                        <GamifyEditor defaultValue={message} saveValueHandler={setMessage} />
                    </Box>

                    <Flex>
                        <Switch.Root checked={allowUnlockWithPoints} onCheckedChange={e => dispatch(setField({ field: 'allowUnlockWithPoints', value: e.checked }))}>
                            <Switch.HiddenInput /><Switch.Label>{__("Allow unlock with points", "gamify")}</Switch.Label><Switch.Control />
                        </Switch.Root>
                    </Flex>

                    {allowUnlockWithPoints ? (
                        <Flex gap="12px">
                            <Box width="50%"><LabeledInput label="Points" type="number" value={pointsAmount} onChange={e => dispatch(setField({ field: 'pointsAmount', value: e.target.value }))} /></Box>
                            <Box width="50%"><Text fontSize="14px" fontWeight="500" mb="8px">{__("Choose the Points Type", "gamify")}</Text>
                                <Select options={availablePointTypes} value={availablePointTypes.find(opt => opt.value == selectedPointTypeId)} onChange={s => dispatch(setField({ field: 'selectedPointTypeId', value: s ? s.value : null }))} />
                            </Box>
                        </Flex>
                    ) : (
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <Flex gap="24px">
                                <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="4">
                                    <VStack align="start" spacing={1}><GFLabel type="title" fontSize="1.25rem" label={__(`Available Hooks`, "gamify")} /><Text fontSize="xs">{__("Drag hooks to activate.", "gamify")}</Text></VStack>
                                    <Box p={4} border="1px solid #eee" borderRadius="md"><Text fontSize="xs" mb={2} fontWeight="600">{__("Filter Category", "gamify")}</Text><Select isMulti options={hookTypeOptions} onChange={v => setSelectedFilterHookType(v.map(o => o.value))} /></Box>
                                    <DroppableArea id="awards-available">{availableHooks.map(h => renderHookCard(h))}</DroppableArea>
                                </Flex>
                                <Box width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                                    <GFLabel type="title" label={__("Action Hooks", "gamify")} />
                                    <DroppableArea id="awards-sidebar">
                                        {activeHooks.map(h => (
                                            <DynamicHookForm key={h.id} hookId={h.id} hookInfo={h} settings={hookSettings[h.id] || {}} onChange={(k, v) => dispatch(updateHookSettings({ hookId: h.id, settings: { [k]: v } }))} isOpen={openedHooks.includes(h.id)} setIsOpen={v => setOpenedHooks(v ? [...openedHooks, h.id] : openedHooks.filter(i => i !== h.id))} />
                                        ))}
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        </DndContext>
                    )}

                    <Flex py="24px" justify="flex-end" borderTop="1px solid var(--gamify-border-color)">
                        <Button {...primaryBtn} onClick={handleSave} isLoading={saveStatus === 'saving'}>{editId ? __("Update", "gamify") : __("Save Changes", "gamify")}</Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default AchievementsType;