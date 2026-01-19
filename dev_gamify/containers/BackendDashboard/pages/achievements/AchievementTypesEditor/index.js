import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import TopBar from "@GFComponents/TopBar";
import {
    fetchAchievementById, saveAchievement, updateAchievement, fetchTriggers, fetchPointTypes, fetchAchievements
} from "@GFRedux/Slices/achivementSlice/achievementsSlice";
import { primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import GamifyBox from "@GFComponents/GamifyBox";
import { getAchivementsInitialValues } from "./helper";
import { Formik } from "formik";
import FormInner from "./FormInner";
import AchievementFormLoader from "@GFComponents/GamifyLoader/AchievementFormSkeleton";
import { showNotification } from "@GFRedux/Slices/notificationSlice/notificationSlice";

const AchievementTypesEditor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const [message, setMessage] = useState("");
    const {congratulationsMessage, achievements} = useSelector(state => state.achievements);
    const exitstignItem = achievements.find(item => Number(item.id) === Number(editId));
    const [formLoading, setFormLoading] = useState(!exitstignItem);

    useEffect(() => {
        dispatch(fetchTriggers('achievement'));
        dispatch(fetchPointTypes());
        dispatch(fetchAchievements());
    }, []);

    useEffect(() => {
        if (exitstignItem) return;
        setFormLoading(true);
        dispatch(fetchAchievementById(editId))
            .finally(() => {
                setFormLoading(false);
            });
    }, [editId, exitstignItem]);

    useEffect(() => { if (congratulationsMessage) setMessage(congratulationsMessage); }, [congratulationsMessage]);

    const onSubmitHandler =  (values,actions) => {
        actions.setSubmitting(true);
        if (!values?.title) {
            dispatch(showNotification({
                message: __('Name is required!', 'gamify'),
                isShow: true,
                type: 'error',
            }))
            actions.setSubmitting(false);
            return;
        }
        try {
            const action = values?.id ? dispatch(updateAchievement({ id: values.id, data: values })) : dispatch(saveAchievement(values));
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
            {formLoading ? (
                <AchievementFormLoader />
            ) : (
                <Formik
                    enableReinitialize={true}
                    initialValues={getAchivementsInitialValues(editId, achievements)}
                    onSubmit={onSubmitHandler}
                >
                    {({ submitForm, isSubmitting}) => {
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
            )}
        </>
    );
};

export default AchievementTypesEditor;
