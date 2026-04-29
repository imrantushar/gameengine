import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { __ } from "@wordpress/i18n";
import TopBar from "@GFComponents/TopBar";
import Select from 'react-select';
import { fetchAchievementById, createAchievement, updateAchievement, fetchTriggers, fetchPointTypes } from "@GFRedux/Slices/achivementSlice/achievementsSlice";
import { primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import GameEngineBox from "@GFComponents/GameEngineBox";
import { getAchivementsInitialValues } from "./helper";
import { Formik } from "formik";
import FormInner from "./FormInner";
import AchievementFormLoader from "@GFComponents/GameEngineLoader/AchievementFormSkeleton";
import { showNotification } from "@GFRedux/Slices/notificationSlice/notificationSlice";
import { route_path, statusArray } from "@GFUtils/helper";
const AchievementTypesEditor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const [message, setMessage] = useState("");
  const {
    congratulationsMessage,
    achievements
  } = useSelector(state => state.achievements);
  const exitstignItem = achievements.find(item => Number(item.id) === Number(editId));
  const [formLoading, setFormLoading] = useState(!exitstignItem && editId);
  useEffect(() => {
    dispatch(fetchTriggers('achievement'));
    dispatch(fetchPointTypes());
  }, []);
  useEffect(() => {
    if (!editId) return;
    if (exitstignItem) return;
    setFormLoading(true);
    dispatch(fetchAchievementById(editId)).finally(() => {
      setFormLoading(false);
    });
  }, [editId, exitstignItem]);
  useEffect(() => {
    if (congratulationsMessage) setMessage(congratulationsMessage);
  }, [congratulationsMessage]);
  const onSubmitHandler = async (values, actions) => {
    actions.setSubmitting(true);
    if (!values?.title) {
      dispatch(showNotification({
        message: __('Name is required!', 'gameengine'),
        isShow: true,
        type: 'error'
      }));
      actions.setSubmitting(false);
      return;
    }
    try {
      if (editId) {
        const {
          payload
        } = await dispatch(updateAchievement({
          id: editId,
          data: values
        }));
        actions.setValues(getAchivementsInitialValues(payload.id, [payload]));
      } else {
        const {
          payload
        } = await dispatch(createAchievement(values));
        if (payload.id) {
          navigate(`${route_path}admin.php?page=gameengine-achievements&action=edit&id=${payload.id}&path=achievemenxts-type`);
          actions.setValues(getAchivementsInitialValues(payload.id, [payload]));
        }
      }
    } catch (error) { } finally {
      actions.setSubmitting(false);
    }
  };
  return <>
    {formLoading ? <AchievementFormLoader /> : <Formik enableReinitialize={true} initialValues={getAchivementsInitialValues(editId, achievements)} onSubmit={onSubmitHandler}>
      {({
        values,
        setFieldValue,
        submitForm,
        isSubmitting,
        dirty
      }) => {
        return <>
          <TopBar path={__("Achievement Types", "gameengine")} rightContent={<div className="flex gap-2.5">
            <Select className="gameengine-select gameengine-select--120" classNamePrefix="gameengine-select" options={statusArray} value={statusArray.find(item => item.value === values.status)} onChange={option => setFieldValue('status', option.value)} />
            <button style={primaryBtn} onClick={submitForm} disabled={!dirty}>
              {editId ? __("Update", "gameengine") : __("Create", "gameengine")}
            </button>
          </div>} />

          <GameEngineBox dynamicClasses="gameengine-achievements" heading={__(`Achievement`, "gameengine")}>
            <FormInner />
          </GameEngineBox>
        </>;
      }}
    </Formik>}
  </>;
};
export default AchievementTypesEditor;