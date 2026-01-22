import { Box, Flex, Input, Textarea } from '@chakra-ui/react';
import BoxView from '@GFComponents/BoxView/BoxView';
import GFLabel from '@GFComponents/Labels/GFLabel';
import React from 'react';
import { __ } from '@wordpress/i18n';
import { capitalizeFirstLetter, getTermInitalValues } from './helper';
import { Formik } from 'formik';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import GamifyInput from '@GFComponents/GamifyInput';

const TypesForm = ({type=""}) => {
  const onSubmitHandler = (values, actions) => {
    // actions.setSubmitting(true)

    console.log({values})
  }
  return (
    <BoxView width='35%'>
      <GFLabel type='heading' label={__("Add New", "gamify") + " " +  capitalizeFirstLetter(type) + " " + __("Tpes", "gamify")}  />
      <Formik
        enableReinitialize={true}
        initialValues={getTermInitalValues()}
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
                    }}
                    {...commonInput}
                />
              </GamifyInput>
              <GamifyInput label={__("Slug", "gamify")}>
                <Input
                    placeholder={__("Enter slug", "gamify")}
                    value={values.name}
                    onChange={e => {
                        const value = e.target.value
                        setFieldValue('slug', value)
                    }}
                    {...commonInput}
                />
              </GamifyInput>
              <GamifyInput label={__("Parent", "gamify")}>
                <Input
                    placeholder={__("Select Parent", "gamify")}
                    value={values.parent}
                    onChange={e => {
                        const value = e.target.value
                        setFieldValue('description', value)
                    }}
                    {...commonInput}
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
            </Flex>
          )
        }}
      </Formik>
    </BoxView>
  );
};

export default TypesForm;