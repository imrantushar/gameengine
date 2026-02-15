import React from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';
import { Box, Checkbox, Flex, Icon, Image } from '@chakra-ui/react';
import { academyLms, wooCommerce } from '@GFUtils/icons';
import { is_academylms_active, is_woocommerce_active, plugin_root_url } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { useFormikContext } from 'formik';

const AddonsCard = [
  {
    label: __('Progress Map', 'gameengine'),
    name: 'progress_map',
    description: __('Keep users loyal to your brand', 'gameengine'), 
		icon: false,
		image: plugin_root_url+'assets/images/progress_map.svg',
  },
  {
    label: __('Restrict Content', 'gameengine'), 
    name: 'restrict_content',
    description: __('Boost interactions with content', 'gameengine'), 
		icon: false,
		image: plugin_root_url+'assets/images/restrict_content.svg',
  },
  {
    label: __('Restrict Unlock', 'gameengine'), 
		name: 'restrict_unlock',
    description: __('Boost interactions with content', 'gameengine'), 
    icon: false,
    image: plugin_root_url+'assets/images/restrict_unlock.svg',
    plugin_required: false
  },
  {
    label: __('WooCommerce Integration', 'gameengine'), 
		name: 'woocommerce',
    description: __('Boost interactions with content', 'gameengine'), 
    icon: wooCommerce,
    plugin_required: true
  },
  {
    label: __('Academy LMS Integration', 'gameengine'), 
		name: 'academylms',
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
  const {values, setFieldValue} = useFormikContext();
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
          const isChecked =
            (item.name === 'academylms' &&
              values.addons.includes('academylms') &&
              is_academylms_active) ||
            (item.name === 'woocommerce' &&
              values.addons.includes('woocommerce') &&
              is_woocommerce_active) ||
            values.addons.includes(item.name);

          const isDisabled =
            (item.name === 'academylms' && !is_academylms_active) ||
            (item.name === 'woocommerce' && !is_woocommerce_active)

          return (
            <Flex
              key={idx}
              gap={'12px'}
              padding={'16px'}
              maxWidth={'280px'}
              border={`1px solid #CBD1D7`}
              borderRadius={'4px'}
              textAlign={'center'}
              width={'calc(100% / 2)'}
              alignItems={'center'}
              cursor={'pointer'}
              onClick={() => {
                if (!values.addons.includes(item.name)) {
                    setFieldValue('addons', [...values.addons, item.name]);
                  } else {
                  setFieldValue(
                    'addons',
                    values.addons.filter(addon => addon !== item.name)
                  );
                }
              }}
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
                disabled={isDisabled}
                checked={isChecked}
                // onCheckedChange={(changes) => {
                //   if (changes.checked) {
                //     if (!values.addons.includes(item.name)) {
                //       setFieldValue('addons', [...values.addons, item.name]);
                //     }
                //   } else {
                //     setFieldValue(
                //       'addons',
                //       values.addons.filter(addon => addon !== item.name)
                //     );
                //   }
                // }}

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