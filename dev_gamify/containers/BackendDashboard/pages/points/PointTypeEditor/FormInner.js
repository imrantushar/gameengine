import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Flex, Icon, Text, Center, Input} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FaArrowRotateRight, FaGamepad, FaWordpressSimple } from 'react-icons/fa6';
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable} from '@dnd-kit/core';
import Select from 'react-select';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { AiFillInteraction } from 'react-icons/ai';
import { SiWoocommerce } from "react-icons/si";
import { useFormikContext } from 'formik';
import HookConfigurationForm from './components/HookConfigurationForm';
import GamifyInput from '@GFComponents/GamifyInput';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import { HookSkeleton } from '@GFComponents/GamifyLoader/PointsSystemLoader';

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
        <Box ref={setNodeRef} {...listeners} {...attributes} style={style} marginBottom="24px">
            {children}
        </Box>
    );
};

// # DROPPABLE
const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
        <Box ref={setNodeRef} borderRadius="4px" height='100%' transition="all 0.2s">
            {children}
        </Box>
    );
};

const FormInner = ({ hooksLoading }) => {
    const { values, setFieldValue } = useFormikContext();
    const [pointAwards, setPointAwards] = useState(true);
    const [pointDeductions, setPointDeductions] = useState(false);
    const [openedAwardHooks, setOpenedAwardHooks] = useState([]);
    const [openedDeductHooks, setOpenedDeductHooks] = useState([]);
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);
    const [selectedDeductFilterType, setSelectedDeductFilterType] = useState([]);

    const dispatch = useDispatch();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const {
        allHooks,
        hookSettings,
    } = useSelector((state) => state.pointType);

    const selectedAwardHookIds = useMemo(() => {
        if (values.requirements.length > 0) {
            return values.requirements.map(item => item.action_type === 'award' && item.trigger_key)
        }
    }, [values?.requirements]);

    const selectedDeductHookIds = useMemo(() => {
        if (values.requirements.length > 0) {
            return values.requirements.map(item => item.action_type === 'deduct' && item.trigger_key);
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
        const requirements = values.requirements;

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

            if (over.id === "deductions-sidebar") {
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

            if (over.id === "deductions-available") {
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
        const slug = item.integrationSlug || item.category || 'wordpress';
        const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
        //const config = hookCategoryIconMap[item.category] || { icon: FaWordpressSimple, bg: "gray.500" };
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

                        <Box bg={type === 'award' ? "green.500" : "red.500"} borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={FaArrowRotateRight} boxSize={3} />
                        </Box>
                    </Flex>

                    <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
                </div>
            </DraggableItem>
        );
    };

    const hookTypeOptions = Array.from(
        new Set(allHooks.map(h => h.integrationSlug).filter(Boolean))
    ).map(slug => ({
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
        value: slug,
    }));

    return (
        <>
            <Flex gap="12px">
                <GamifyInput label={__("Point Name", "gamify")} width="calc(50% - 6px)">
                    <Input
                        placeholder={__("Enter point name", "gamify")}
                        value={values.name}
                        onChange={e => {
                            const value = e.target.value
                            setFieldValue('name', value)
                            setFieldValue('plural_name', value)
                        }}
                        onBlur={() => {
                            setFieldValue('plural_name', values.name)
                        }}
                        {...commonInput}
                    />
                </GamifyInput>

                <GamifyInput label={__("Plural Name", "gamify")} width="calc(50% - 6px)">
                    <Input
                        placeholder={__("Enter point name", "gamify")}
                        value={values.plural_name}
                        {...commonInput}
                    />
                </GamifyInput>
            </Flex>

            {hooksLoading ? (
                <HookSkeleton />
            ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <CollapsibleItem
                        label={__("Automatic Point Awards", "gamify")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPointAwards(!pointAwards)
                        }}
                        open={pointAwards}
                        dynamicClasses="gamify-points-automatic-point-awards"
                    >
                        {pointAwards && (
                            <Flex gap="24px" mt={6} width="100%" className="gamify-points-automatic-point-awards-wrap">
                                <Flex className="gamify-points-automatic-point-awards-available-hooks" width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px">
                                    <Flex direction="column" gap="4px">
                                        <GFLabel type="plainHeading" margin={0} label={__("Available Hooks", "gamify")} />
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
                                                placeholder={__("Select hook type", "gamify")}
                                                onChange={v => setSelectedFilterHookType(v.map(o => o.value))}
                                            />
                                        </GamifyInput>
                                    </Box>

                                    <DroppableArea id="awards-available">
                                        {allHooks
                                            .filter(item => !selectedAwardHookIds?.includes(item.id))
                                            .map(h => (
                                                <Box key={h.id}>
                                                    {renderHookCard(h, 'award')}
                                                    <Text fontSize="xs" color="gray.500" mt={1}>{h.subTitle}</Text>
                                                </Box>
                                            ))}
                                    </DroppableArea>
                                </Flex>

                                <Box className="gamify-points-automatic-point-awards-active-hooks" width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)">
                                    <Flex direction="column" gap="4px" mb={6}>
                                        <GFLabel type="plainHeading" margin={0} label={__("Active Hooks", "gamify")} />
                                        <GFLabel
                                            type="subtitle"
                                            color="var(--gamify-font-color)"
                                            label={__("The following hooks are used for all users", "gamify")}
                                        />
                                    </Flex>

                                    <DroppableArea id="awards-sidebar">
                                        {selectedAwardHookIds && selectedAwardHookIds
                                            .map(id => allHooks?.find(h => h.id === id))
                                            .filter(Boolean)
                                            .map(h => (
                                                <DraggableItem key={`award_${h.id}`} id={`award_${h.id}`}>
                                                    <HookConfigurationForm
                                                        hookId={h.id}
                                                        type="award"
                                                        hookInfo={h}
                                                        dispatch={dispatch}
                                                        currentSettings={hookSettings[`award_${h.id}`]}
                                                        isOpen={openedAwardHooks.includes(h.id)}
                                                        setIsOpen={v =>
                                                            setOpenedAwardHooks(
                                                                v ? [...openedAwardHooks, h.id] : openedAwardHooks.filter(i => i !== h.id)
                                                            )
                                                        }
                                                    />
                                                </DraggableItem>
                                            ))
                                        }
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        )}
                    </CollapsibleItem>

                    <CollapsibleItem
                        label={__("Automatic Point Deductions", "gamify")}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPointDeductions(!pointDeductions)
                        }}
                        open={pointDeductions}
                        dynamicClasses="gamify-points-automatic-point-deductions"
                    >
                        {pointDeductions && (
                            <Flex gap="24px" mt={6} width="100%" className="gamify-points-automatic-point-deductions-wrap">
                                <Flex className="gamify-points-automatic-point-deductions-available-hooks" width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px">
                                    <Flex direction="column" gap="4px">
                                        <GFLabel type="plainHeading" margin={0} label={__("Available Hooks", "gamify")} />
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
                                                placeholder={__("Select hook type", "gamify")}
                                                onChange={v => setSelectedDeductFilterType(v.map(o => o.value))}
                                            />
                                        </GamifyInput>
                                    </Box>

                                    <DroppableArea id="deductions-available">
                                        {allHooks.filter(item => !selectedDeductHookIds?.includes(item.id)).map(h => (
                                            <Box key={h.id}>
                                                {renderHookCard(h, 'deduct')}
                                                <Text fontSize="xs" color="gray.500" mt={1}>{h.subTitle}</Text>
                                            </Box>
                                        ))}
                                    </DroppableArea>
                                </Flex>

                                <Box className="gamify-points-automatic-point-deductions-active-hooks" width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)">
                                    <Flex direction="column" gap="4px" mb={6}>
                                        <GFLabel type="plainHeading" margin={0} label={__("Active Hooks", "gamify")} />
                                        <GFLabel
                                            type="subtitle"
                                            color="var(--gamify-font-color)"
                                            label={__("The following hooks are used for all users", "gamify")}
                                        />
                                    </Flex>

                                    <DroppableArea id="deductions-sidebar">
                                        {selectedDeductHookIds && selectedDeductHookIds
                                            .map(id => allHooks?.find(h => h.id === id))
                                            .filter(Boolean)
                                            .map(h => (
                                                <DraggableItem key={`deduct_${h.id}`} id={`deduct_${h.id}`}>
                                                    <HookConfigurationForm
                                                        hookId={h.id}
                                                        type="deduct"
                                                        hookInfo={h}
                                                        dispatch={dispatch}
                                                        currentSettings={hookSettings[`deduct_${h.id}`]}
                                                        isOpen={openedDeductHooks.includes(h.id)}
                                                        setIsOpen={v =>
                                                            setOpenedDeductHooks(
                                                                v ? [...openedDeductHooks, h.id] : openedDeductHooks.filter(i => i !== h.id)
                                                            )
                                                        }
                                                    />
                                                </DraggableItem>
                                            )
                                            )}
                                    </DroppableArea>
                                </Box>
                            </Flex>
                        )}
                    </CollapsibleItem>
                </DndContext>
            )}
        </>
    );
};

export default FormInner;
