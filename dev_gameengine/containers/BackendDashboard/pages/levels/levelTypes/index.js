import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { __ } from "@wordpress/i18n";
import TopBar from "@GFComponents/TopBar";
import Select from 'react-select';
import { fetchLevelById, createLevel, updateLevel, fetchLevelTriggers, fetchPointTypes } from "@GFRedux/Slices/levelsSlice/levelsSlice.js";
import GameEngineBox from "@GFComponents/GameEngineBox";
import { Formik } from "formik";
import { getLevelsInitialValues } from "./helper";
import FormInner from "./FormInner";
import LevelsFormSkeleton from "@GFComponents/GameEngineLoader/LevelsFormSkeleton";
import Button from '@GFComponents/Button';
import { route_path, statusArray } from "@GFUtils/helper";
import { showNotification } from "@GFRedux/Slices/notificationSlice/notificationSlice";

const LevelType = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const {
    levels
  } = useSelector(state => state.levels);
  const exitstignItem = levels.find(item => Number(item.id) === Number(editId));
  const [formLoading, setFormLoading] = useState(!exitstignItem);
  useEffect(() => {
    dispatch(fetchLevelTriggers('level'));
    dispatch(fetchPointTypes());
  }, []);
  useEffect(() => {
    (async () => {
      try {
        if (!editId) return;
        if (exitstignItem) return;
        setFormLoading(true);
        await dispatch(fetchLevelById(editId));
      } catch (error) {
        console.warn(error);
      } finally {
        setFormLoading(false);
      }
    })();
  }, [editId, exitstignItem]);
  const onSubmiHandler = async (values, actions) => {
    if (!values?.title) {
      dispatch(showNotification({
        message: __('Level Name is required.', 'gameengine'),
        isShow: true,
        type: 'error'
      }));
      actions.setSubmitting(false);
      return;
    }
    actions.setSubmitting(true);
    try {
      if (editId) {
        const {
          payload
        } = await dispatch(updateLevel({
          id: editId,
          payload: values
        }));
        actions.setValues(getLevelsInitialValues(payload?.id, [payload]));
      } else {
        const {
          payload
        } = await dispatch(createLevel(values));
        if (payload?.id) {
          navigate(`${route_path}admin.php?page=gameengine-levels&path=levels-types&id=${payload?.id}`);
          actions.setValues(getLevelsInitialValues(payload?.id, [payload]));
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      actions.setSubmitting(false);
    }
  };
  return <>
    {formLoading ? <LevelsFormSkeleton /> : <Formik enableReinitialize={true} initialValues={getLevelsInitialValues(editId, levels)} onSubmit={onSubmiHandler}>
      {({
        values,
        setFieldValue,
        submitForm,
        isSubmitting,
        dirty
      }) => {
        return <>
          <TopBar
            path={__("Level Type", "gameengine")}
            hasBreadCrumb={true}
            items={[
              { label: __('Levels', 'gameengine'), href: `${route_path}admin.php?page=gameengine-levels` },
              { label: values?.title ?? __('N/A', 'gameengine') }
            ]}
            rightContent={<div className="flex gap-2.5">
            <Select className="gameengine-select gameengine-select--120" classNamePrefix="gameengine-select" options={statusArray} value={statusArray.find(item => item.value === values.status)} onChange={option => setFieldValue('status', option.value)} />

            <Button
              label={editId ? __("Update", "gameengine") : __("Create", "gameengine")}
              loadingLabel={editId ? __("Update", "gameengine") : __("Create", "gameengine")}
              isLoading={isSubmitting}
              isDisabled={!dirty || isSubmitting}
              onClick={submitForm}
            />
          </div>} />

          <GameEngineBox dynamicClasses="gameengine-levels" heading={__(`Level Type`, "gameengine")}>
            <FormInner />
          </GameEngineBox>
        </>;
      }}
    </Formik>}
  </>;
};
export default LevelType;