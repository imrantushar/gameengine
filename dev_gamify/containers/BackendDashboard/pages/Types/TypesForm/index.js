import { Box } from '@chakra-ui/react';
import BoxView from '@GFComponents/BoxView/BoxView';
import GFLabel from '@GFComponents/Labels/GFLabel';
import React from 'react';
import { __ } from '@wordpress/i18n';
import { capitalizeFirstLetter, getTermInitalValues } from './helper';
import { Formik } from 'formik';

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

        }}
      </Formik>
    </BoxView>
  );
};

export default TypesForm;