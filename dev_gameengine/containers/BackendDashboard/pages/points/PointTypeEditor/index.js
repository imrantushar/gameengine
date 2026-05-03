import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import Select from 'react-select';
import { fetchTriggers, savePointType, updatePointType, fetchPointTypeById } from '@GFRedux/Slices/pointTypesSlice/pointTypeSlice';
import Button from '@GFComponents/Button';
import { route_path, statusArray } from '@GFUtils/helper';
import { Formik } from 'formik';
import { getPointTypesInitialValues } from './helper';
import FormInner from './FormInner';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { PointsSystemLoader } from '@GFComponents/GameEngineLoader/PointsSystemLoader';

const PointTypeEditor = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('id');
  const {
    pointTypes,
    allHooks
  } = useSelector(state => state.pointType);
  const existingItem = pointTypes.find(item => String(item.id) === String(editId));
  const [formLoading, setFormLoading] = useState(!!editId && !existingItem);
  const [hooksLoading, setHooksLoading] = useState(allHooks.length === 0);

  useEffect(() => {
    if (editId && !existingItem) {
      setFormLoading(true);
      dispatch(fetchPointTypeById(editId)).finally(() => {
        setFormLoading(false);
      });
    }
  }, [editId, existingItem, dispatch]);

  useEffect(() => {
    if (allHooks.length === 0) {
      setHooksLoading(true);
      dispatch(fetchTriggers('point_type')).finally(() => {
        setHooksLoading(false);
      });
    }
  }, [allHooks.length, dispatch]);

  const onSubmitHandler = async (values, actions) => {
    actions.setSubmitting(true);
    try {
      if (editId) {
        const {
          payload
        } = await dispatch(updatePointType({
          id: editId,
          data: values
        }));
        actions.setValues(getPointTypesInitialValues(payload.id, [{
          ...values,
          id: payload.id
        }]));
      } else {
        const {
          payload
        } = await dispatch(savePointType(values));
        if (payload?.id) {
          navigate(`${route_path}admin.php?page=gameengine-points&action=edit&id=${payload.id}&path=name`, {
            replace: true
          });
          actions.setValues(getPointTypesInitialValues(payload.id, [{
            ...values,
            id: payload.id
          }]));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return <>
    {formLoading ? (
      <PointsSystemLoader />
    ) : (
      <Formik enableReinitialize={true} initialValues={getPointTypesInitialValues(editId, pointTypes)} onSubmit={onSubmitHandler}>
        {({
          values,
          setFieldValue,
          submitForm,
          isSubmitting,
          dirty
        }) => {
          return <>
            <TopBar path={__("Points System", "gameengine")} rightContent={<div className="flex gap-2.5">
              <Select
                className="gameengine-select gameengine-select--120"
                classNamePrefix="gameengine-select"
                options={statusArray}
                value={statusArray.find(item => item.value === values.status)}
                onChange={option => setFieldValue('status', option.value)}
              />

              <Button
                label={editId ? __('Update Point System', 'gameengine') : __('Create Point System', 'gameengine')}
                loadingLabel={editId ? __('Update Point System', 'gameengine') : __('Create Point System', 'gameengine')}
                isLoading={isSubmitting}
                isDisabled={!dirty || isSubmitting}
                onClick={submitForm}
              />
            </div>} />

            <GameEngineBox dynamicClasses="gameengine-points-system p-[24px_24px_0_24px_]" heading={__("Points System", "gameengine")}>
              <FormInner hooksLoading={hooksLoading} />
            </GameEngineBox>
          </>;
        }}
      </Formik>
    )}
  </>;
};

export default PointTypeEditor;
