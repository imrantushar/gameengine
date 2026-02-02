import { Flex, Image } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import { plugin_root_url } from '@GFUtils/helper';
import React from 'react';

const SettingsHeader = ({title, subTitle}) => {
  return (
    <Flex
      direction={'column'}
      alignItems={'center'}
      gap={'16px'}
    >
      <Image
        maxW={'36px'}
        height={'auto'}
        src={plugin_root_url + 'assets/images/logo.svg'}
      />
      <Flex direction={'column'} gap={'8px'} alignItems={'center'}>
        <GFLabel
          type="heading"
          margin={0}
          padding={0}
          fontSize={'38px'}
          lineHeight={'38px'}
          label={title}
          borderBottom={'none'}
        />
        <GFLabel
          type="simple"
          margin={0}
          padding={0}
          lineHeight={'28px'}
          textAlign={'center'}
          label={subTitle}
        />
      </Flex>
    </Flex>
  );
};

export default SettingsHeader;