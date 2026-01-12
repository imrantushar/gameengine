import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Text, Switch, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import GFLabel from "@GFComponents/Labels/GFLabel";
import Select from "react-select";
import CustomCollapsible from "@GFComponents/Collapsible";
import TopBar from "@GFComponents/TopBar";
import { FaArrowRotateRight, FaGamepad, FaWordpressSimple, FaLock, FaChevronRight } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import LabeledInput from "@GFComponents/LabeledInput";
import GamifyEditor from "@GFComponents/editor";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import { GoPlus } from "react-icons/go";
import {
    fetchAchievementById, saveAchievement, updateAchievement, resetForm, fetchTriggers,
    fetchDynamicOptions, fetchPointTypes, fetchAchievements, setField, addHook, removeHook,
    updateHookSettings, addCategoryToList
} from "@GFRedux/Slices/achivementSlice/achievementsSlice";
import { commonInput, primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import { route_path } from "@GFUtils/helper";
import GamifyBox from "@GFComponents/GamifyBox";
import GamifyInput from "@GFComponents/GamifyInput";
import { getAchivementsInitialValues } from "./helper";
import { Formik } from "formik";
import FormInner from "./FormInner";

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


const AchievementTypesEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const [message, setMessage] = useState("");

    const {
        title, description, maxEarnings, allowUnlockWithPoints, pointsAmount, selectedPointTypeId,
        allHooks, category, selectedHookIds, hookSettings, availablePointTypes, saveStatus, congratulationsMessage, availableCategories = [], achievements
    } = useSelector(state => state.achievements);
    console.log({achievements})

    useEffect(() => {
        dispatch(fetchTriggers('achievement'));
        dispatch(fetchPointTypes());
        dispatch(fetchAchievements());
        if (editId) dispatch(fetchAchievementById(editId));
        else dispatch(resetForm());
    }, [dispatch, editId]);

    useEffect(() => { if (congratulationsMessage) setMessage(congratulationsMessage); }, [congratulationsMessage]);


    const handleSave = async () => {
        if (!title) return alert("Name is required");
        const payload = {
            title, description, category, max_earnings_per_user: maxEarnings,
            unlock_with_points_enabled: allowUnlockWithPoints,
            required_points_amount: pointsAmount, required_point_type_id: selectedPointTypeId,
            congratulations_message: message,
            requirements: activeHooks.map(h => ({
                trigger_key: h.id,
                parameters: Object.fromEntries((h.schema || []).map(f => [f.key, (hookSettings[h.id] || {})[f.key] ?? f.default]))
            }))
        };
        const result = editId ? await dispatch(updateAchievement({ id: editId, data: payload })) : await dispatch(saveAchievement(payload));
        if (result.meta.requestStatus === 'fulfilled') navigate(`${route_path}admin.php?page=gamify-achievements`);
    };

    // console.log({initial: getAchivementsInitialValues(editId, achievements), achievements})
    const onSubmitHandler =  (values,actions) => {
        actions.setSubmitting(true);
        if (!values?.title) return alert("Name is required");
        try {
            const action = editId ? dispatch(updateAchievement({ id: editId, data: values })) : dispatch(saveAchievement(values));
            const res = dispatch(action);
            if (res.meta.requestStatus === 'fulfilled') {
                actions.setSubmitting(false);
                // navigate(`${route_path}admin.php?page=gamify-points`);
            }
        } catch (error) {}
        finally {
            actions.setSubmitting(false);
        }
    }

    return (
            <>
                    {/* {formLoading ? (
                        <PointTypeFormSkeleton />
                    ) : (
                    )} */}
                        <Formik
                            enableReinitialize={true}
                            initialValues={getAchivementsInitialValues(editId, achievements)}
                            onSubmit={onSubmitHandler}
                        >
                            {({values, submitForm, isSubmitting}) => {
                                console.log({values})
                                return (
                                    <>
                                        <TopBar
                                            path={__("Achievement Types", "gamify")}
                                            rightContent={
                                                <Button {...primaryBtn} width='140px' onClick={submitForm} loading={isSubmitting}>
                                                    {editId ? __("Update", "gamify") : __("Save Changes", "gamify")}
                                                </Button>
                                            } 
                                        />
        
                                        <GamifyBox dynamicClasses="gamify-achievements" heading={__(`Achievement Types`, "gamify")}>
                                            <FormInner />
                                        </GamifyBox>
                                    </>
                                )
                            }}
                        </Formik>
                </>
    );
};

export default AchievementTypesEditor;
