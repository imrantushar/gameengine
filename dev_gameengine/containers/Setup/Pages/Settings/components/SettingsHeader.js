import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import { plugin_root_url } from '@GFUtils/helper';
import React from 'react';
const SettingsHeader = ({
  title,
  subTitle
}) => {
  return <div className="flex flex-col items-center gap-4">
      <img className="h-auto" style={{
      "maxWidth": "36px"
    }} src={plugin_root_url + 'assets/images/logo.svg'} />
      <div className="flex flex-col items-center gap-2">
        <GFLabel type="heading" margin={0} padding={0} fontSize={'38px'} lineHeight={'38px'} label={title} borderBottom={'none'} />
        <GFLabel type="simple" margin={0} padding={0} lineHeight={'28px'} textAlign={'center'} label={subTitle} />
      </div>
    </div>;
};
export default SettingsHeader;