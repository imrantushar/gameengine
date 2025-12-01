import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Flex, Icon, Text, Switch
} from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import GFLabel from "@Components/Labels/GFLabel";
import Select from "react-select";
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

// --- Dynamic Hook Settings Form (Generic) ---
const DynamicHookForm = ({ hookId, hookInfo, settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Achievement triggers typically use 'award_fields' from config
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
            <Flex direction="column" gap="12px" padding="0 24px">
                {fieldKeys.map(key => {
                    const config = fieldsConfig[key];
                    const val = settings[key] !== undefined ? settings[key] : (config.default || '');

                    return (
                        <LabeledInput
                            key={key}
                            label={config.label}
                            type={config.type === 'number' ? 'number' : 'text'}
                            value={val}
                            onChange={(e) => onChange(key, e.target.value)}
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
                        label="Point Name" // Mapped to Title
                        placeholder="Academy LMS"
                        value={title}
                        onChange={(e) => dispatch(setField({ field: 'title', value: e.target.value }))}
                    />
                    <LabeledInput
                        label="Plural Name" // Mapped to Description
                        placeholder="Plural Name"
                        value={description}
                        onChange={(e) => dispatch(setField({ field: 'description', value: e.target.value }))}
                    />

                    <Box>
                        <LabeledInput label="Earned By" placeholder="Completing Steps" readOnly value="Completing Steps" />
                        <GFLabel type="miniTitle" label={__("How this achievement can be earned.", "gamify")} fontSize="0.875rem" mt="6px" color="var(--gamify-secondary)" />
                    </Box>

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
                                <GFSelect
                                    label="Choose the Points Type"
                                    placeholder="Choose one"
                                    items={availablePointTypes}
                                    value={selectedPointTypeId}
                                    onChange={(e) => dispatch(setField({ field: 'selectedPointTypeId', value: e.target.value }))}
                                />
                            </Box>
                        </Flex>
                    )}
                    {
                        !allowUnlockWithPoints && (
                            <>
                                <CustomCollapsible
                                    label="Achievement Requirements"
                                    isOpen={achievementCollapsible}
                                    onClick={() => setAchievementCollapsible(!achievementCollapsible)}
                                />
                                {achievementCollapsible && (
                                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                        <Flex gap="24px">
                                            {/* Available Hooks Column */}
                                            <Flex width="50%" p="24px" borderRadius="4px" border="1px solid var(--gamify-border-color)" direction="column" gap="24px">
                                                <Flex direction="column" gap="12px">
                                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Available Hooks`, "gamify")} margin='0' />
                                                    <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`Drag hooks to activate.`, "gamify")} color="var(--gamify-font-color)" margin='0' />

                                                    <Box p='16px' borderRadius="4px" border='1px solid var(--gamify-border-color)'>
                                                        <Text fontWeight="500" fontSize="0.875rem" margin='0 0 8px 0'>{__("Filter Hooks Type", "gamify")}</Text>
                                                        <Select
                                                            isMulti
                                                            placeholder={__("Select hook type", "gamify")}
                                                            classNamePrefix="gamify-select"
                                                            options={[{ label: "Gamify", value: "gamify" }, { label: "WordPress", value: "wordpress" }]}
                                                        />
                                                    </Box>
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

                                            {/* Active Hooks Column */}
                                            <Box width="50%" borderRadius="4px" border="1px solid var(--gamify-border-color)" p="24px">
                                                <Flex direction="column" gap="12px">
                                                    <GFLabel type="title" fontWeight="500" fontSize="1.25rem" label={__(`Action Hook`, "gamify")} margin='0' />
                                                    <GFLabel type="subtitle" fontWeight="400" fontSize="12px" label={__(`These hooks will run automatically for all users.`, "gamify")} color="var(--gamify-font-color)" margin='0' />
                                                </Flex>

                                                <DroppableArea id="awards-sidebar">
                                                    <Flex direction="column" gap="12px" mt="8px">
                                                        {activeHooks.map((hook) => (
                                                            <DraggableItem key={hook.id} id={hook.id}>
                                                                <Box background="white" borderRadius="4px" border="1px solid var(--gamify-border-color)">
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
                        )
                    }




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