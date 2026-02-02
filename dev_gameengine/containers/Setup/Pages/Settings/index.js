import { Box, Flex } from '@chakra-ui/react';
import { Formik } from 'formik';
import React from 'react';
import SettingsHeader from './components/SettingsHeader';
import SettingsFooter from './components/SettingsFooter';
import DataPreview from './Steps/DataPreview';
import Addons from './Steps/Addons';

const Settings = () => {
  const onSubmitHandler = (values, actions) => {
    console.log({values})
  }
  return (
    <Flex
      width={'100%'}
      justifyContent={'center'}
    >
      <Formik
        enableReinitialize={true}
        initialValues={{}}
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
              {/* <DataPreview /> */}
              <Addons />
              <SettingsFooter />
            </Box>
          )
        }}
      </Formik>
    </Flex>
  );
};

export default Settings;