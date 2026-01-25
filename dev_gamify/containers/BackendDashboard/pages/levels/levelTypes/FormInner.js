import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, Flex, Icon, Switch, Image, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import Select from "react-select";
import { FaGamepad, FaWordpressSimple } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import GFLabel from "@GFComponents/Labels/GFLabel";
import GamifyEditor from "@GFComponents/editor";
import { commonInput } from "../../../../../../assets/scss/chakra/recipe";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import GamifyInput from "@GFComponents/GamifyInput";
import BoxView from "@GFComponents/BoxView/BoxView";
import { GoPlus } from "react-icons/go";
import { useFormikContext } from "formik";
import { API, getAddonActiveStatus, namespace } from "@GFUtils/helper";
import Requirements from "@GFComponents/Requirements";
import { DraggableItem } from "@GFComponents/Requirements/helper";
import { arrowForward } from "@GFUtils/icons";

const FormInner = () => {
    const [message, setMessage] = useState("");
    const [levels, setLevels] = useState(true);
    const [openedHooks, setOpenedHooks] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [showInput, setShowInput] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [levelTypesLoading, setLevelTypesLoading] = useState(false);
    const [levelTypesData, setLevelTypesData] = useState([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsData, setLevelsData] = useState([]);
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);
    const [types, setTypes] = useState([]);
    const { values, setFieldValue } = useFormikContext();
    const addons = useSelector(state => state.addons);
    const isRestrictContentActive = getAddonActiveStatus(addons, 'restrict_unlock');

    const fetchAchievements = async (key) => {
        try {
            setLevelTypesLoading(true);
            let url = namespace + 'achievements';
            if (key) url += "?search=" + key;
            const response = await API.get(url);
            const achievements = response.data?.map(item => {
                return { label: item.title, value: item.id }
            })
            setLevelTypesData(achievements);
        } catch (error) {
            console.warn({ error })
        } finally {
            setLevelTypesLoading(false)
        }
    };

    const fetchLevels = async (key) => {
        try {
            setLevelsLoading(true);
            let url = namespace + 'levels';
            if (key) url += "?search=" + key;
            const response = await API.get(url);
            const levels = response.data.map(item => {
                return { label: item.title, value: item.id }
            })
            setLevelsData(levels);
        } catch (error) {
            console.warn({ error })
        } finally {
            setLevelsLoading(false)
        }
    };

    const fetchTypes = async (searchKey="") => {
        if(searchKey) searchKey = "&search=" + searchKey;
        try {
            const url = namespace + 'taxonomies/level_type?page=1&per_page=100'+ searchKey;
            const response = await API.get(url);
            const selectData = response.data.map(item => {
                return {label: item.name, value: `${item.id}`}
            })
            setTypes(selectData)
        } catch (error) {
            console.warn(error)
        }
    }

    useEffect(() => {
        if (isRestrictContentActive) {
            if (levelTypesData.length === 0) {
                fetchAchievements();
            }
            if (levelsData.length === 0) {
                fetchLevels();
            }
        }
        fetchTypes();
    }, [isRestrictContentActive])

    const { hookSettings, allHooks, availablePointTypes } = useSelector(state => state.levels);

    const handleImageUpload = () => {
        if (typeof wp !== 'undefined' && wp.media) {
            const frame = wp.media({ title: 'Select Level Icon', button: { text: 'Use this Icon' }, multiple: false });
            frame.on('select', () => { setFieldValue('icon', frame.state().get('selection').first().toJSON().url); });
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

                        <Box bg="#0CDC01" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={arrowForward} />
                        </Box>
                    </Flex>

                    <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
                </div>
            </DraggableItem>
        );
    };

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

    return (
        <Flex direction="column" gap={6}>
            <Flex gap="12px">
                <GamifyInput label={__("Level Name", "gamify")} width="100%">
                    <Input
                        placeholder={__("Enter level name", "gamify")}
                        value={values?.title}
                        onChange={e => {
                            setFieldValue('title', e.target.value);
                        }}
                        {...commonInput}
                    />
                </GamifyInput>
            </Flex>

            <Box className="gamify-add-level-type">
                <GamifyInput 
                    label={__("Level Type", "gamify")} 
                    width="100%" 
                    direction={'row'}
                    justifyContent="space-between"
                >
                    <Select
                        className="gamify-select gamify-select--width-half"
                        classNamePrefix="gamify-select"
                        options={types}
                        onInputChange={(inputValue) => {
                            fetchTypes(inputValue);
                            return inputValue;
                        }}
                        value={
                            types?.find(
                            opt => Number(opt.value) === Number(values?.category_id)
                            ) || null
                        }
                        onMenuOpen={fetchTypes}
                        onChange={option => {
                            setFieldValue('category_id', option.value)
                        }}
                        menuPlacement="bottom"
                    />
                </GamifyInput>
            </Box>

            <GamifyInput label={__("Congratulations Message", "gamify")} width="100%">
                <GamifyEditor
                    name={'congratulations_message'}
                    defaultValue={values.congratulations_message}
                    saveValueHandler={setFieldValue}
                    suffix={'levels-message'}
                />
            </GamifyInput>

            <GFLabel type="heading" margin="0" label={__(`Level Requirements`, "gamify")} />

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
                                options={levelTypesData}
                                onInputChange={(inputValue) => {
                                    fetchAchievements(inputValue);
                                    return inputValue;
                                }}
                                value={
                                    levelTypesData?.find(
                                        opt => Number(opt.value) === Number(values?.required_achievement_id)
                                    ) || null
                                }
                                isLoading={levelTypesLoading}
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
                            isLoading={levelTypesLoading}
                            menuPlacement="bottom"
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
                <Flex gap="12px">
                    <GamifyInput label={__("Minimum Balance", "gamify")} width="calc((100% / 3) - 6px)">
                        <Input
                            placeholder={__("Enter minimum balance", "gamify")}
                            value={values.min_points}
                            type="number"
                            onChange={e => setFieldValue('min_oints', e.target.value)}
                            {...commonInput}
                        />
                    </GamifyInput>

                    <GamifyInput label={__("Maximum Balance", "gamify")} width="calc((100% / 3) - 6px)">
                        <Input
                            placeholder={__("Enter maximum balance", "gamify")}
                            value={values.min_points}
                            type="number"
                            onChange={e => setFieldValue('min_oints', e.target.value)}
                            {...commonInput}
                        />
                    </GamifyInput>

                    <GamifyInput label={__("Choose the Points Type", "gamify")} width="calc((100% / 3) - 6px)">
                        <Select
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            placeholder="Choose one"
                            options={availablePointTypes}
                            value={availablePointTypes?.find(opt => opt.value == values.point_type_id)}
                            onChange={sel => setFieldValue('point_type_id', sel.value)}
                        />
                    </GamifyInput>
                </Flex>
            ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <Requirements
                        label={__("Level Requirements", "gamify")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setLevels(!levels)
                        }}
                        open={levels}
                        parent="gamify-level-requirements"
                        child="gamify-level-requirements-wrap"
                        childLeft="gamify-level-requirements-available-hooks"
                        childRight="gamify-level-requirements-active-hooks"
                        hookTypeOptions={Object.keys(hookCategoryIconMap).map(k => ({ label: k, value: k }))}
                        filterHookType={v => setSelectedFilter(v.map(o => o.value))}
                        renderHookCard={renderHookCard}
                        selectedHookIds={activeHooks?.map(h => h?.id)}
                        openHookType={openedHooks}
                        setOpenHookType={setOpenedHooks}
                        allHooks={allHooks}
                        hookSettings={hookSettings}
                        actionName="award"
                        selectedFilterType={selectedFilterHookType}
                        scope="level"
                    />
                </DndContext>
            )}

            <BoxView title={__(`Levels Logo`, "gamify")} width="100%">
                {values?.icon ? (
                    <Flex alignItems="center" justifyContent="space-between">
                        <Image src={values?.icon} width="100px" objectFit="cover" />
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
    );
};

export default FormInner;
