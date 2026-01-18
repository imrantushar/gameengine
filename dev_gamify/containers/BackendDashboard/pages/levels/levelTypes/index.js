import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import TopBar from "@GFComponents/TopBar";
import {
    fetchLevelById, saveLevel, updateLevel, fetchLevelTriggers, fetchPointTypes
} from "@GFRedux/Slices/levelsSlice/levelsSlice.js";
import GamifyBox from "@GFComponents/GamifyBox";
import { Formik } from "formik";
import { getLevelsInitialValues } from "./helper";
import FormInner from "./FormInner";
import LevelsFormSkeleton from "./Components/LevelsFormSkeleton";
import { primaryBtn } from "../../../../../../assets/scss/chakra/recipe";


const LevelType = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const { levels } = useSelector(state => state.levels);

    const exitstignItem = levels.find(item => Number(item.id) === Number(editId));
    const [formLoading, setFormLoading] = useState(!exitstignItem);
    
    useEffect(() => {
        dispatch(fetchLevelTriggers('level'));
        dispatch(fetchPointTypes());
    }, []);
    
    useEffect(() => {
        (async() => {
            try {
                if (!editId) return;
                if (exitstignItem) return;
                setFormLoading(true);
                await dispatch(fetchLevelById(editId));
            } catch (error) {
                console.warn(error)
            } finally {
                setFormLoading(false);
            }
        })()
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
