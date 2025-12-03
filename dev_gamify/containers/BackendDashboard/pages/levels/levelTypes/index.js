import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Text, Switch, Image } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import Select from "react-select";
import { FaArrowRotateRight } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";

// Custom Components
import TopBar from "@GFComponents/TopBar";
import GFLabel from "@GFComponents/Labels/GFLabel";
import LabeledInput from "@GFComponents/LabeledInput";
import GFSelect from "@GFComponents/Select";
import GamifyEditor from "@GFComponents/editor";
import CustomCollapsible from "@GFComponents/Collapsible";
import Divider from "@GFComponents/Divider";
import { primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import { route_path } from "@GFUtils/helper";
// Actions (Updated Imports from levelsSlice)
import {
    fetchLevelById, saveLevel, updateLevel, resetForm, setField,
    addHook, removeHook, updateHookSettings,
    fetchLevelTriggers, fetchPointTypes // Imported from levelsSlice now
} from "../../../../../redux/Slices/levelsSlice.js";

// --- Helpers: Draggable Item ---
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, opacity: isDragging ? 0.85 : 1, cursor: "grab", marginBottom: "8px" };
    return <Box ref={setNodeRef} {...listeners} {...attributes} style={style} background="white">{children}</Box>;
};

// --- Helpers: Droppable Area ---
const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return <Box ref={setNodeRef} minHeight="100px" mt="12px">{children}</Box>;
};

// --- Helpers: Dynamic Field ---
const DynamicField = ({ config, value, onChange }) => {
    if (config.type === 'select' && config.options) {
        const selectOptions = Object.entries(config.options).map(([val, label]) => ({ value: val, label: label }));
        return (
            <Box width="100%">
                <Text fontSize="14px" fontWeight="500" mb="8px" color="var(--gamify-font-color)">{config.label}</Text>
                <Select
                    placeholder={__("Select...", "gamify")}
                    className="gamify-select"
                    classNamePrefix="gamify-select"
                    options={selectOptions}
                    value={selectOptions.find(opt => String(opt.value) === String(value)) || null}
                    onChange={(sel) => onChange(sel ? sel.value : '')}
                />
            </Box>
        );
    }
    return <LabeledInput label={config.label} type={config.type} value={value} onChange={(e) => onChange(e.target.value)} />;
};

// --- Helpers: Dynamic Hook Form ---
const DynamicHookForm = ({ hookId, hookInfo, settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fieldsConfig = hookInfo.award_fields || {};

    return (
        <CustomCollapsible label={hookInfo?.label || hookId} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
            <Flex direction="column" gap="16px" padding="0 24px">
                {Object.keys(fieldsConfig).map(key => {
                    const config = fieldsConfig[key];
                    // Scope Check: Only show fields relevant to 'level' or shared
                    if (config.scope && !config.scope.includes('level')) return null;

                    return <DynamicField key={key} config={config} value={settings[key] ?? config.default ?? ''} onChange={(val) => onChange(key, val)} />;
                })}
            </Flex>
            <Divider width='100%' margin='24px 0' />
            <Flex padding="0 24px 24px" justifyContent='flex-end'>
                <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>{__('Done', 'gamify')}</Button>
            </Flex>
        </CustomCollapsible>
    );
};
// --- MAIN COMPONENT ---
const LevelType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const [message, setMessage] = useState("");
    const [reqOpen, setReqOpen] = useState(true);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Redux Data (Accessing everything from state.levels now)
    const {
        title, pluralName, congratulationsMessage, unlockWithPoints, minPoints, maxPoints,
        selectedPointTypeId, levelIcon, selectedHookIds, hookSettings, saveStatus,
        allHooks, availablePointTypes // Retrieved from levels slice
    } = useSelector(state => state.levels || {});

    // Initial Load
    useEffect(() => {
        dispatch(fetchLevelTriggers()); // Fetch triggers scoped for levels
        dispatch(fetchPointTypes());
        if (editId) {
            dispatch(fetchLevelById(editId));
        } else {
            dispatch(resetForm());
        }
    }, [dispatch, editId]);

    // Sync Local Message State
    useEffect(() => {
        if (congratulationsMessage) setMessage(congratulationsMessage);
    }, [congratulationsMessage]);

    // Media Uploader
    const handleImageUpload = () => {
        if (typeof wp !== 'undefined' && wp.media) {
            const frame = wp.media({
                title: 'Select Level Icon',
                button: { text: 'Use this Icon' },
                multiple: false
            });
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON();
                dispatch(setField({ field: 'levelIcon', value: attachment.url }));
            });
            frame.open();
        }
    };

    // Filter Logic: Show available hooks not yet selected
    const availableHooks = allHooks.filter(h => !selectedHookIds.includes(h.id));
    const activeHooks = selectedHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    // Drag End Logic
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        // Logic for adding/removing hooks
        if (availableHooks.some(i => i.id === active.id) && over.id === "awards-sidebar") {
            dispatch(addHook(active.id));
        }
        if (selectedHookIds.includes(active.id) && over.id === "awards-available") {
            dispatch(removeHook(active.id));
        }
    };

    // Save Logic
    const handleSave = async () => {
        if (!title) return alert("Level Name is required");

        const payload = {
            title, plural_name: pluralName, congratulations_message: message,
            unlock_with_points_enabled: unlockWithPoints,
            min_points: minPoints, max_points: maxPoints, point_type_id: selectedPointTypeId,
            icon: levelIcon,
            requirements: activeHooks.map(h => ({ trigger_key: h.id, parameters: hookSettings[h.id] || {} }))
        };

        const result = editId ? await dispatch(updateLevel({ id: editId, data: payload })) : await dispatch(saveLevel(payload));
        if (result.type.endsWith('fulfilled')) navigate(`${route_path}admin.php?page=gamify-levels`);

    };

    return (
        <>
            <TopBar leftContent={() => (
                <>
                    <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify"></span>
                    <span className="gamify-icon gamify-icon--angle-right"></span>
                    <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                </>
            )} />

            <Box width="1174px" margin="0 auto" pb="50px">
                <Flex direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>
                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Level Type`, "gamify")} />

                    <LabeledInput label="Level Name" placeholder="e.g. Bronze" value={title} onChange={(e) => dispatch(setField({ field: 'title', value: e.target.value }))} />
                    <LabeledInput label="Plural Name" placeholder="e.g. Bronzes" value={pluralName} onChange={(e) => dispatch(setField({ field: 'pluralName', value: e.target.value }))} />

                    <Box>
                        <GFLabel mb='24px' type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
                        <GamifyEditor suffix="congratulations_message" defaultValue={message} saveValueHandler={setMessage} isCustomHTML={false} />
                    </Box>

                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Level Requirements`, "gamify")} />

                    <Flex>
                        <Switch.Root checked={unlockWithPoints} onCheckedChange={(e) => dispatch(setField({ field: 'unlockWithPoints', value: e.checked }))}>
                            <Switch.HiddenInput />
                            <Switch.Label>{__("Allow unlock with points", "gamify")}</Switch.Label>
                            <Switch.Control _checked={{ bg: "var(--gamify-primary)" }} />
                        </Switch.Root>
                    </Flex>

                    {/* --- UNLOCK WITH POINTS UI --- */}
                    {unlockWithPoints && (
                        <Flex gap="12px">
                            <Box width="33%"><LabeledInput label="Minimum Balance" type="number" value={minPoints} onChange={(e) => dispatch(setField({ field: 'minPoints', value: e.target.value }))} /></Box>
                            <Box width="33%"><LabeledInput label="Maximum Balance" type="number" value={maxPoints} onChange={(e) => dispatch(setField({ field: 'maxPoints', value: e.target.value }))} /></Box>
                            <Box width="33%">
                                <Text fontSize="14px" fontWeight="500" mb="8px" color="var(--gamify-font-color)">{__("Choose the Points Type", "gamify")}</Text>
                                <Select
                                    className="gamify-select"
                                    classNamePrefix="gamify-select"
                                    placeholder="Choose one"
                                    options={availablePointTypes}
                                    value={availablePointTypes.find(opt => String(opt.value) === String(selectedPointTypeId)) || null}
                                    onChange={(sel) => dispatch(setField({ field: 'selectedPointTypeId', value: sel ? sel.value : null }))}
                                />
                            </Box>
                        </Flex>
                    )}

                    {/* --- TRIGGER REQUIREMENTS UI (Drag & Drop) --- */}
                    {!unlockWithPoints && (
                        <>
                            <CustomCollapsible label="Trigger Requirements" isOpen={reqOpen} onClick={() => setReqOpen(!reqOpen)} />
                            {reqOpen && (
                                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                    <Flex gap="24px">

                                        {/* LEFT COLUMN: Available Hooks */}
                                        <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                            <Flex direction="column" gap="12px">
                                                <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, "gamify")} margin='0' />
                                                <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`Drag hooks to activate.`, "gamify")} color="var(--gamify-font-color)" margin='0' />
                                            </Flex>

                                            <DroppableArea id="awards-available">
                                                {availableHooks.map(item => (
                                                    <React.Fragment key={item.id}>
                                                        <DraggableItem id={item.id}>
                                                            <Box p="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)">
                                                                <Flex justify="space-between" align="center">
                                                                    <Text margin='0' fontWeight="600">{item.label}</Text>
                                                                    <Box bg="green.500" borderRadius="full" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                                                                        <Icon as={FaArrowRotateRight} boxSize={4} />
                                                                    </Box>
                                                                </Flex>
                                                            </Box>
                                                        </DraggableItem>
                                                        <Text fontSize="0.875rem" mt="6px" mb="24px" color="var(--gamify-secondary)">{item.subTitle}</Text>
                                                    </React.Fragment>
                                                ))}
                                            </DroppableArea>
                                        </Flex>

                                        {/* RIGHT COLUMN: Active Hooks */}
                                        <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                            <Flex direction="column" gap="12px">
                                                <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Action Hook`, "gamify")} margin='0' />
                                                <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`These hooks will run automatically for all users.`, "gamify")} color="var(--gamify-font-color)" margin='0' />
                                            </Flex>

                                            <DroppableArea id="awards-sidebar">
                                                <Flex direction="column" gap="12px" mt="8px">
                                                    {activeHooks.map(hook => (
                                                        <DraggableItem key={hook.id} id={hook.id}>
                                                            <Box bg="white" border="1px solid var(--gamify-border-color)" borderRadius="4px">
                                                                <DynamicHookForm
                                                                    hookId={hook.id}
                                                                    hookInfo={hook}
                                                                    settings={hookSettings[hook.id] || {}}
                                                                    onChange={(k, v) => dispatch(updateHookSettings({ hookId: hook.id, settings: { [k]: v } }))}
                                                                />
                                                            </Box>
                                                        </DraggableItem>
                                                    ))}
                                                </Flex>
                                            </DroppableArea>
                                        </Box>
                                    </Flex>
                                </DndContext>
                            )}
                        </>
                    )}

                    <Box border="1px solid var(--gamify-border-color)" borderRadius="4px" p="16px">
                        <GFLabel label={__(`Levels Logo`, "gamify")} margin="0" />
                        <Box borderTop='1px solid var(--gamify-border-color)' mt="10px" p="16px">
                            {levelIcon && <Image src={levelIcon} boxSize="100px" objectFit="contain" mb="10px" />}
                            <Text textDecoration='underline' color="var(--gamify-primary)" cursor="pointer" onClick={handleImageUpload}>
                                {levelIcon ? __(`Change Level Logo`, "gamify") : __(`Set Level Logo`, "gamify")}
                            </Text>
                        </Box>
                    </Box>

                    <Flex py="24px" justifyContent="flex-end" borderTop="1px solid var(--gamify-border-color)">
                        <Button {...primaryBtn} width="121px" onClick={handleSave} isLoading={saveStatus === 'saving'}>{editId ? __("Update", "gamify") : __("Save Changes", "gamify")}</Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default LevelType;