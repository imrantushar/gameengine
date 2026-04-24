import GFLabel from '@GFComponents/Labels/GFLabel';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { clearBtn, outlineBtn, primaryBtn } from '../../../assets/scss/chakra/recipe';
const ImportDemoBanner = ({
  type,
  title,
  subtitle,
  handleImport,
  handleClose
}) => {
  return <div className="w-full bg-white p-6 [border-left:2px_solid_#006BFF]" style={{
    "boxShadow": "0 0 1px 0 rgba(20, 26, 36, 0.20), 0 1px 2px 0 rgba(20, 26, 36, 0.10)"
  }}>
      <GFLabel type='simpleHeading' label={title} margin={'0 0 6px 0'} fontSize={'20px'} lineHeight={'30px'} />
      <GFLabel type='simple' label={subtitle} margin={'0 0 16px 0'} fontSize={'16px'} lineHeight={'24px'} />
      <div className="flex gap-3">
        <button style={primaryBtn} onClick={handleImport}>
          {__("Import Default Data", 'gameengine')}
        </button>
        <button className="py-2 px-4 [border:1px_solid_#CBD1D7]" style={outlineBtn} onClick={handleClose}>
          {__("No, Thanks!", 'gameengine')}
        </button>
      </div>
    </div>;
};
export default ImportDemoBanner;