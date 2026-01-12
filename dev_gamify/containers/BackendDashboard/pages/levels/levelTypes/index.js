import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Text, Switch, Image, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import Select from "react-select";
import { FaArrowRotateRight, FaGamepad, FaWordpressSimple, FaLock } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import TopBar from "@GFComponents/TopBar";
import GFLabel from "@GFComponents/Labels/GFLabel";
import LabeledInput from "@GFComponents/LabeledInput";
import GamifyEditor from "@GFComponents/editor";
import CustomCollapsible from "@GFComponents/Collapsible";
import { commonInput, primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import { route_path } from "@GFUtils/helper";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import {
    fetchLevelById, saveLevel, updateLevel, resetForm, setField,
    addHook, removeHook, updateHookSettings,
    fetchLevelTriggers, fetchPointTypes, addCategoryToList, fetchLevels,
    fetchDynamicOptions
} from "../../../../../redux/Slices/levelsSlice/levelsSlice.js";
import GamifyBox from "@GFComponents/GamifyBox";
import GamifyInput from "@GFComponents/GamifyInput";
import BoxView from "@GFComponents/BoxView/BoxView";
import { GoPlus } from "react-icons/go";

// --- Helpers ---
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, opacity: isDragging ? 0.85 : 1, cursor: "grab", marginBottom: "24px" };
    return <Box ref={setNodeRef} {...listeners} {...attributes} style={style}>{children}</Box>;
};

const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return <Box ref={setNodeRef} minH="150px" height='100%' mt="12px">{children}</Box>;
};

const DynamicLevelField = ({ fieldKey, config, value, onChange, integrationSlug }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const isDisabled = config.is_pro && false;

    useEffect(() => {
        if (config.dynamic && !isDisabled) {
            setLoading(true);
            dispatch(fetchDynamicOptions({ integration: config.dynamic.integration || integrationSlug, query: config.dynamic.query }))
                .unwrap().then(res => setDynamicOptions(res)).finally(() => setLoading(false));
        }
    }, [config.dynamic, isDisabled, dispatch, integrationSlug]);

    const labelElement = (
        <Flex align="center" gap={2} mb="8px">
            <Text fontSize="sm" fontWeight="500" m="0">{config.label} {config.required && <span style={{ color: "red" }}>*</span>}</Text>
            {config.is_pro && <Icon as={FaLock} color="orange.400" boxSize={3} />}
        </Flex>
    );

    if (config.type === 'select' || config.type === 'dynamic_select') {
        const optionsSource = config.options ? (Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([v, l]) => ({ value: v, label: l }))) : dynamicOptions;
        return (
            <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
                {labelElement}
                <Select isDisabled={isDisabled} isLoading={loading} options={optionsSource} value={optionsSource.find(opt => String(opt.value) === String(value)) || null} onChange={(sel) => onChange(sel ? sel.value : '')} classNamePrefix="gamify-select" />
            </Box>
        );
    }
    return <LabeledInput label={config.label} type={config.type === 'number' ? 'number' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} disabled={isDisabled} />;
};

const DynamicHookForm = ({ hookId, hookInfo, settings, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <CustomCollapsible label={hookInfo?.label || hookId} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
                <Flex direction="column" gap="16px">
                    {(hookInfo.schema || []).map(config => {
                        if (config.scope && !config.scope.includes('level')) return null;
                        return (
                            <DynamicLevelField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} onChange={(newValue) => onChange(config.key, newValue)} />
                        );
                    })}
                </Flex>
                <Flex borderTop="1px solid var(--gamify-border-color)" mt="24px" pt="16px" justifyContent='flex-end'>
                    <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>{__('Done', 'gamify')}</Button>
                </Flex>
            </CustomCollapsible>
        </>
    );
};

const LevelType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const [message, setMessage] = useState("");
    const [openedHooks, setOpenedHooks] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [showInput, setShowInput] = useState(false);
    const [newCat, setNewCat] = useState("");

    const {
        title, pluralName, congratulationsMessage, category, unlockWithPoints, minPoints, maxPoints,
        selectedPointTypeId, levelIcon, selectedHookIds, hookSettings, saveStatus,
        allHooks, availablePointTypes, availableCategories = []
    } = useSelector(state => state.levels);

    useEffect(() => {
        dispatch(fetchLevelTriggers('level'));
        dispatch(fetchPointTypes());
        dispatch(fetchLevels());
        if (editId) dispatch(fetchLevelById(editId));
        else dispatch(resetForm());
    }, [dispatch, editId]);

    useEffect(() => { if (congratulationsMessage) setMessage(congratulationsMessage); }, [congratulationsMessage]);

    const handleImageUpload = () => {
        if (typeof wp !== 'undefined' && wp.media) {
            const frame = wp.media({ title: 'Select Level Icon', button: { text: 'Use this Icon' }, multiple: false });
            frame.on('select', () => { dispatch(setField({ field: 'levelIcon', value: frame.state().get('selection').first().toJSON().url })); });
            frame.open();
        }
    };

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
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Flex justify="space-between" align="center" padding="10px 16px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                        <Flex align="center" gap='8px'>
                            <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                                <Icon as={config.icon} boxSize={3} />
                            </Center>
                            <GFLabel type="title" fontWeight="400" label={item?.label} />
                        </Flex>

                        <Box bg="green.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={FaArrowRotateRight} boxSize={3} />
                        </Box>
                    </Flex>

                    <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
                </div>
            </DraggableItem>
        );
    };

    const availableHooks = allHooks.filter(h => !selectedHookIds.includes(h.id) && (selectedFilter.length === 0 || selectedFilter.includes(h.integrationSlug)));
    const activeHooks = selectedHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        if (availableHooks.some(i => i.id === active.id) && over.id === "awards-sidebar") dispatch(addHook(active.id));
        if (selectedHookIds.includes(active.id) && over.id === "awards-available") dispatch(removeHook(active.id));
    };

    const handleSave = async () => {
        if (!title) return alert("Level Name is required");
        const payload = {
            title, plural_name: pluralName, congratulations_message: message, unlock_with_points_enabled: unlockWithPoints,
            min_points: minPoints, max_points: maxPoints, point_type_id: selectedPointTypeId, icon: levelIcon, category,
            requirements: activeHooks.map(h => ({ trigger_key: h.id, parameters: Object.fromEntries((h.schema || []).map(f => [f.key, (hookSettings[h.id] || {})[f.key] ?? f.default])) }))
        };
        const res = editId ? await dispatch(updateLevel({ id: editId, data: payload })) : await dispatch(saveLevel(payload));
        if (res.meta.requestStatus === 'fulfilled') navigate(`${route_path}admin.php?page=gamify-levels`);
    };

    return (
        <>
            <TopBar
                path={__("Level Type", "gamify")}
                rightContent={
                    <Button {...primaryBtn} onClick={handleSave} isLoading={saveStatus === 'saving'}>
                        {editId ? __("Update", "gamify") : __("Save Changes", "gamify")}
                    </Button>
                }
            />

            <GamifyBox dynamicClasses="gamify-levels" heading={__(`Level Type`, "gamify")}>
                <Flex direction="column" gap={6}>
                    <Flex gap="12px">
                        <GamifyInput label={__("Level Name", "gamify")} width="calc(50% - 6px)">
                            <Input
                                placeholder={__("Enter level name", "gamify")}
                                value={title}
                                onChange={e => {
                                    dispatch(setField({ field: 'title', value: e.target.value }));
                                    dispatch(setField({
                                        field: 'pluralName',
                                        value: e.target.value ? `${e.target.value}s` : ""
                                    }));
                                }}
                                {...commonInput}
                            />
                        </GamifyInput>

                        <GamifyInput label={__("Plural Name", "gamify")} width="calc(50% - 6px)">
                            <Input
                                placeholder={__("Enter point name", "gamify")}
                                value={pluralName}
                                {...commonInput}
                            />
                        </GamifyInput>
                    </Flex>

                    <Box className="gamify-add-level-type">
                        <GFLabel type="title" label={__("Level Type", "gamify")} />

                        {availableCategories.length > 0 ? (
                            <RadioGroup.Root
                                value={category}
                                onValueChange={(details) =>
                                    dispatch(
                                        setField({
                                            field: "category",
                                            value: details.value,
                                        })
                                    )
                                }
                                size="sm"
                            >
                                <Flex
                                    mt="4px"
                                    gap="24px"
                                    p="12px"
                                    border="1px solid var(--gamify-border-color)"
                                    borderRadius="4px"
                                    flexWrap="wrap"
                                >
                                    {availableCategories.map((cat, index) => (
                                        <RadioGroup.Item key={index} value={cat}>
                                            <RadioGroup.ItemHiddenInput />
                                            <RadioGroup.ItemIndicator
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    borderRadius: "9999px",
                                                    border: category === cat
                                                        ? "1px solid #007AFF"
                                                        : "1px solid #ccc",
                                                    backgroundColor: category === cat
                                                        ? "#007AFF"
                                                        : "transparent",
                                                }}
                                            />
                                            <RadioGroup.ItemText>
                                                {/* translators: %s: cat */}
                                                {sprintf(
                                                    __('%s', 'gemboards'),
                                                    cat,
                                                )}
                                            </RadioGroup.ItemText>
                                        </RadioGroup.Item>
                                    ))}
                                </Flex>
                            </RadioGroup.Root>
                        ) : null}

                        {showInput ? (
                            <Flex mt="6px" gap={2}>
                                <Input {...commonInput} size="sm" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder={__("Enter type name", "gamify")} />

                                <Button
                                    size="xs"
                                    bg="var(--gamify-border-color)"
                                    fontSize="12px"
                                    fontWeight="500"
                                    lineHeight="16px"
                                    p="6px 8px"
                                    height="auto"
                                    variant="ghost"
                                    onClick={() => setShowInput(false)}
                                >
                                    {__("Cancel", "gamify")}
                                </Button>

                                <Button
                                    size="xs"
                                    bg="var(--gamify-primary)"
                                    color="#fff"
                                    fontSize="12px"
                                    fontWeight="500"
                                    lineHeight="16px"
                                    p="6px 8px"
                                    height="auto"
                                    variant="ghost"
                                    onClick={() => {
                                        dispatch(addCategoryToList(newCat));
                                        dispatch(setField({ field: 'category', value: newCat }));
                                        setNewCat("");
                                        setShowInput(false);
                                    }}
                                >
                                    {__("Add", "gamify")}
                                </Button>
                            </Flex>
                        ) : (
                            <Button
                                color="var(--gamify-primary)"
                                fontSize="12px"
                                fontWeight="500"
                                lineHeight="16px"
                                p="6px 8px"
                                height="auto"
                                variant="ghost"
                                mt="12px"
                                onClick={() => setShowInput(true)}
                            >
                                <Icon as={GoPlus} boxSize="16px" />{__("Add Level Type", "gamify")}
                            </Button>
                        )}
                    </Box>

                    <Box><GFLabel margin='0 0 12px 0' type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
                        <GamifyEditor defaultValue={message} saveValueHandler={setMessage} />
                    </Box>

                    <GFLabel type="heading" margin="0" label={__(`Level Requirements`, "gamify")} />

                    <Switch.Root
                        checked={unlockWithPoints}
                        onCheckedChange={e => dispatch(setField({ field: 'unlockWithPoints', value: e.checked }))}
                        colorPalette="blue"
                    >
                        <Switch.HiddenInput />
                        <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Allow unlock with points", "gamify")}</Switch.Label>
                        <Switch.Control />
                    </Switch.Root>

                    {unlockWithPoints ? (
                        <Flex gap="12px">
                            <GamifyInput label={__("Minimum Balance", "gamify")} width="calc((100% / 3) - 6px)">
                                <Input
                                    placeholder={__("Enter minimum balance", "gamify")}
                                    value={minPoints}
                                    type="number"
                                    onChange={e => dispatch(setField({ field: 'minPoints', value: e.target.value }))}
                                    {...commonInput}
                                />
                            </GamifyInput>

                            <GamifyInput label={__("Maximum Balance", "gamify")} width="calc((100% / 3) - 6px)">
                                <Input
                                    placeholder={__("Enter maximum balance", "gamify")}
                                    value={maxPoints}
                                    type="number"
                                    onChange={e => dispatch(setField({ field: 'maxPoints', value: e.target.value }))}
                                    {...commonInput}
                                />
                            </GamifyInput>

                            <GamifyInput label={__("Choose the Points Type", "gamify")} width="calc((100% / 3) - 6px)">
                                <Select
                                    className="gamify-select"
                                    classNamePrefix="gamify-select"
                                    placeholder="Choose one"
                                    options={availablePointTypes} value={availablePointTypes.find(opt => opt.value == selectedPointTypeId)} onChange={sel => dispatch(setField({ field: 'selectedPointTypeId', value: sel ? sel.value : null }))}
                                />
                            </GamifyInput>
                        </Flex>
                    ) : (
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <Box p="24px" border="1px solid var(--gamify-border-color)" borderRadius="4px" className="gamify-level-requirements">
                                <GFLabel type="plainHeading" label={__("Level Requirements", "gamify")} />

                                <Flex gap="24px">
                                    <Flex width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px" className="gamify-level-requirements">
                                        <Flex direction="column" gap="12px">
                                            <GFLabel type="plainHeading" label={__("Available Hooks", "gamify")} />
                                            <GFLabel
                                                type="subtitle"
                                                color="var(--gamify-font-color)"
                                                label={__("To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.", "gamify")}
                                            />
                                        </Flex>

                                        <Box p="12px" border="1px solid var(--gamify-border-color)" borderRadius="4px">
                                            <GamifyInput label={__("Filter Hooks Type", "gamify")}>
                                                <Select
                                                    isMulti
                                                    placeholder={__("Filter...", "gamify")}
                                                    options={Object.keys(hookCategoryIconMap).map(k => ({ label: k, value: k }))}
                                                    onChange={v => setSelectedFilter(v.map(o => o.value))}
                                                    className="gamify-select"
                                                    classNamePrefix="gamify-select"
                                                />
                                            </GamifyInput>
                                        </Box>

                                        <DroppableArea id="awards-available">{availableHooks.map(h => renderHookCard(h))}</DroppableArea>
                                    </Flex>

                                    <Box width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" className="gamify-achievement-requirements">
                                        <Flex direction="column" gap="12px">
                                            <GFLabel type="plainHeading" label={__("Active Hooks", "gamify")} />
                                            <GFLabel
                                                type="subtitle"
                                                color="var(--gamify-font-color)"
                                                label={__("The following hooks are used for all users", "gamify")}
                                            />
                                        </Flex>

                                        <DroppableArea id="awards-sidebar">
                                            {activeHooks.map(h => (
                                                <DynamicHookForm key={h.id} hookId={h.id} hookInfo={h} settings={hookSettings[h.id] || {}} onChange={(k, v) => dispatch(updateHookSettings({ hookId: h.id, settings: { [k]: v } }))} />
                                            ))}
                                        </DroppableArea>
                                    </Box>
                                </Flex>
                            </Box>
                        </DndContext>
                    )}

                    <BoxView title={__(`Levels Logo`, "gamify")} width="100%">
                        {levelIcon ? (
                            <Flex alignItems="center" justifyContent="space-between">
                                <Image src={levelIcon} width="100px" objectFit="cover" />
                                <Button
                                    bg="var(--gamify-primary)"
                                    color="#fff"
                                    fontSize="12px"
                                    fontWeight="500"
                                    lineHeight="16px"
                                    p="6px 8px"
                                    height="auto"
                                    variant="ghost"
                                    onClick={handleImageUpload}
                                >
                                    {__("Change Level Logo", "gamify")}
                                </Button>
                            </Flex>
                        ) : (
                            <Button
                                bg="var(--gamify-primary)"
                                color="#fff"
                                fontSize="12px"
                                fontWeight="500"
                                lineHeight="16px"
                                p="6px 8px"
                                height="auto"
                                variant="ghost"
                                onClick={handleImageUpload}
                            >
                                {__("Set Level Logo", "gamify")}
                            </Button>
                        )}
                    </BoxView>
                </Flex>
            </GamifyBox>
        </>
    );
};

export default LevelType;
