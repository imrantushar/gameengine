import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, Flex, Icon, Switch, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import GFLabel from "@GFComponents/Labels/GFLabel";
import Select from "react-select";
import { FaGamepad, FaWordpressSimple } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import GamifyEditor from "@GFComponents/editor";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import { GoPlus } from "react-icons/go";
import { commonInput } from "../../../../../../assets/scss/chakra/recipe";
import GamifyInput from "@GFComponents/GamifyInput";
import { useFormikContext } from "formik";
import { API, getAddonActiveStatus, namespace } from "@GFUtils/helper";
import Requirements from "@GFComponents/Requirements";
import { DraggableItem } from "@GFComponents/Requirements/helper";
import { arrowForward,  } from "@GFUtils/icons";

const FormInner = () => {
    const [achievements, setAchievements] = useState(true);
    const [openedHooks, setOpenedHooks] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [showInput, setShowInput] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);
    const [message, setMessage] = useState("");
    const [achievementsLoading, setAchievementsLoading] = useState(false);
    const [achievementsData, setAchievementsData] = useState([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsData, setLevelsData] = useState([]);
    const addons = useSelector(state => state.addons);
    const {availablePointTypes} = useSelector(state => state.achievements);
    const isRestrictContentActive = getAddonActiveStatus(addons, 'restrict_unlock');
    const { values, setFieldValue } = useFormikContext();

    const fetchAchievements = async (key) => {
        try {
            setAchievementsLoading(true);
            let url = namespace + 'achievements';
            if(key) url += "?search=" + key;
            const response = await API.get(url);
            const achievements = response.data?.map(item => {
                return {label: item.title, value: item.id}
            })
            setAchievementsData(achievements);
        } catch (error) {
            console.warn({error})
        } finally {
            setAchievementsLoading(false)
        }
    };

    const fetchLevels = async (key) => {
        try {
            setLevelsLoading(true);
            let url = namespace + 'levels';
            if(key) url += "?search=" + key;
            const response = await API.get(url);
            const levels = response.data.map(item => {
                return {label: item.title, value: item.id}
            })
            setLevelsData(levels);
        } catch (error) {
            console.warn({error})
        } finally {
            setLevelsLoading(false)
        }
    }

    useEffect(() => {
        if(isRestrictContentActive) {
            if(achievementsData.length === 0) {
                fetchAchievements();
            }
            if(levelsData.length === 0) {
                fetchLevels();
            }
        }
    }, [isRestrictContentActive])

    const {
        allHooks, hookSettings, congratulationsMessage
    } = useSelector(state => state.achievements);

    const hookCategoryIconMap = {
        wordpress: { icon: FaWordpressSimple, bg: "#21759b" },
        woocommerce: { icon: SiWoocommerce, bg: "#96588a" },
        gamify: { icon: FaGamepad, bg: "#006BFF" },
        interaction: { icon: AiFillInteraction, bg: "#ff5722" },
    };

    const renderHookCard = (item, type) => {
        const slug = item.integrationSlug || 'wordpress';
        const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
        return (
            <DraggableItem key={`${type}_${item.id}`} id={`${type}_${item.id}`}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Flex justify="space-between" align="center" padding="10px 16px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                        <Flex align="center" gap='8px'>
                            <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                                <Icon as={config.icon} boxSize={3} />
                            </Center>
                            <GFLabel type="title" fontWeight="400" label={item?.label} />
                        </Flex>

                        <Box bg="#0CDC01" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={arrowForward} />
                        </Box>
                    </Flex>

                    <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
                </div>
            </DraggableItem>
        );
    };

    useEffect(() => { if (congratulationsMessage) setMessage(congratulationsMessage); }, [congratulationsMessage]);

    const activeHooks = useMemo(() => {
        if (values?.requirements?.length > 0) {
            return values?.requirements
                .filter(item => item?.action_type === "award")
                ?.map(item => allHooks.find(h => h.id === item.trigger_key))
                .filter(Boolean)
        }
        return [];
    }, [values?.requirements, allHooks]);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const draggedId = active.id;
        const requirements = values.requirements || [];

        if (draggedId.startsWith("award_")) {
            const pureId = draggedId.replace("award_", "");
            const exists = requirements.some(
                r => r.trigger_key === pureId && r.action_type === "award"
            );

            if (over.id === "awards-sidebar" && !exists) {
                const hook = allHooks.find(h => h.id === pureId);
                if (!hook) return;

                const newRequirement = {
                    trigger_key: pureId,
                    action_type: "award",
                    parameters: Object.fromEntries(
                        (hook.schema || []).map(f => [
                            f.key,
                            (hookSettings[`award_${pureId}`]?.[f.key]) ?? f.default
                        ])
                    ),
                };

                setFieldValue("requirements", [
                    ...requirements,
                    newRequirement,
                ]);

                setOpenedHooks([pureId]);
                return;
            }

            if (over.id === "awards-available" && exists) {
                setFieldValue(
                    "requirements",
                    requirements.filter(r => !(r.trigger_key === pureId && r.action_type === "award"))
                );

                setOpenedHooks(prev => prev.filter(id => id !== pureId));
                return;
            }
        }
    };

    const hookTypeOptions = Object.keys(hookCategoryIconMap).map(slug => ({ label: slug.charAt(0).toUpperCase() + slug.slice(1), value: slug }));
    return (
        <Flex direction="column" gap={6}>
            <Flex gap="12px">
                <GamifyInput label={__("Point Name", "gamify")}>
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

                {values?.category?.length > 0 && (
                    <RadioGroup.Root
                        value={values?.category?.find(c => c.is_selected)?.value}
                        onValueChange={(item) => {
                            setFieldValue(
                                'category',
                                values?.category.map(cat =>
                                    cat?.value === item?.value
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
                            {values?.category.map((cat, index) => (
                                <RadioGroup.Item key={index} value={cat?.value}>
                                    <RadioGroup.ItemHiddenInput />

                                    <RadioGroup.ItemIndicator
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "9999px",
                                            border: cat?.is_selected
                                                ? "1px solid #007AFF"
                                                : "1px solid #ccc",
                                            backgroundColor: cat?.is_selected
                                                ? "#007AFF"
                                                : "transparent",
                                        }}
                                    />

                                    <RadioGroup.ItemText>
                                        {sprintf(__('%s', 'gemboards'), cat?.label)}
                                    </RadioGroup.ItemText>
                                </RadioGroup.Item>
                            ))}
                        </Flex>
                    </RadioGroup.Root>
                )}

                {showInput ? (
                    <Flex alignItems="center" mt="6px" gap={2}>
                        <Input {...commonInput} size="sm" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder={__("Enter type name", "gamify")} />

                        <Button
                            size="xs"
                            bg="var(--gamify-border-color)"
                            fontSize="12px"
                            fontWeight="500"
                            lineHeight="16px"
                            p="6px 8px"
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
                checked={values.is_restricted}
                onCheckedChange={e => {
                    setFieldValue('is_restricted', e.checked)
                }}
                colorPalette="blue"
                disabled={!isRestrictContentActive}
            >
                <Switch.HiddenInput />
                <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Enable Require Unlock", "gamify")}</Switch.Label>
                <Switch.Control />
            </Switch.Root>

            {(values?.is_restricted && isRestrictContentActive) && (
                <Flex direction={'column'} gap="12px">
                    <Flex gap="12px">
                        <GamifyInput label={__("Required Achievements", "gamify")} width="calc(50% - 6px)">
                            <Select
                                className="gamify-select"
                                classNamePrefix="gamify-select"
                                options={achievementsData}
                                onInputChange={(inputValue) => {
                                    fetchAchievements(inputValue);
                                    return inputValue;
                                }}
                                value={
                                    achievementsData?.find(
                                    opt => Number(opt.value) === Number(values?.required_achievement_id)
                                    ) || null
                                }
                                isLoading={achievementsLoading}
                                onChange={(option) => {
                                    setFieldValue('required_achievement_id', option?.value || null);
                                }}
                                menuPlacement="bottom"
                            />
                        </GamifyInput>
                        <GamifyInput label={__("Required Levels", "gamify")} width="calc(50% - 6px)">
                            <Select
                                className="gamify-select"
                                classNamePrefix="gamify-select"
                                options={levelsData}
                                onInputChange={(inputValue) => {
                                    fetchLevels(inputValue);
                                    return inputValue;
                                }}
                                value={
                                    levelsData?.find(
                                    opt => Number(opt.value) === Number(values?.required_level_id)
                                    ) || null
                                }
                                isLoading={levelsLoading}
                                onChange={option => {
                                    setFieldValue('required_level_id', option.value)
                                }}
                                menuPlacement="bottom"
                            />
                        </GamifyInput>
                    </Flex>
                    <GamifyInput label={__("Restriction Message", "gamify")}>
                        <Input
                            placeholder={__("Restriction message", "gamify")}
                            type="textarea"
                            value={values.restriction_message}
                            onChange={e => {
                                setFieldValue('restriction_message', e.target.value)
                            }}
                            {...commonInput}
                        />
                    </GamifyInput>
                </Flex>
            )}

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
                        <Select
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            options={availablePointTypes}
                            value={availablePointTypes.length > 0 && availablePointTypes.find(opt => Number(opt.value) === Number(values?.required_point_type_id))}
                            onChange={option => {
                                setFieldValue('required_point_type_id', option.value)
                            }}
                            menuPlacement="top"
                        />
                    </GamifyInput>
                </Flex>
            ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <Requirements
                        label={__("Achievement Requirements", "gamify")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setAchievements(!achievements)
                        }}
                        open={achievements}
                        parent="gamify-achievement-requirements"
                        child="gamify-achievement-requirements-wrap"
                        childLeft="gamify-achievement-requirements-available-hooks"
                        childRight="gamify-achievement-requirements-active-hooks"
                        hookTypeOptions={hookTypeOptions}
                        filterHookType={v => setSelectedFilterHookType(v.map(o => o.value))}
                        renderHookCard={renderHookCard}
                        selectedHookIds={activeHooks?.map(h => h?.id)}
                        openHookType={openedHooks}
                        setOpenHookType={setOpenedHooks}
                        allHooks={allHooks}
                        hookSettings={hookSettings}
                        actionName="award"
                        selectedFilterType={selectedFilterHookType}
                    />
                </DndContext>
            )}
        </Flex>
    );
};

export default FormInner;
