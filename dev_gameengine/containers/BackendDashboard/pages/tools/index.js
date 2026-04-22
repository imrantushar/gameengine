import { Icon } from '@GFUtils/ui';
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
  const [selected, setSelected] = useState(path ?? 'status');
  const tabs = [{
    icon: TfiShortcode,
    title: __('Shortcodes', 'gameengine'),
    name: 'shortcodes',
    slug: 'shortcodes',
    route: `&path=shortcodes`
  }, {
    title: __('Setup Wizard', 'gameengine'),
    icon: FcDataConfiguration,
    name: 'setup',
    slug: 'setup',
    link: admin_url + 'admin.php?page=gameengine-setup'
  }];
  const renderSwitch = urlPath => {
    switch (urlPath) {
      case 'shortcodes':
        return <ShortCode />;
      default:
        return <ShortCode />;
    }
  };
  return <>
      <TopBar path={__('Tools', "gameengine")} />
      <div className='gameengine-page-content'>
        <div className="flex justify-between items-center" style={{
        "padding": "24px 0"
      }}>
          <GFLabel type="plainHeading" margin={0} label={__("Tools", "gameengine")} />
        </div>
        <div className="items-start flex gap-6 overflow-visible">
          <div style={{
          "width": "20%"
        }}>
            <div className="gameengine-tab-panel w-full bg-white rounded" style={{
            "boxShadow": "0 .5px 2px 0 rgba(16,24,40,.15)",
            "padding": "10px 16px"
          }}>
              {tabs.map((tabItem, tabIndex) => {
              return <div className={`${`gameengine-tab-panel-control gameengine-tab-panel__item ${tabItem.name === selected ? 'gameengine-tab-panel__item--is-open' : ''}`} mb-2`} key={tabIndex}>
                    {tabItem.link ? <button className="items-center justify-start" style={{
                  "display": "flex",
                  "gap": "8px",
                  "padding": "10px 8px",
                  "borderRadius": "4px",
                  "lineHeight": "20px",
                  "fontSize": "14px",
                  "fontWeight": "500",
                  "background": selected === tabItem.name ? '#f5f5f5' : 'transparent',
                  "color": selected === tabItem.name ? 'var(--gameengine-primary-color)' : '#0f0e16'
                }} as='a' type="link" href={tabItem?.link} style={clearBtn}>
                        <Icon as={tabItem.icon} className={`gameengine-icon`} />
                        {tabItem.title}
                      </button> : <Link to={`${route_path}admin.php?page=gameengine-tools${tabItem.route}`} className={`gameengine-tab-item ${selected === tabItem.name ? 'gameengine-tab-item--is-active' : ''}`}>
                        <button className="items-center justify-start w-full flex gap-2 rounded leading-5 text-sm font-medium" style={{
                    "padding": "10px 8px",
                    "background": selected === tabItem.name ? '#f5f5f5' : 'transparent',
                    "color": selected === tabItem.name ? 'var(--gameengine-primary-color)' : '#0f0e16',
                    ...clearBtn
                  }}>
                          <Icon as={tabItem.icon} className={`gameengine-icon`} />
                          {tabItem.title}
                        </button>
                      </Link>}
                  </div>;
            })}
            </div>

          </div>
          <div style={{
          "width": "80%"
        }}>
            <GameEngineBox dynamicClasses={'gameengine-tools'} heading={__('Shortcode', 'gameengine')}>
              {renderSwitch(selected)}
            </GameEngineBox>
          </div>
        </div>
      </div>
    </>;
};
export default Tools;