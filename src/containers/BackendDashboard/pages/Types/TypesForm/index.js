import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { capitalizeFirstLetter, getTermInitalValues } from './helper';
import { Formik } from 'formik';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { useDispatch } from 'react-redux';
import { createAchievementType, updateAchievementType } from '@GFRedux/Slices/achivementSlice/types';
import { createLevelType, updateLevelType } from '@GFRedux/Slices/levelsSlice/types';
import Select from "react-select";
import { API, generateSlug, namespace } from '@GFUtils/helper';
import Button from '@GFComponents/Button';

const TypesForm = ({
  type = "",
  resetForm,
  formData
}) => {
  const dispatch = useDispatch();
  const [typesData, setTypesData] = useState([]);
  const fetchTypes = async (searchKey = "") => {
    if (searchKey) searchKey = "&search=" + searchKey;
    try {
      const url = namespace + 'taxonomies/gameengine_' + type + '_type?page=1&per_page=100' + searchKey;
      const response = await API.get(url);
      const selectData = response.data.map(item => {
        return {
          label: item.name,
          value: `${item.id}`
        };
      });
      setTypesData(selectData);
    } catch (error) {
      console.warn(error);
    }
  };

  const onSubmitHandler = (values, actions) => {
    actions.setSubmitting(true);
    if (!values.name) {
      dispatch(showNotification({
        message: __('Name is required!', 'gameengine'),
        isShow: true,
        type: 'error'
      }));
      actions.setSubmitting(false);
      return;
    }
    try {
      if (type === "achievement") {
        if (formData?.id) {
          dispatch(updateAchievementType({
            id: formData?.id,
            data: values
          }));
        } else {
          dispatch(createAchievementType(values));
        }
      }
      if (type === "level") {
        if (formData?.id) {
          dispatch(updateLevelType({
            id: formData?.id,
            data: values
          }));
        } else {
          dispatch(createLevelType(values));
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      actions.setSubmitting(false);
      actions.resetForm();
      resetForm();
    }
  };

  return (
    <div className="sticky rounded bg-white p-6 [border:1px_solid_var(--gemboards-border-color)]" style={{ "top": "132px", "alignSelf": "flex-start", "width": "30%" }}>
      <p className='gameengine-heading'>{!formData?.id ? __("Add New", "gameengine") : __("Update", "gameengine") + " " + capitalizeFirstLetter(type) + " " + __("Types", "gameengine")}</p>
      
      <Formik enableReinitialize={true} initialValues={getTermInitalValues(formData)} onSubmit={onSubmitHandler}>
        {({ values, submitForm, isSubmitting, dirty, setFieldValue }) => {
          return (
            <div className="flex flex-col gap-6">
              <GameEngineInput label={__("Name", "gameengine")}>
                <input
                  className='gameengine-input'
                  placeholder={__("Enter name", "gameengine")}
                  value={values.name}
                  onChange={e => {
                    const value = e.target.value;
                    setFieldValue('name', value);
                    setFieldValue('slug', generateSlug(value));
                  }}
                />
              </GameEngineInput>

              <GameEngineInput label={__("Slug", "gameengine")}>
                <input
                  className='gameengine-input'
                  placeholder={__("Enter slug", "gameengine")}
                  value={values.slug}
                  onChange={e => {
                    const value = e.target.value;
                    setFieldValue('slug', value);
                  }}
                />
              </GameEngineInput>

              <GameEngineInput label={__("Parent", "gameengine")}>
                <Select
                  className="gameengine-select"
                  classNamePrefix="gameengine-select"
                  options={typesData}
                  onInputChange={inputValue => {
                    fetchTypes(inputValue);
                    return inputValue;
                  }}
                  value={typesData?.find(opt => Number(opt.value) === Number(values?.parent)) || null}
                  onMenuOpen={fetchTypes}
                  onChange={option => {
                    setFieldValue('parent', option.value);
                  }}
                  menuPlacement="bottom"
                />
              </GameEngineInput>

              <GameEngineInput label={__("Description", "gameengine")}>
                <textarea
                  className='gameengine-input min-h-[140px] p-[8px_12px]'
                  placeholder={__("Enter description", "gameengine")}
                  value={values.description}
                  onChange={e => {
                    const value = e.target.value;
                    setFieldValue('description', value);
                  }}
                />
              </GameEngineInput>

              <div className="flex gap-2.5" marginLeft={'auto'}>
                {formData?.id && <button className='gameengine-close-btn' onClick={resetForm}>
                  {__("Cancel", "gameengine")}
                </button>}

                <Button
                  label={!formData?.id ? __("Create", "gameengine") : __("Update", "gameengine")}
                  isLoading={isSubmitting}
                  isDisabled={!dirty || isSubmitting}
                  onClick={submitForm}
                />
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default TypesForm;
