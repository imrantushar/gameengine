import { Box, Flex } from '@chakra-ui/react';
import { Formik } from 'formik';
import React, { useState } from 'react';
import SettingsHeader from './components/SettingsHeader';
import SettingsFooter from './components/SettingsFooter';
import DataPreview from './Steps/DataPreview';
import Addons from './Steps/Addons';
import { API, namespace } from '@GFUtils/helper';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [step, setStep] = useState('datapreview');
  const navigate = useNavigate();
  const onSubmitHandler = async (values, actions) => {
    actions.setSubmitting(true)
    try {
      const response = await API.post('/setup/complete', {
        ...values
      })
      if(response.status === 200) {
        navigate('/congratulation')
      }
      
    } catch (error) {
      console.error(error)
    } finally {
      actions.setSubmitting(false)
    }
  }
  return (
    <Flex
      width={'100%'}
      justifyContent={'center'}
    >
      <Formik
        enableReinitialize={true}
        initialValues={{
          preset: "author",
          addons: [],
          setup_completed: true
        }}
        onSubmit={onSubmitHandler}
      >
        {() => {
          return (
            <Box
              maxW={'676px'}
              width={'100%'}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              gap={'24px'}
              padding={'40px'}
              background={'#FFF'}
              border={'1px solid #F6F7F8'}
              borderRadius={'12px'}
            >
              {step === 'datapreview' && (
                <DataPreview />
              )}
              {step === 'addons' && (
                <Addons />
              )}
              <SettingsFooter 
                step={step}
                setStep={setStep}
              />
            </Box>
          )
        }}
      </Formik>
    </Flex>
  );
};

export default Settings;