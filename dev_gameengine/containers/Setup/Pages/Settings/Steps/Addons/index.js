import React from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';
import { Box, Checkbox, Flex, Icon, Image } from '@chakra-ui/react';
import { academyLms, wooCommerce } from '@GFUtils/icons';
import { plugin_root_url } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';

const AddonsCard = [
  {
    label: __('Progress Map', 'gameengine'), 
    description: __('Keep users loyal to your brand', 'gameengine'), 
		icon: false,
		image: plugin_root_url+'assets/images/progress_map.svg',
  },
  {
    label: __('Restrict Content', 'gameengine'), 
    description: __('Boost interactions with content', 'gameengine'), 
		icon: false,
		image: plugin_root_url+'assets/images/restrict_content.svg',
  },
  {
    label: __('Restrict Unlock', 'gameengine'), 
    description: __('Boost interactions with content', 'gameengine'), 
    icon: false,
    image: plugin_root_url+'assets/images/restrict_unlock.svg',
    plugin_required: false
  },
  {
    label: __('WooCommerce Integration', 'gameengine'), 
    description: __('Boost interactions with content', 'gameengine'), 
    icon: wooCommerce,
    plugin_required: true
  },
  {
    label: __('Academy LMS Integration', 'gameengine'), 
    description: __('Boost interactions with content', 'gameengine'), 
    icon: academyLms,
    plugin_required: true
  },
  {
    label: __("I’ll decide later", 'gameengine'), 
    description: "", 
    icon: false,
    plugin_required: false
  },
]

const Addons = () => {
  return (
    <>
      <SettingsHeader
        title={__('Gamification Category', 'gemboards')}
        subTitle={__('What best describes your Needs?', 'gemboards')}
      />
      <Box
        width={'100%'}
        height={'1px'}
        background={'#E0E4E8'}
      />
      <Flex gap={'16px'} flexWrap={'wrap'}>
        {AddonsCard.map((item, idx) => {
          const isSelected = false;
          return (
            <Flex
              key={idx}
              gap={'12px'}
              padding={'16px'}
              maxWidth={'280px'}
              border={`1px solid ${isSelected ? 'var(--gameengine-primary)' : '#E0E4E8'}`}
              background={isSelected && '#F3F5FF'}
              borderRadius={'4px'}
              textAlign={'center'}
              width={'calc(100% / 2)'}
              alignItems={'center'}
            >
              {item.icon ? (
                <Icon as={item.icon} width={'30px'} height={'30px'} />
              ) : (
                <Image
                  maxW={'36px'}
                  height={'auto'}
                  src={item.image}
                />
              )}
              <Flex
                direction={'column'}
                gap={'4px'}
                alignItems={'flex-start'}
              >
                <GFLabel
                  type="simpleHeading"
                  margin={0}
                  padding={0}
                  label={item.label}
                  lineHeight={'20px'}
                />
                <GFLabel
                  type="simple"
                  margin={0}
                  padding={0}
                  label={item.description}
                  fontSize={'12px'}
                  lineHeight={'16px'}
                />
              </Flex>
              <Checkbox.Root
                size="sm"
                mt="0.5"
                ml='auto'
                checked={isSelected}
                onCheckedChange={(changes) =>
                  console.log({changes})
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            </Flex>
          )
        })}
        </Flex>
    </>
  );
};

export default Addons;