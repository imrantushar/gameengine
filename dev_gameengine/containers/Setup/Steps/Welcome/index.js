import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { plugin_root_url } from '@GFUtils/helper';

const Welcome = () => {
  console.log({globalData: window.GameEngineGlobal, plugin_root_url})

  return (
    <Box
      width={'100%'}
      height={'100%'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <Box
      maxW={'680px'}
      width={'100%'}
      boxShadow={' 0 6px 12px 0 rgba(20, 26, 36, 0.06)'}
    >
      <Image
        maxW={'36px'}
        height={'auto'}
        src={plugin_root_url + 'assets/images/logo.svg'}
      />
    </Box>
      
    </Box>
  );
};

export default Welcome;