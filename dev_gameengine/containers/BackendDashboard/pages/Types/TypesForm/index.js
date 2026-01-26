import React, { useState } from 'react';
import { Box, Button, Flex, Input, Textarea } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import { capitalizeFirstLetter, getTermInitalValues } from './helper';
import { Formik } from 'formik';
import { commonInput, primaryBtn, removeBtn } from '../../../../../../assets/scss/chakra/recipe';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { useDispatch } from 'react-redux';
import { createAchievementType, updateAchievementType } from '@GFRedux/Slices/achivementSlice/types';
import { createLevelType, updateLevelType } from '@GFRedux/Slices/levelsSlice/types';
import Select from "react-select";
import { API, generateSlug, namespace } from '@GFUtils/helper';

const TypesForm = ({ type = "", resetForm, formData }) => {
  const dispatch = useDispatch();
  const [typesData, setTypesData] = useState([]);

  const fetchTypes = async (searchKey = "") => {
    if (searchKey) searchKey = "&search=" + searchKey;
    try {
      const url = namespace + 'taxonomies/' + type + '_type?page=1&per_page=100' + searchKey;
      const response = await API.get(url);
      const selectData = response.data.map(item => {
        return { label: item.name, value: `${item.id}` }
      })
      setTypesData(selectData)
    } catch (error) {
      console.warn(error)
    }
  }

  const onSubmitHandler = (values, actions) => {
    actions.setSubmitting(true)
    if (!values.name) {
      dispatch(showNotification({
        message: __('Name is required!', 'gameengine'),
        isShow: true,
        type: 'error',
      }))
      actions.setSubmitting(false)
      return;
    }

    try {
      if (type === "achievement") {
        if (formData?.id) {
          dispatch(updateAchievementType({ id: formData?.id, data: values }))
        } else {
          dispatch(createAchievementType(values))
        }
      }
      if (type === "level") {
        if (formData?.id) {
          dispatch(updateLevelType({ id: formData?.id, data: values }))
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
    <Box
      position="sticky"
      top="132px"
      alignSelf="flex-start"
      width="30%"
      border="1px solid var(--gemboards-border-color)"
      borderRadius="4px"
      bg="#fff"
      p="16px"
    >
      <GFLabel
        type='heading'
        label={
          !formData?.id ? __("Add New", "gameengine") : __("Update", "gameengine")
            + " "
            + capitalizeFirstLetter(type)
            + " "
            + __("Types", "gameengine")
        }
      />

      <Formik
        enableReinitialize={true}
        initialValues={getTermInitalValues(formData)}
        onSubmit={onSubmitHandler}
      >
        {({ values, submitForm, isSubmitting, dirty, setFieldValue }) => {
          return (
            <Flex
              direction={'column'}
              gap={'24px'}
            >
              <GameEngineInput label={__("Name", "gameengine")}>
                <Input
                  placeholder={__("Enter name", "gameengine")}
                  value={values.name}
                  onChange={e => {
                    const value = e.target.value
                    setFieldValue('name', value)
                    setFieldValue('slug', generateSlug(value))
                  }}
                  {...commonInput}
                />
              </GameEngineInput>
              <GameEngineInput label={__("Slug", "gameengine")}>
                <Input
                  placeholder={__("Enter slug", "gameengine")}
                  value={values.slug}
                  onChange={e => {
                    const value = e.target.value
                    setFieldValue('slug', value)
                  }}
                  {...commonInput}
                />
              </GameEngineInput>
              <GameEngineInput label={__("Parent", "gameengine")}>
                <Select
                  className="gameengine-select"
                  classNamePrefix="gameengine-select"
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
              </GameEngineInput>
              <GameEngineInput label={__("Description", "gameengine")}>
                <Textarea
                  placeholder={__("Enter description", "gameengine")}
                  value={values.description}
                  onChange={e => {
                    const value = e.target.value
                    setFieldValue('description', value)
                  }}
                  {...commonInput}
                  minH={'140px'}
                  padding={'12px 16px'}
                />
              </GameEngineInput>
              <Flex marginLeft={'auto'} gap={'10px'}>
                {formData?.id && (
                  <Button
                    {...removeBtn}
                    onClick={resetForm}
                  >
                    {__("Cancel", "gameengine")}
                  </Button>
                )}

                <Button
                  {...primaryBtn}
                  loading={isSubmitting}
                  disabled={!dirty}
                  onClick={submitForm}
                >
                  {!formData?.id ? __("Create", "gameengine") : __("Update", "gameengine")}
                </Button>
              </Flex>
            </Flex>
          )
        }}
      </Formik>
    </Box>
  );
};

export default TypesForm;
