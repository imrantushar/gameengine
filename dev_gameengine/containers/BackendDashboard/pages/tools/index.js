import GameEngineBox from '@GFComponents/GameEngineBox';
import TopBar from '@GFComponents/TopBar';
import { __ } from '@wordpress/i18n';
import React from 'react';
import ShortCode from './Shortcode';
import ExportImport from './ExportImport';
import AvailableHooks from './AvailableHooks';
import { admin_url, route_path, useQuery } from '@GFUtils/helper';
import { Link } from 'react-router-dom';
import { TfiShortcode } from "react-icons/tfi";
import { FcDataConfiguration } from "react-icons/fc";
import { FiDownload, FiAnchor } from 'react-icons/fi';
import GetHelp from '@GFComponents/GetHelp';
import WhatsNew from '@GFComponents/WhatsNew';

const Tools = () => {
  const query = useQuery();
  const path = query.get('path') || 'shortcodes';

  const tabs = [
    {
      icon: TfiShortcode,
      title: __('Shortcodes', 'gameengine'),
      name: 'shortcodes',
      slug: 'shortcodes',
      route: `&path=shortcodes`
    },
    {
      icon: FiDownload,
      title: __('Export / Import', 'gameengine'),
      name: 'export-import',
      slug: 'export-import',
      route: `&path=export-import`
    },
    {
      icon: FiAnchor,
      title: __('Available Hooks', 'gameengine'),
      name: 'available-hooks',
      slug: 'available-hooks',
      route: `&path=available-hooks`
    },
    {
      title: __('Setup Wizard', 'gameengine'),
      icon: FcDataConfiguration,
      name: 'setup',
      slug: 'setup',
      link: admin_url + 'admin.php?page=gameengine-setup'
    }
  ];

  const renderSwitch = urlPath => {
    switch (urlPath) {
      case 'shortcodes':
        return <ShortCode />;
      case 'export-import':
        return <ExportImport />;
      case 'available-hooks':
        return <AvailableHooks />;
      default:
        return <ShortCode />;
    }
  };

  return (
    <>
      <TopBar path={__('Tools', "gameengine")}
        rightContent={
            <div className="flex items-center gap-2">
                <WhatsNew />

                <GetHelp filterText={['tools']} />
            </div>
        }
      />

      <div className='gameengine-page-content'>
        <h2 className="gameengine-page-heading py-6">
          {__("Tools", "gameengine")}
        </h2>

        <div className="items-start flex gap-6 overflow-visible">
          <div className="w-[20%]">
            <div className="w-full gameengine-surface p-2">
              {tabs.map((tabItem, tabIndex) => {
                const isActive = path === tabItem?.name;
                const baseClasses = "flex items-center gap-3  px-3 py-2 rounded-md text-sm font-medium transition-colors";
                const activeClasses = isActive
                  ? "bg-[var(--gameengine-secondary-color)] text-[var(--gameengine-primary-color)]"
                  : "text-[var(--gameengine-font-color)] hover:bg-[var(--gameengine-secondary-color)]";

                return (
                  <div key={tabIndex} className="mb-1 last:mb-0">
                    {tabItem?.link ? (
                      <a
                        href={tabItem?.link}
                        className={`${baseClasses} ${activeClasses} no-underline `}
                      >
                        {tabItem?.icon()}
                        {tabItem?.title}
                      </a>
                    ) : (
                      <Link
                        to={`${route_path}admin.php?page=gameengine-tools${tabItem?.route}`}
                        className={`${baseClasses} ${activeClasses} no-underline `}
                      >
                        {tabItem?.icon()}
                        {tabItem?.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-[80%]">
            <GameEngineBox dynamicClasses={'gameengine-tools'} heading={tabs.find(t => t.name === path)?.title || __('Shortcodes', 'gameengine')}>
              {renderSwitch(path)}
            </GameEngineBox>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tools;
