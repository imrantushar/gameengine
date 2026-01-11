import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Flex,
    Icon,
    Spinner,
    Text,
    Tooltip,
    Center,
    VStack
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FaArrowRotateRight, FaChevronRight, FaGamepad, FaWordpressSimple, FaLock } from 'react-icons/fa6';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';
import Select from 'react-select';

// Components
import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';
import LabeledInput from '@GFComponents/LabeledInput';
import CustomCollapsible from '@GFComponents/Collapsible';
import Divider from '@GFComponents/Divider';

// Imports
import {
    setPointName,
    setPluralName,
    fetchTriggers,
    savePointType,
    updatePointType,
    fetchPointTypeById,
    resetPointTypeForm,
    addAwardHook,
    removeAwardHook,
    addDeductHook,
    removeDeductHook,
    updateHookSettings,
    fetchDynamicOptions
} from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import { primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { AiFillInteraction } from 'react-icons/ai';
import { SiWoocommerce } from "react-icons/si";
import { Formik } from 'formik';
import { getlPointtypesInitialValues } from './helper';
import FormInner from './FormInner';



// # MAIN COMPONENT
const PointTypeEditor = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');

    
    const [openedAwardHooks, setOpenedAwardHooks] = useState([]);
    const [openedDeductHooks, setOpenedDeductHooks] = useState([]);
    const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);
    const [selectedDeductFilterType, setSelectedDeductFilterType] = useState([]);

    const {
        name,
        pluralName,
        allHooks,
        hookSettings,
        selectedAwardHookIds,
        selectedDeductHookIds,
        saveStatus,
        currentPointTypeId,
        pointTypes
    } = useSelector((state) => state.pointType);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        dispatch(fetchTriggers('point_type'));
    }, []);

    useEffect(() => {
        if (editId) dispatch(fetchPointTypeById(editId));
        else dispatch(resetPointTypeForm());
    }, [editId]);

    // 🔥 Icons configuration
    const hookCategoryIconMap = {
        wordpress: { icon: FaWordpressSimple, bg: "#21759b" },
        woocommerce: { icon: SiWoocommerce, bg: "#96588a" },
        gamify: { icon: FaGamepad, bg: "#006BFF" },
        interaction: { icon: AiFillInteraction, bg: "#ff5722" },
    };

    const availableAwardHooks = allHooks.filter(hook => {
        if (selectedAwardHookIds.includes(hook.id)) return false;
        return (
            selectedFilterHookType.length === 0 ||
            selectedFilterHookType.includes(hook.integrationSlug)
        );
    });

    // console.log(availableAwardHooks, 'availableAwardHooks');
    const activeAwardHooks = selectedAwardHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const availableDeductHooks = allHooks.filter(hook => {
        if (selectedDeductHookIds.includes(hook.id)) return false;
        return (
            selectedDeductFilterType.length === 0 ||
            selectedDeductFilterType.includes(hook.integrationSlug)
        );
    });


    const activeDeductHooks = selectedDeductHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;
        const draggedId = active.id;
        if (draggedId.startsWith("award_")) {
            const pureId = draggedId.replace("award_", "");
            if (over.id === "awards-sidebar") { dispatch(addAwardHook(pureId)); setOpenedAwardHooks([pureId]); }
            else if (over.id === "awards-available") { dispatch(removeAwardHook(pureId)); }
        }
        if (draggedId.startsWith("deduct_")) {
            const pureId = draggedId.replace("deduct_", "");
            if (over.id === "deductions-sidebar") { dispatch(addDeductHook(pureId)); setOpenedDeductHooks([pureId]); }
            else if (over.id === "deductions-available") { dispatch(removeDeductHook(pureId)); }
        }
    };

    const handleSave = async () => {
        if (!name) return alert('Please enter a Point Name');
        const getParamsFromSchema = (hook, type) => {
            const settings = hookSettings[`${type}_${hook.id}`] || {};
            const params = {};
            (hook.schema || []).forEach(f => { params[f.key] = settings[f.key] ?? f.default; });
            return params;
        };
        const payload = {
            name, plural_name: pluralName,
            requirements: [
                ...activeAwardHooks.map(h => ({ trigger_key: h.id, action_type: 'award', parameters: getParamsFromSchema(h, 'award') })),
                ...activeDeductHooks.map(h => ({ trigger_key: h.id, action_type: 'deduct', parameters: getParamsFromSchema(h, 'deduct') }))
            ]
        };
        console.log({payload})
        const action = currentPointTypeId ? updatePointType({ id: currentPointTypeId, data: payload }) : savePointType(payload);
        const res = await dispatch(action);
        if (res.meta.requestStatus === 'fulfilled') navigate(`${route_path}admin.php?page=gamify-points`);
    };

    const hookTypeOptions = Array.from(
        new Set(allHooks.map(h => h.integrationSlug).filter(Boolean))
    ).map(slug => ({
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
        value: slug,
    }));


    // Helper function to render cards to maintain Figma design
    const renderHookCard = (item, type) => {
        const slug = item.integrationSlug || item.category || 'wordpress';
        const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
        //const config = hookCategoryIconMap[item.category] || { icon: FaWordpressSimple, bg: "gray.500" };
        return (
            <DraggableItem key={`${type}_${item.id}`} id={`${type}_${item.id}`}>
                <Box padding="12px" borderRadius="6px" border="1px solid var(--gamify-border-color)" bg="white">
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap='8px'>
                            <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                                <Icon as={config.icon} boxSize={3} />
                            </Center>
                            <Text margin="0" fontSize="1rem" fontWeight="600">{item.label}</Text>
                        </Flex>
                        <Box bg={type === 'award' ? "green.500" : "red.500"} borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                            <Icon as={FaArrowRotateRight} boxSize={3} />
                        </Box>
                    </Flex>
                </Box>
            </DraggableItem>
        );
    };

    return (
        <Formik
            enableReinitialize={true}
            initialValues={getlPointtypesInitialValues(editId, pointTypes)}
        >
            {(values) => {
                console.log({values})
                return (
                    <>
                        <TopBar leftContent={() => (
                            <>
                                <Box className="gamify-topbar-logo"><svg width="36" height="36" viewBox="0 0 36 36"><rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" /><path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" /></svg></Box>
                                <Icon as={FaChevronRight} mx={2} />
                                <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__("Game Engine", "gamify")} />
                            </>
                        )} 
                        rightContent={() => (
                            <Button {...primaryBtn} width='140px' onClick={handleSave} isLoading={saveStatus === 'saving'}>
                                {currentPointTypeId ? __('Update Point Type', 'gamify') : __('Save Point Type', 'gamify')}
                            </Button>
                        )} 
                        />

                        <Box width="1174px" margin="0 auto" pb="50px">
                            <Flex direction="column" bg="var(--gamify-background)" p={6} borderRadius="4px" boxShadow="var(--gamify-shadow)" gap={6}>
                                <FormInner />

                                <Flex py={6} justify='flex-end' borderTop='1px solid var(--gamify-border-color)'>
                                    <Button {...primaryBtn} width='140px' onClick={handleSave} isLoading={saveStatus === 'saving'}>
                                        {currentPointTypeId ? __('Update Point Type', 'gamify') : __('Save Point Type', 'gamify')}
                                    </Button>
                                </Flex>
                            </Flex>
                        </Box>
                    </>
                )
            }}
        </Formik>
    );
};

export default PointTypeEditor;