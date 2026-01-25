import { Box } from '@chakra-ui/react';
import GameEngineBox from '@GFComponents/GameEngineBox';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import React from 'react';
import ShortCode from './Shortcode';

const Tools = () => {
  return (
    <Box className='gameengine-page-content'>
      <TopBar path={__('Tools', "gameengine")} />
      <GameEngineBox dynamicClasses={'gameengine-tools'} heading={__('Shortcode', 'academy')}>
        <ShortCode />
      </GameEngineBox>
    </Box>
  );
};

export default Tools;