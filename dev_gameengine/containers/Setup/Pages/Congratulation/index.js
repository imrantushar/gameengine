import { Box, Button, Flex, Icon, Image } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { admin_url, plugin_root_url, site_url } from '@GFUtils/helper';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { clearBtn, primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { FaArrowRightLong } from 'react-icons/fa6';

const Congratulation = () => {
  return (
    <Box
      width={'100%'}
      height={'100%'}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      gap={'24px'}
    >
      <Flex
        maxW={'680px'}
        padding={'80px 40px'}
        width={'100%'}
        boxShadow={' 0 6px 12px 0 rgba(20, 26, 36, 0.06)'}
        border={'1px solid #F6F7F8'}
        borderRadius={'12px'}
        direction={'column'}
        alignItems={'center'}
        gap={'24px'}
      >
        <Image
          maxW={'80px'}
          height={'auto'}
          src={plugin_root_url + 'assets/images/blue_check.svg'}
        />
        <Flex
          direction={'column'}
          textAlign={'center'}
          gap={'4px'}
        >
          <GFLabel
            type="simpleHeading"
            margin={0}
            padding={0}
            label={__('Congratulations', 'gameengine')}
            fontSize={'38px'}
            lineHeight={'38px'}
            color={'#006BFF'}
          />
          <GFLabel
            type="simple"
            margin={0}
            padding={0}
            label={__('Your GameEngine is ready to launch', 'gameengine')}
            fontSize={'16px'}
            lineHeight={'24px'}
          />
        </Flex>
        <Flex gap={'16px'} width={'100%'} justifyContent={'center'} marginTop={'8px'}>
          <Button
            {...clearBtn}
            padding={'2px 16px'}
            border="1px solid #CBD1D7"
            height={'42px'}
            onClick={() => {
              window.location.href = admin_url + 'admin.php?page=gameengine'
            }}
          >
            {__("Go To Dashboard", "gameengine")}
          </Button>
          <Button
            {...primaryBtn}
            onClick={() => {
              window.open(site_url, '__blank')
            }}
          >
            {__("Visit Website", "gameengine")}
            <Icon as={FaArrowRightLong} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Congratulation;