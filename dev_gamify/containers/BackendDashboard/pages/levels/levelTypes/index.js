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
import { Formik } from "formik";
import { getLevelsInitialValues } from "./helper";
import FormInner from "./FormInner";
import LevelsFormSkeleton from "./Components/LevelsFormSkeleton";


const LevelType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const {
        levels, levelIcon, hookSettings
    } = useSelector(state => state.levels);

    const exitstignItem = levels.find(item => Number(item.id) === Number(editId));
    const [formLoading, setFormLoading] = useState(!exitstignItem);
    
    useEffect(() => {
        dispatch(fetchLevelTriggers('level'));
        dispatch(fetchPointTypes());
        dispatch(fetchLevels());
    }, []);
    
    useEffect(() => {
        if (exitstignItem) return;
        setFormLoading(true);
        dispatch(fetchLevelById(editId))
            .finally(() => {
                setFormLoading(false);
            });
    }, [editId, exitstignItem]);

    // useEffect(() => { 
    //     if (congratulationsMessage) setMessage(congratulationsMessage); 
    // }, [congratulationsMessage]);

    const onSubmiHandler = async (values, actions) => {
        if (!values?.title) return alert("Level Name is required");
        actions.setSubmitting(true)
        try {
            const res = editId ? await dispatch(updateLevel({ id: editId, data: values })) : await dispatch(saveLevel(values));
            // if (res.meta.requestStatus === 'fulfilled') navigate(`${route_path}admin.php?page=gamify-levels`);
        } catch (error) {
            console.warn(error)
        } finally {
            actions.setSubmitting(false)
        }
        
    };

    return (
        <>
            {formLoading ? (
                <LevelsFormSkeleton />
            ) : (
                <Formik
                    enableReinitialize={true}
                    initialValues={getLevelsInitialValues(editId, levels)}
                    onSubmit={onSubmiHandler}
                >
                    {({submitForm, isSubmitting, dirty}) => {
                        return (
                            <>
                                <TopBar
                                    path={__("Level Type", "gamify")}
                                    rightContent={
                                        <Button {...primaryBtn} onClick={submitForm} loading={isSubmitting} disabled={!dirty}>
                                            {editId ? __("Update", "gamify") : __("Save Changes", "gamify")}
                                        </Button>
                                    }
                                />

                                <GamifyBox dynamicClasses="gamify-levels" heading={__(`Level Type`, "gamify")}>
                                    <FormInner />
                                </GamifyBox>
                            </>
                        )
                    }}
                </Formik>
            )}
        </>
    );
};

export default LevelType;
