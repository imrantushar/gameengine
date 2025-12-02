import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Flex, Icon, Text, Switch
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import GFLabel from "@Components/Labels/GFLabel";
import Select from "react-select"; // Import react-select
import CustomCollapsible from "@Components/Collapsible";
import TopBar from "@Components/TopBar";
import { FaArrowRotateRight } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import LabeledInput from "@Components/LabeledInput";
import { primaryBtn } from "../../../../../assets/scss/chakra/recipe";
import GFSelect from "@Components/Select";
import Divider from "@Components/Divider";
import GamifyEditor from "@Components/editor";

// Actions
import {
    fetchAchievementById,
    saveAchievement,
    updateAchievement,
    resetForm,
    fetchTriggers,
    fetchPointTypes,
    setField,
    addHook,
    removeHook,
    updateHookSettings
} from "../../../../redux/Slices/achievementsSlice";

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
    return <Box ref={setNodeRef} minHeight="100px" mt="12px">{children}</Box>;
};

// --- NEW: Helper Component for Dynamic Fields (Select + Input) ---
const DynamicAchievementField = ({ fieldKey, config, value, onChange }) => {
    // 1. Handle Select Dropdown
    if (config.type === 'select' && config.options) {
        // Convert PHP associative array/object to React-Select format
        const selectOptions = Object.entries(config.options).map(([val, label]) => ({
            value: val,
            label: label
        }));

        // Find selected object for react-select
        const selectedOption = selectOptions.find(opt => opt.value == value) || null;

        return (
            <Box width="100%">
                <Text fontSize="14px" fontWeight="500" mb="8px" color="var(--gamify-font-color)">
                    {config.label} {config.required && <span style={{ color: "red" }}>*</span>}
                </Text>
                <Select
                    placeholder={__("Select...", "gamify")}
                    className="gamify-select"
                    classNamePrefix="gamify-select"
                    options={selectOptions}
                    value={selectedOption}
                    onChange={(selected) => onChange(selected ? selected.value : '')}
                />
            </Box>
        );
    }

    // 2. Handle Number/Text Input
    return (
        <LabeledInput
            label={config.label}
            type={config.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={config.required}
        />
    );
};

// --- UPDATED: Dynamic Hook Settings Form ---
const DynamicHookForm = ({ hookId, hookInfo, settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const fieldsConfig = hookInfo.award_fields || {};
    const fieldKeys = Object.keys(fieldsConfig);

    return (
        <CustomCollapsible
            label={hookInfo?.label || hookId}
            desc={hookInfo?.subTitle}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            singleIcon={true}
        >
            <Flex direction="column" gap="16px" padding="0 24px">
                {fieldKeys.map(key => {
                    const config = fieldsConfig[key];

                    // --- NEW LOGIC START: SCOPE CHECK ---
                    // যদি scope ডিফাইন করা থাকে এবং তাতে 'achievement' না থাকে, তাহলে এটি স্কিপ করো।
                    if (config.scope && !config.scope.includes('achievement')) {
                        return null;
                    }
                    // --- NEW LOGIC END ---

                    const val = settings[key] !== undefined ? settings[key] : (config.default || '');

                    return (
                        <DynamicAchievementField
                            key={key}
                            fieldKey={key}
                            config={config}
                            value={val}
                            onChange={(newValue) => onChange(key, newValue)}
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

const AchievementsType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const [message, setMessage] = useState("");

    const [achievementCollapsible, setAchievementCollapsible] = useState(true);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Redux State
    const {
        title, description, maxEarnings, allowUnlockWithPoints, pointsAmount, selectedPointTypeId,
        allHooks, selectedHookIds, hookSettings, availablePointTypes, saveStatus
    } = useSelector(state => state.achievements);

    // Initial Load
    useEffect(() => {
        // Fetch triggers specifically for achievements
        dispatch(fetchTriggers());
        dispatch(fetchPointTypes());
        if (editId) {
            dispatch(fetchAchievementById(editId));
        } else {
            dispatch(resetForm());
        }
    }, [dispatch, editId]);

    // Derived State for Drag & Drop
    const availableHooks = allHooks.filter(h => !selectedHookIds.includes(h.id));
    const activeHooks = selectedHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        const id = active.id;

        if (availableHooks.some(i => i.id === id) && over.id === "awards-sidebar") {
            dispatch(addHook(id));
        }
        if (selectedHookIds.includes(id) && over.id === "awards-available") {
            dispatch(removeHook(id));
        }
    };

    const handleSave = async () => {
        if (!title) return alert("Name is required");

        const payload = {
            title,
            description,
            max_earnings_per_user: maxEarnings,
            unlock_with_points_enabled: allowUnlockWithPoints,
            required_points_amount: pointsAmount,
            required_point_type_id: selectedPointTypeId,
            congratulations_message: message, // Save message
            requirements: activeHooks.map(hook => ({
                trigger_key: hook.id,
                parameters: hookSettings[hook.id] || {}
            }))
        };

        let result;
        if (editId) {
            result = await dispatch(updateAchievement({ id: editId, data: payload }));
        } else {
            result = await dispatch(saveAchievement(payload));
        }

        if (result.type.endsWith('fulfilled')) {
            navigate('/achievements');
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
                <Flex direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>
                    <GFLabel type="title" fontWeight="500" fontSize="xl" label={__(`Achievement Types`, "gamify")} />

                    <LabeledInput
                        label="Point Name"
                        placeholder="Academy LMS"
                        value={title}
                        onChange={(e) => dispatch(setField({ field: 'title', value: e.target.value }))}
                    />
                    <LabeledInput
                        label="Plural Name"
                        placeholder="Plural Name"
                        value={description}
                        onChange={(e) => dispatch(setField({ field: 'description', value: e.target.value }))}
                    />

                    {/* Rest of the form inputs... */}

                    <Box>
                        <LabeledInput
                            label="Maximum Earnings Per User :"
                            placeholder="0"
                            type="number"
                            value={maxEarnings}
                            onChange={(e) => dispatch(setField({ field: 'maxEarnings', value: e.target.value }))}
                        />
                        <GFLabel type="miniTitle" label={__("Number of times a user can earn this badge (0 = unlimited).", "gamify")} fontSize="0.875rem" mt="6px" color="var(--gamify-secondary)" />
                    </Box>

                    <Box>
                        <GFLabel mb='24px' type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
                        <GamifyEditor
                            suffix="congratulations_message"
                            defaultValue={message}
                            saveValueHandler={(html) => {
                                setMessage(html);
                            }}
                            isCustomHTML={false}
                        />
                    </Box>

                    {/* Unlock with Points Logic */}
                    <Flex>
                        <Switch.Root checked={allowUnlockWithPoints} onCheckedChange={(e) => dispatch(setField({ field: 'allowUnlockWithPoints', value: e.checked }))}>
                            <Switch.HiddenInput />
                            <Switch.Label>{__("Allow unlock with points", "gamify")}</Switch.Label>
                            <Switch.Control _checked={{ bg: "var(--gamify-primary)" }} />
                        </Switch.Root>
                    </Flex>

                    {allowUnlockWithPoints && (
                        <Flex gap="12px">
                            <Box width="50%">
                                <LabeledInput
                                    label="Points"
                                    placeholder="1500"
                                    type="number"
                                    value={pointsAmount}
                                    onChange={(e) => dispatch(setField({ field: 'pointsAmount', value: e.target.value }))}
                                />
                            </Box>
                            <Box width="50%">
                                {/* Debugging Log */}
                                {console.log("Current Selected ID:", selectedPointTypeId)}
                                {console.log("Available Types:", availablePointTypes)}

                                <Box width="100%">
                                    <Text fontSize="14px" fontWeight="500" mb="8px" color="var(--gamify-font-color)">
                                        {__("Choose the Points Type", "gamify")}
                                    </Text>
                                    <Select
                                        placeholder={__("Choose one", "gamify")}
                                        className="gamify-select"
                                        classNamePrefix="gamify-select"
                                        options={availablePointTypes}
                                        // FIX: Find the matching object safely (String/Number safe comparison)
                                        value={
                                            availablePointTypes.find(
                                                opt => String(opt.value) === String(selectedPointTypeId)
                                            ) || null
                                        }
                                        onChange={(selected) =>
                                            dispatch(setField({ field: 'selectedPointTypeId', value: selected ? selected.value : null }))
                                        }
                                    />
                                </Box>
                            </Box>
                        </Flex>
                    )}

                    {!allowUnlockWithPoints && (
                        <>
                            <CustomCollapsible
                                label="Achievement Requirements"
                                isOpen={achievementCollapsible}
                                onClick={() => setAchievementCollapsible(!achievementCollapsible)}
                            />
                            {achievementCollapsible && (
                                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                    <Flex gap="24px">
                                        {/* Available Hooks */}
                                        <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                            <Flex direction="column" gap="12px">
                                                <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, "gamify")} margin='0' />
                                                <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`Drag hooks to activate.`, "gamify")} color="var(--gamify-font-color)" margin='0' />
                                            </Flex>

                                            <DroppableArea id="awards-available">
                                                {availableHooks.map((item) => (
                                                    <Box key={item.id}>
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
                                                    </Box>
                                                ))}
                                            </DroppableArea>
                                        </Flex>

                                        {/* Active Hooks with Dynamic Fields */}
                                        <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                            <Flex direction="column" gap="12px">
                                                <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Action Hook`, "gamify")} margin='0' />
                                                <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`These hooks will run automatically.`, "gamify")} color="var(--gamify-font-color)" margin='0' />
                                            </Flex>

                                            <DroppableArea id="awards-sidebar">
                                                <Flex direction="column" gap="12px" mt="8px">
                                                    {activeHooks.map((hook) => (
                                                        <DraggableItem key={hook.id} id={hook.id}>
                                                            <Box background="white" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                                                                {/* Using the new DynamicHookForm */}
                                                                <DynamicHookForm
                                                                    hookId={hook.id}
                                                                    hookInfo={hook}
                                                                    settings={hookSettings[hook.id] || {}}
                                                                    onChange={(key, val) => dispatch(updateHookSettings({
                                                                        hookId: hook.id,
                                                                        settings: { [key]: val }
                                                                    }))}
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

                    <Flex py="24px" justifyContent="flex-end" borderTop="1px solid var(--gamify-border-color)">
                        <Button {...primaryBtn} width="121px" onClick={handleSave} isLoading={saveStatus === 'saving'}>
                            {editId ? __("Update", "gamify") : __("Save Changes", "gamify")}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

export default AchievementsType;