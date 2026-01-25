import { Box, Button, Flex, Input, Textarea } from '@chakra-ui/react';
import BoxView from '@GFComponents/BoxView/BoxView';
import GFLabel from '@GFComponents/Labels/GFLabel';
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { capitalizeFirstLetter, getTermInitalValues } from './helper';
import { Formik } from 'formik';
import { commonInput, primaryBtn, removeBtn } from '../../../../../../assets/scss/chakra/recipe';
import GamifyInput from '@GFComponents/GamifyInput';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { useDispatch, useSelector } from 'react-redux';
import { createAchievementType, updateAchievementType } from '@GFRedux/Slices/achivementSlice/types';
import { createLevelType, updateLevelType } from '@GFRedux/Slices/levelsSlice/types';
import Select from "react-select";
import { API, generateSlug, namespace } from '@GFUtils/helper';

const TypesForm = ({type="", resetForm, formData}) => {
  const dispatch = useDispatch();
  const [typesData, setTypesData] = useState([]);

  const fetchTypes = async (searchKey="") => {
    if(searchKey) searchKey = "&search=" + searchKey;
    try {
      const url = namespace + 'taxonomies/'+type+'_type?page=1&per_page=100'+ searchKey;
      const response = await API.get(url);
      const selectData = response.data.map(item => {
          return {label: item.name, value: `${item.id}`}
      })
      setTypesData(selectData)
    } catch (error) {
      console.warn(error)
    }
  }

  const onSubmitHandler = (values, actions) => {
    actions.setSubmitting(true)
    if(!values.name) {
      dispatch(showNotification({
        message: __('Name is required!', 'gamify'),
        isShow: true,
        type: 'error',
      }))
      actions.setSubmitting(false)
      return;
    }
    
    try {
      if(type === "achievement") {
        if(formData?.id) {
          dispatch(updateAchievementType({id: formData?.id, data: values}))
        } else {
          dispatch(createAchievementType(values))
        }
      }
      if(type === "level") {
        if(formData?.id) {
          dispatch(updateLevelType({id: formData?.id, data: values}))
        } else {
          dispatch(createLevelType(values))
        }

      }
    } catch (error) {
      console.warn(error)
    } finally {
      actions.setSubmitting(true)
      actions.resetForm()
      resetForm();
    }
  }

  return (
    <BoxView width='35%'>
      <GFLabel 
        type='heading' 
        label={
          !formData?.id ? __("Add New", "gamify") : __("Update", "gamify") 
          + " " 
          +  capitalizeFirstLetter(type) 
          + " " 
          + __("Types", "gamify")
        }
      />
      <Formik
        enableReinitialize={true}
        initialValues={getTermInitalValues(formData)}
        onSubmit={onSubmitHandler}
      >
        {({values, submitForm, isSubmitting, dirty, setFieldValue}) => {
          return (
            <Flex
              direction={'column'}
              gap={'24px'}
            >
              <GamifyInput label={__("Name", "gamify")}>
                <Input
                    placeholder={__("Enter name", "gamify")}
                    value={values.name}
                    onChange={e => {
                        const value = e.target.value
                        setFieldValue('name', value)
                        setFieldValue('slug', generateSlug(value))
                    }}
                    {...commonInput}
                />
              </GamifyInput>
              <GamifyInput label={__("Slug", "gamify")}>
                <Input
                    placeholder={__("Enter slug", "gamify")}
                    value={values.slug}
                    onChange={e => {
                        const value = e.target.value
                        setFieldValue('slug', value)
                    }}
                    {...commonInput}
                />
              </GamifyInput>
              <GamifyInput label={__("Parent", "gamify")}>
                <Select
                    className="gamify-select"
                    classNamePrefix="gamify-select"
                    options={typesData}
                    onInputChange={(inputValue) => {
                        fetchTypes(inputValue);
                        return inputValue;
                    }}
                    value={
                        typesData?.find(
                        opt => Number(opt.value) === Number(values?.parent)
                        ) || null
                    }
                    onMenuOpen={fetchTypes}
                    onChange={option => {
                        setFieldValue('parent', option.value)
                    }}
                    menuPlacement="bottom"
                />
              </GamifyInput>
              <GamifyInput label={__("Description", "gamify")}>
                <Textarea
                    placeholder={__("Enter description", "gamify")}
                    value={values.description}
                    onChange={e => {
                        const value = e.target.value
                        setFieldValue('description', value)
                    }}
                    {...commonInput}
                    minH={'140px'}
                    padding={'12px 16px'}
                />
              </GamifyInput>
              <Flex marginLeft={'auto'} gap={'10px'}>
                {formData?.id && (
                  <Button
                    {...removeBtn}
                    onClick={resetForm}
                  >
                    {__("Cancel", "gamify")}
                  </Button>
                )}

                <Button
                  {...primaryBtn}
                  loading={isSubmitting}
                  disabled={!dirty}
                  onClick={submitForm}
                >
                  {!formData?.id ? __("Create", "gamify") : __("Update", "gamify")}
                </Button>
              </Flex>
            </Flex>
          )
        }}
      </Formik>
    </BoxView>
  );
};

export default TypesForm;