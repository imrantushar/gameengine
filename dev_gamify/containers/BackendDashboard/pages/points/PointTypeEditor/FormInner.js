import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex, Icon, Center, Input } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FaGamepad, FaWordpressSimple } from 'react-icons/fa6';
import { DndContext, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { AiFillInteraction } from 'react-icons/ai';
import { SiWoocommerce } from "react-icons/si";
import { useFormikContext } from 'formik';
import GamifyInput from '@GFComponents/GamifyInput';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import RequirementsLoader from '@GFComponents/GamifyLoader/RequirementsLoader';
import Requirements from '@GFComponents/Requirements';
import { DraggableItem } from '@GFComponents/Requirements/helper';
import { arrowForward } from '@GFUtils/icons';

const FormInner = ({ hooksLoading }) => {
    const { values, setFieldValue } = useFormikContext();
    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);
    const [openedAwardHooks, setOpenedAwardHooks] = useState([]);
    const [openedDeductHooks, setOpenedDeductHooks] = useState([]);
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);
    const [selectedDeductFilterType, setSelectedDeductFilterType] = useState([]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const {
        allHooks,
        hookSettings,
    } = useSelector((state) => state.pointType);

    const selectedAwardHookIds = useMemo(() => {
        if (values?.requirements?.length > 0) {
            return values?.requirements.map(item => item?.action_type === 'award' && item?.trigger_key)
        }
    }, [values?.requirements]);

    const selectedDeductHookIds = useMemo(() => {
        if (values?.requirements?.length > 0) {
            return values?.requirements.map(item => item?.action_type === 'deduct' && item?.trigger_key);
        }
    }, [values?.requirements]);

    const hookCategoryIconMap = {
        wordpress: { icon: FaWordpressSimple, bg: "#21759b" },
        woocommerce: { icon: SiWoocommerce, bg: "#96588a" },
        gamify: { icon: FaGamepad, bg: "#006BFF" },
        interaction: { icon: AiFillInteraction, bg: "#ff5722" },
    };

    const getParamsFromSchema = (hook, type) => {
        const settings = hookSettings[`${type}_${hook.id}`] || {};
        const params = {};
        (hook.schema || []).forEach(f => { params[f.key] = settings[f.key] ?? f.default; });
        return params;
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const draggedId = active.id;
        const requirements = values?.requirements;

        // AWARD
        if (draggedId.startsWith("award_")) {
            const pureId = draggedId.replace("award_", "");
            const exists = requirements.some(
                r => r.trigger_key === pureId && r.action_type === "award"
            );

            if (over.id === "awards-sidebar") {
                if (exists) return;

                const hook = allHooks.find(h => h.id === pureId);
                if (!hook) return;

                const newHook = {
                    trigger_key: hook.id,
                    action_type: "award",
                    parameters: getParamsFromSchema(hook, "award"),
                };

                setFieldValue("requirements", [...requirements, newHook]);
                setOpenedAwardHooks([pureId]);
                return;
            }

            if (over.id === "awards-available") {
                if (!exists) return;

                setFieldValue(
                    "requirements",
                    requirements.filter(
                        r => !(r.trigger_key === pureId && r.action_type === "award")
                    )
                );
                return;
            }
        }

        // DEDUCT
        if (draggedId.startsWith("deduct_")) {
            const pureId = draggedId.replace("deduct_", "");
            const exists = requirements.some(
                r => r.trigger_key === pureId && r.action_type === "deduct"
            );

            if (over.id === "deducts-sidebar") {
                if (exists) return;

                const hook = allHooks.find(h => h.id === pureId);
                if (!hook) return;

                const newHook = {
                    trigger_key: hook.id,
                    action_type: "deduct",
                    parameters: getParamsFromSchema(hook, "deduct"),
                };

                setFieldValue("requirements", [...requirements, newHook]);
                return;
            }

            if (over.id === "deducts-available") {
                if (!exists) return;

                setFieldValue(
                    "requirements",
                    requirements.filter(
                        r => !(r.trigger_key === pureId && r.action_type === "deduct")
                    )
                );
                return;
            }
        }
    };

    const renderHookCard = (item, type) => {
        const slug = item?.integrationSlug || item?.category || 'wordpress';
        const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;

        return (
            <DraggableItem key={`${type}_${item?.id}`} id={`${type}_${item?.id}`}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Flex justify="space-between" align="center" padding="10px 16px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                        <Flex align="center" gap='8px'>
                            <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                                <Icon as={config.icon} boxSize={3} />
                            </Center>
                            <GFLabel type="title" fontWeight="400" label={item?.label} />
                        </Flex>

                        <Box bg={type === 'award' ? "#0CDC01" : "#FF3E2F"} borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={arrowForward} />
                        </Box>
                    </Flex>

                    <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
                </div>
            </DraggableItem>
        );
    };

    const hookTypeOptions = Array.from(
        new Set(allHooks.map(h => h.integrationSlug).filter(Boolean))).map(slug => ({
            label: slug.charAt(0).toUpperCase() + slug.slice(1),
            value: slug,
        }));

    return (
        <>
            <Flex gap="12px">
                <GamifyInput label={__("Point Name", "gamify")}>
                    <Input
                        placeholder={__("Enter point name", "gamify")}
                        value={values?.name}
                        onChange={e => {
                            const value = e.target.value
                            setFieldValue('name', value)
                        }}
                        {...commonInput}
                    />
                </GamifyInput>
            </Flex>

            {hooksLoading ? (
                <RequirementsLoader />
            ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <Requirements
                        label={__("Automatic Point Awards", "gamify")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPointAwards(!pointAwards)
                        }}
                        open={pointAwards}
                        parent="gamify-points-automatic-point-awards"
                        child="gamify-points-automatic-point-awards-wrap"
                        childLeft="gamify-points-automatic-point-awards-available-hooks"
                        childRight="gamify-points-automatic-point-awards-active-hooks"
                        hookTypeOptions={hookTypeOptions}
                        filterHookType={v => setSelectedFilterHookType(v.map(o => o.value))}
                        renderHookCard={renderHookCard}
                        allHooks={allHooks}
                        hookSettings={hookSettings}
                        openHookType={openedAwardHooks}
                        setOpenHookType={setOpenedAwardHooks}
                        selectedHookIds={selectedAwardHookIds}
                        actionName="award"
                        selectedFilterType={selectedFilterHookType}
                        scope="point_type"
                    />

                    <Requirements
                        label={__("Automatic Point Deductions", "gamify")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPointDeductions(!pointDeductions)
                        }}
                        open={pointDeductions}
                        parent="gamify-points-automatic-point-deductions"
                        child="gamify-points-automatic-point-deductions-wrap"
                        childLeft="gamify-points-automatic-point-deductions-available-hooks"
                        childRight="gamify-points-automatic-point-deductions-active-hooks"
                        hookTypeOptions={hookTypeOptions}
                        filterHookType={v => setSelectedDeductFilterType(v.map(o => o.value))}
                        renderHookCard={renderHookCard}
                        allHooks={allHooks}
                        hookSettings={hookSettings}
                        openHookType={openedDeductHooks}
                        setOpenHookType={setOpenedDeductHooks}
                        selectedHookIds={selectedDeductHookIds}
                        actionName="deduct"
                        selectedFilterType={selectedDeductFilterType}
                    />
                </DndContext>
            )}
        </>
    );
};

export default FormInner;
