import { Box, Button, Flex, Icon, Image, Separator } from '@chakra-ui/react';
import React, { useState } from 'react';
import { admin_url, plugin_root_url } from '@GFUtils/helper';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { LiaUserEditSolid } from 'react-icons/lia';
import { TbStar } from 'react-icons/tb';
import { FaAngleRight } from 'react-icons/fa6';
import { clearBtn, primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    icon: LiaUserEditSolid,
    value: 'manual',
    label: __("I'll Configure Manually", 'gameengine'),
    description: __("Create your own gamification setup from scratch with full control", 'gameengine'),
  },
  {
    icon: TbStar,
    value: 'genatative',
    label: __('Jumpstart with Demo Data', 'gameengine'),
    description: __('This demo gamification is for preview only no real rewards applied', 'gameengine'),
  }
]

const Welcome = () => {
  const [selectedCard, setSelectedCard] = useState('genatative');
  const navigate = useNavigate();
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
        padding={'40px'}
        width={'100%'}
        boxShadow={' 0 6px 12px 0 rgba(20, 26, 36, 0.06)'}
        border={'1px solid #F6F7F8'}
        borderRadius={'12px'}
        direction={'column'}
        alignItems={'center'}
        gap={'24px'}
        >
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
              label={__('Welcome to GameEngine 👋', 'gemboards')}
              borderBottom={'none'}
            />
            <GFLabel
              type="simple"
              margin={0}
              padding={0}
              lineHeight={'28px'}
              textAlign={'center'}
              label={__('You are just a few clicks away from transforming your website into a powerful e-commerce platform.', 'gemboards')}
            />
          </Flex>
        </Flex>
        <Box 
          width={'100%'}
          height={'1px'}
          background={'#E0E4E8'}
        />
        <Flex gap={'24px'}>
          {cards.map((item, idx) => {
            const isSelected = selectedCard === item.value;
            return (
              <Flex 
                key={idx} 
                direction={'column'} 
                alignItems={'center'} 
                gap={'16px'}
                padding={'16px'}
                maxWidth={'280px'}
                border={`1px solid ${isSelected ? 'var(--gameengine-primary)' : '#E0E4E8'}`}
                background={isSelected && '#F3F5FF'}
                borderRadius={'4px'}
                textAlign={'center'}
                position={'relative'}
                onClick={() => setSelectedCard(item.value)}
              >
                <Icon as={item.icon} />
                <GFLabel
                  type="simpleHeading"
                  margin={0}
                  padding={0}
                  label={item.label}
                  fontSize={'16px'}
                  lineHeight={'24px'}
                />
                <GFLabel
                  type="simple"
                  margin={0}
                  padding={0}
                  label={item.description}
                  lineHeight={'24px'}
                />
                {isSelected && (
                  <Box
                    position={'absolute'}
                    top={'8px'}
                    right={'8px'}
                    width={'20px'}
                    height={'20px'}
                    border={'4px solid var(--gameengine-primary)'}
                    borderRadius={'50%'}
                  ></Box>
                )}
              </Flex>
            )
          })}
        </Flex>
        <Button
          {...primaryBtn}
          onClick={() => {
            if(selectedCard === 'manual') {
              window.location.href = admin_url+'admin.php?page=gameengine-points'
            } else {
              navigate('/settings')
            }
          }}
        >
          {__("Process to Next", "gameengine")}
          <Icon as={FaAngleRight}/>
        </Button>
      </Flex>
      <Button
          {...clearBtn}
          fontSize={'14px'}
          fontWeight={'500'}
          lineHeight={'20px'}
          onClick={() => window.location.href = admin_url+'admin.php?page=gameengine'}
        >
          {__("Skip This Step", "gameengine")}
        </Button>
    </Box>
  );
};

export default Welcome;