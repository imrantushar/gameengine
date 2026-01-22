import { Box } from '@chakra-ui/react';
import GamifyBox from '@GFComponents/GamifyBox';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import React from 'react';
import ShortCode from './Shortcode';

const Tools = () => {
  return (
    <Box className='gamify-page-content'>
      <TopBar path={__('Tools', "gamify")} />
      <GamifyBox dynamicClasses={'gamify-tools'} heading={__('Short Code', 'academy')}>
        <ShortCode />
      </GamifyBox>
    </Box>
  );
};

export default Tools;