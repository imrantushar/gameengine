import { Button, Flex, Icon } from '@chakra-ui/react';
import React from 'react';
import { clearBtn, primaryBtn } from '../../../../../../assets/scss/chakra/recipe';
import { __ } from '@wordpress/i18n';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

const SettingsFooter = () => {
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
      >
        <Icon as={FaAngleLeft} width={'10px'}/>
        {__("Back", "gameengine")}
      </Button>
      <Button
        {...primaryBtn}
      >
        {__("Continue", "gameengine")}
        <Icon as={FaAngleRight}/>
      </Button>
    </Flex>
  );
};

export default SettingsFooter;