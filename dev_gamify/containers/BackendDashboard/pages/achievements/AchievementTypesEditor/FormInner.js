
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Flex, Icon, Switch, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import GFLabel from "@GFComponents/Labels/GFLabel";
import Select from "react-select";
import { FaArrowRotateRight, FaGamepad, FaWordpressSimple } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import GamifyEditor from "@GFComponents/editor";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import { GoPlus } from "react-icons/go";
import {
    updateHookSettings, addCategoryToList
} from "@GFRedux/Slices/achivementSlice/achievementsSlice";
import { commonInput } from "../../../../../../assets/scss/chakra/recipe";
import GamifyInput from "@GFComponents/GamifyInput";
import { useFormikContext } from "formik";
import DynamicHookForm from "./components/DynamicHookForm";

// --- Draggable Components ---
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: "grab",
        marginBottom: "24px"
    };
    return <Box ref={setNodeRef} {...listeners} {...attributes} style={style}>{children}</Box>;
};

const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return <Box ref={setNodeRef} minH="150px" height='100%' mt="12px">{children}</Box>;
};

const FormInner = () => {
    const dispatch = useDispatch();
    const [openedHooks, setOpenedHooks] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [showInput, setShowInput] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);
    const [message, setMessage] = useState("");

    const { values, setFieldValue } = useFormikContext();

    const {
        allHooks, category, hookSettings, availablePointTypes, congratulationsMessage, availableCategories = [],
    } = useSelector(state => state.achievements);

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

    useEffect(() => { if (congratulationsMessage) setMessage(congratulationsMessage); }, [congratulationsMessage]);

    const availableHooks = useMemo(() => {
        const usedHookIds = new Set(
            values.requirements?.map(r => r.trigger_key)
        );

        return allHooks.filter(hook =>
            !usedHookIds.has(hook.id) &&
            (
                selectedFilterHookType.length === 0 ||
                selectedFilterHookType.includes(hook.integrationSlug)
            )
        );
    }, [allHooks, values.requirements, selectedFilterHookType]);


    const activeHooks = useMemo(() => {
        if (values.requirements?.length > 0) {
            return values.requirements?.map(item => allHooks.find(h => h.id === item.trigger_key)).filter(Boolean)
        }
    }, [values?.requirements]);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const draggedId = active.id;
        const requirements = values.requirements || [];

        const exists = requirements.some(
            r => r.trigger_key === draggedId
        );

        if (over.id === "awards-sidebar" && !exists) {
            const hook = allHooks.find(h => h.id === draggedId);
            if (!hook) return;

            const newRequirement = {
                trigger_key: draggedId,
                parameters: Object.fromEntries(
                    (hook.schema || []).map(f => [
                        f.key,
                        (hookSettings[draggedId]?.[f.key]) ?? f.default
                    ])
                ),
            };

            setFieldValue("requirements", [
                ...requirements,
                newRequirement,
            ]);

            setOpenedHooks([draggedId]);
            return;
        }

        if (over.id === "awards-available" && exists) {
            setFieldValue(
                "requirements",
                requirements.filter(r => r.trigger_key !== draggedId)
            );

            setOpenedHooks(prev => prev.filter(id => id !== draggedId));
            return;
        }
    };

    const hookTypeOptions = Object.keys(hookCategoryIconMap).map(slug => ({ label: slug.charAt(0).toUpperCase() + slug.slice(1), value: slug }));

    return (
        <Flex direction="column" gap={6}>
            <Flex gap="12px">
                <GamifyInput
                    label={__("Point Name", "gamify")}
                    width="calc(50% - 6px)"
                >
                    <Input
                        placeholder={__("Enter point name", "gamify")}
                        value={values.title}
                        onChange={e => {
                            const value = e.target.value
                            setFieldValue('title', value)
                            setFieldValue('plural_name', `${value}s`)
                        }}
                        {...commonInput}
                    />
                </GamifyInput>

                <GamifyInput
                    label={__("Plural Name", "gamify")}
                    width="calc(50% - 6px)"
                >
                    <Input
                        placeholder={__("Enter point name", "gamify")}
                        value={values.plural_name}
                        {...commonInput}
                    />
                </GamifyInput>
            </Flex>

            <GamifyInput
                label={__("Maximum earnings per user", "gamify")}
                desc={__("Number of times a user can earn this badge (0 = unlimited).", "gamify")}
            >
                <Input
                    placeholder={__("Maximum Earnings Per User:", "gamify")}
                    type="number"
                    value={values.max_earnings_per_user}
                    onChange={e => {
                        setFieldValue('max_earnings_per_user', e.target.value)
                    }}
                    {...commonInput}
                />
            </GamifyInput>

            <Box className="gamify-add-achievement-type">
                <GFLabel type="title" label={__("Achievement Type", "gamify")} />

                {values.category.length > 0 && (
                    <RadioGroup.Root
                        value={values.category.find(c => c.is_selected)?.value}
                        onValueChange={(item) => {
                            setFieldValue(
                                'category',
                                values.category.map(cat =>
                                    cat.value === item.value
                                        ? { ...cat, is_selected: true }
                                        : { ...cat, is_selected: false }
                                )
                            );
                        }}
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
                            {values.category.map((cat, index) => (
                                <RadioGroup.Item key={index} value={cat.value}>
                                    <RadioGroup.ItemHiddenInput />

                                    <RadioGroup.ItemIndicator
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "9999px",
                                            border: cat.is_selected
                                                ? "1px solid #007AFF"
                                                : "1px solid #ccc",
                                            backgroundColor: cat.is_selected
                                                ? "#007AFF"
                                                : "transparent",
                                        }}
                                    />

                                    <RadioGroup.ItemText>
                                        {sprintf(__('%s', 'gemboards'), cat.label)}
                                    </RadioGroup.ItemText>
                                </RadioGroup.Item>
                            ))}
                        </Flex>
                    </RadioGroup.Root>
                )}

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
                                setFieldValue('category', [...values.category, { label: newCat, value: newCat, is_selected: false }])
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
                        <Icon as={GoPlus} boxSize="16px" />{__("Add Achievement Type", "gamify")}
                    </Button>
                )}
            </Box>

            <GamifyInput label={__("Congratulations Message", "gamify")}>
                <GamifyEditor
                    name={'congratulations_message'}
                    defaultValue={values.congratulations_message}
                    saveValueHandler={setFieldValue}
                    suffix={'acivements-message'}
                />
            </GamifyInput>

            <Switch.Root
                checked={values.unlock_with_points_enabled}
                onCheckedChange={e => {
                    setFieldValue('unlock_with_points_enabled', e.checked)
                }}
                colorPalette="blue"
            >
                <Switch.HiddenInput />
                <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Allow unlock with points", "gamify")}</Switch.Label>
                <Switch.Control />
            </Switch.Root>

            {values?.unlock_with_points_enabled ? (
                <Flex gap="12px" className="gamify-allow-unlock-point">
                    <GamifyInput label={__("Points", "gamify")} width="calc(50% - 6px)">
                        <Input
                            placeholder={__("Enter point", "gamify")}
                            type="number"
                            value={values.required_points_amount}
                            onChange={e => {
                                setFieldValue('required_points_amount', e.target.value)
                            }}
                            {...commonInput}
                        />
                    </GamifyInput>

                    <GamifyInput label={__("Choose the Points Type", "gamify")} width="calc(50% - 6px)">
                        {/* <Select
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            options={availablePointTypes}
                            value={availablePointTypes.find(opt => Number(opt.value) === Number(values?.required_point_type_id))}
                            onChange={option => {
                                setFieldValue('required_point_type_id', option.value)
                            }}
                            menuPlacement="top"
                        /> */}
                    </GamifyInput>
                </Flex>
            ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <Box p="24px" border="1px solid var(--gamify-border-color)" borderRadius="4px" className="gamify-achievement-requirements">
                        <GFLabel type="plainHeading" label={__("Achievement Requirements", "gamify")} />

                        <Flex gap="24px">
                            <Flex width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px" className="gamify-achievement-requirements">
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
                                            className="gamify-select"
                                            classNamePrefix="gamify-select"
                                            isMulti
                                            options={hookTypeOptions}
                                            onChange={v => setSelectedFilterHookType(v.map(o => o.value))}
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
                                    {activeHooks && activeHooks.map(h => (
                                        <DraggableItem key={h.id} id={h.id}>
                                            <DynamicHookForm
                                                key={h.id}
                                                hookId={h.id}
                                                hookInfo={h}
                                                settings={hookSettings[h.id] || {}}
                                                type="award"
                                                context="achievement"
                                                onChange={(k, v) => dispatch(updateHookSettings({ hookId: h.id, settings: { [k]: v } }))}
                                                isOpen={openedHooks.includes(h.id)}
                                                setIsOpen={v => setOpenedHooks(v ? [...openedHooks, h.id] : openedHooks.filter(i => i !== h.id))}
                                            />
                                        </DraggableItem>
                                    ))}
                                </DroppableArea>
                            </Box>
                        </Flex>
                    </Box>
                </DndContext>
            )}
        </Flex>
    );
};

export default FormInner;