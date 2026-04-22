import React from 'react';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { plugin_root_url } from '@GFUtils/helper';
import './styles.scss';
const TopBar = ({
  rightContent,
  middleContent,
  leftContent,
  path,
  topPosition = "32px"
}) => {
  const pathName = path ? path : __("GameEngine", "gameengine");
  return <React.Fragment>
			<div className="gameengine-topbar flex justify-between w-full sticky mb-6 bg-[var(--gameengine-background)] [box-shadow:var(--gameengine-shadow)] py-5 px-6 z-[3996]" style={{
      "top": topPosition
    }} direction={{
      base: 'column',
      md: 'row'
    }} align={{
      base: 'flex-start',
      md: 'center'
    }}>
				{leftContent ? leftContent : <div className="flex items-center gap-2">
						<img className="h-auto max-w-[36px]" src={plugin_root_url + 'assets/images/logo.svg'} />
						<div className="w-1 bg-[var(--gameengine-primary)] h-1.5" />
						<GFLabel type="subtitle" fontWeight="medium" label={pathName} />
					</div>}

				{middleContent ? middleContent : null}

				{rightContent ? rightContent : null}
			</div>
		</React.Fragment>;
};
export default TopBar;