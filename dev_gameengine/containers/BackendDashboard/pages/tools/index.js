import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import GameEngineBox from '@GFComponents/GameEngineBox';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import ShortCode from './Shortcode';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { admin_url, route_path, useQuery } from '@GFUtils/helper';
import { Link, useNavigate } from 'react-router-dom';
import { clearBtn } from '../../../../../assets/scss/chakra/recipe';
import { TfiShortcode } from "react-icons/tfi";
import { FcDataConfiguration } from "react-icons/fc";

const Tools = () => {
  const navigate = useNavigate();
	const location = useQuery();
	const path = location.get('path');
  const [selected, setSelected] = useState( path ?? 'status');
  const tabs = [
      {
        icon: TfiShortcode,
        title: __('Shortcodes', 'gameengine'),
        name: 'shortcodes',
        slug: 'shortcodes',
        route: `&path=shortcodes`,
      },
      {
        title: __('Setup Wizard', 'gameengine'),
        icon: FcDataConfiguration,
        name: 'setup',
        slug: 'setup',
        link: admin_url+'admin.php?page=gameengine-setup',
      },
    ];

  const renderSwitch = (urlPath) => {
		switch (urlPath) {
			case 'shortcodes':
				return <ShortCode />;
			default:
				return <ShortCode />;
		}
	};
  return (
    <>
      <TopBar path={__('Tools', "gameengine")} />
      <Box className='gameengine-page-content'>
        <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
          <GFLabel type="plainHeading" margin={0} label={__("Tools", "gameengine")} />
        </Flex>
        <Box
          display="flex"
          gap={'24px'}
          alignItems={'flex-start'}
          overflow="visible"
        >
          <Box w={'20%'}>
            <Box 
              className="gameengine-tab-panel" 
              width={'100%'}
              bg={'#fff'}
              boxShadow={'0 .5px 2px 0 rgba(16,24,40,.15)'}
              borderRadius={'4px'}
              padding={'10px 16px'}

            >
              {tabs.map((tabItem, tabIndex) => {
                return (
                  <Box
                    className={`gameengine-tab-panel-control gameengine-tab-panel__item ${
                      tabItem.name === selected
                        ? 'gameengine-tab-panel__item--is-open'
                        : ''
                    }`}
                    key={tabIndex}
                    marginBottom={'8px'}
                  >
                    {tabItem.link ? (
                      <Button
                        as='a'
                        type="link"
                        href={tabItem?.link}
                        {...clearBtn}
                        display={'flex'}
                        alignItems={'center'}
                        justifyContent={'flex-start'}
                        gap={'8px'}
                        padding={'10px 8px'}
                        background={selected === tabItem.name ? '#f5f5f5' : 'transparent'}
                        color={selected === tabItem.name ? 'var(--gameengine-primary-color)' : '#0f0e16'}
                        borderRadius={'4px'}
                        lineHeight={'20px'}
                        fontSize={'14px'}
                        fontWeight={'500'}
                        _hover={{
                          color: 'var(--gameengine-primary-color)',
                          background: '#f5f5f5'
                        }}
                      >
                        <Icon
                          as={tabItem.icon}
                          className={`gameengine-icon`}
                        />
                        {tabItem.title}
                      </Button>
                    ) : (
                      <Link
                        to={`${route_path}admin.php?page=gameengine-tools${tabItem.route}`}
                        className={`gameengine-tab-item ${
                          selected === tabItem.name
                            ? 'gameengine-tab-item--is-active'
                            : ''
                        }`}
                      >
                        <Button
                          {...clearBtn}
                          display={'flex'}
                          alignItems={'center'}
                          justifyContent={'flex-start'}
                          gap={'8px'}
                          padding={'10px 8px'}
                          background={selected === tabItem.name ? '#f5f5f5' : 'transparent'}
                          color={selected === tabItem.name ? 'var(--gameengine-primary-color)' : '#0f0e16'}
                          borderRadius={'4px'}
                          lineHeight={'20px'}
                          fontSize={'14px'}
                          fontWeight={'500'}
                          width={'100%'}
                          _hover={{
                            color: 'var(--gameengine-primary-color)',
                            background: '#f5f5f5'
                          }}
                        >
                          <Icon
                            as={tabItem.icon}
                            className={`gameengine-icon`}
                          />
                          {tabItem.title}
                        </Button>
                      </Link>
                    )}
                  </Box>
                );
              })}
            </Box>

          </Box>
          <Box w={'80%'}>
            <GameEngineBox dynamicClasses={'gameengine-tools'} heading={__('Shortcode', 'gameengine')}>
              {renderSwitch(selected)}
            </GameEngineBox>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Tools;