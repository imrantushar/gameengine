import React from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';
import { TiPointOfInterestOutline } from "react-icons/ti";
import { GrAchievement } from "react-icons/gr";
import { SiLevelsdotfyi } from "react-icons/si";
import { Box, Flex, Icon } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';

const previewCards = [
  {
    label: __('Point type', 'gameengine'),
    description: __('point_type', 'gameengine'),
    icon: TiPointOfInterestOutline,
    value: 'point_type'
  },
  {
    label: __('Achavement', 'gameengine'),
    description: __('achavement', 'gameengine'),
    icon: GrAchievement,
    value: 'achavement'
  },
  {
    label: __('Level', 'gameengine'),
    description: __('level', 'gameengine'),
    icon: SiLevelsdotfyi,
    value: 'level'
  },
]
const DataPreview = () => {
  return (
    <>
      <SettingsHeader
        title={__('Setup Your EameEngine', 'gemboards')}
        subTitle={__('Choose your preferred gamification setup', 'gemboards')}
      />
      <Box width={'100%'}>
        <Flex gap={'16px'}>
          {previewCards.map((item, idx) => {
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
                width={'calc(100% / 3)'}
                alignItems={'center'}
              >
                <Icon as={item.icon} width={'30px'} height={'30px'} />
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
                    // fontSize={'16px'}
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
              </Flex>
            )
          })}
        </Flex>
      </Box>
    </>
  );
};

export default DataPreview;