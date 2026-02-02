import { Button, Flex, Icon } from '@chakra-ui/react';
import React from 'react';
import { clearBtn, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { __ } from '@wordpress/i18n';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { useFormikContext } from 'formik';

const SettingsFooter = ({step,setStep}) => {
  const {submitForm, isSubmitting} = useFormikContext();
  return (
    <Flex
      width={'100%'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      <Button
        {...clearBtn}
        fontSize={'14px'}
        fontWeight={'500'}
        lineHeight={'20px'}
        onClick={() => {
          if(step === "addons") {
            setStep('datapreview')
          } 
        }}
        disabled={step === 'datapreview'}
      >
        <Icon as={FaAngleLeft} width={'10px'}/>
        {__("Back", "gameengine")}
      </Button>
      <Button
        {...primaryBtn}
        onClick={() => {
          if(step === "datapreview") {
            setStep('addons')
          } else {
            submitForm();
          }
        }}
        loading={isSubmitting}
      >
        {__("Continue", "gameengine")}
        <Icon as={FaAngleRight} width={'10px'}/>
      </Button>
    </Flex>
  );
};

export default SettingsFooter;