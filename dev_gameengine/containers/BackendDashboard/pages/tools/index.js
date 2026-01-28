import { Box, Flex } from '@chakra-ui/react';
import GameEngineBox from '@GFComponents/GameEngineBox';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import React from 'react';
import ShortCode from './Shortcode';
import GFLabel from '@GFComponents/Labels/GFLabel';

const Tools = () => {
  return (
    <>
      <TopBar path={__('Tools', "gameengine")} />
      <Box className='gameengine-page-content'>
        <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
          <GFLabel type="plainHeading" margin={0} label={__("Tools", "gameengine")} />
        </Flex>
        <GameEngineBox dynamicClasses={'gameengine-tools'} heading={__('Shortcode', 'academy')}>
          <ShortCode />
        </GameEngineBox>
      </Box>
    </>
  );
};

export default Tools;