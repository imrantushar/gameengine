import GFLabel from '@GFComponents/Labels/GFLabel';
import { admin_url, plugin_root_url, site_url } from '@GFUtils/helper';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { clearBtn } from '../../../../../assets/scss/chakra/recipe';
import Button from '@GFComponents/Button';
import { FaArrowRightLong } from 'react-icons/fa6';

const Congratulation = () => {
  return (
    <div className="w-full flex-col justify-center items-center h-full flex gap-6">
      <div className="flex w-full flex-col items-center rounded-xl gap-6" style={{
        "maxWidth": "680px",
        "padding": "80px 40px",
        "boxShadow": " 0 6px 12px 0 rgba(20, 26, 36, 0.06)",
        "border": "1px solid #F6F7F8"
      }}>
        <img className="h-auto" style={{
          "maxWidth": "80px"
        }} src={plugin_root_url + 'assets/images/blue_check.svg'} />
        <div className="flex flex-col text-center gap-1">
          <GFLabel type="simpleHeading" margin={0} padding={0} label={__('Congratulations', 'gameengine')} fontSize={'38px'} lineHeight={'38px'} color={'#006BFF'} />
          <GFLabel type="simple" margin={0} padding={0} label={__('Your GameEngine is ready to launch', 'gameengine')} fontSize={'16px'} lineHeight={'24px'} />
        </div>
        <div className="flex w-full justify-center gap-4" marginTop={'8px'}>
          <button
            className="flex items-center gap-2 cursor-pointer p-[2px_16px] !border-[transparent] border-solid rounded-sm h-[42px]"
            {...clearBtn}
            onClick={() => {
              window.location.href = admin_url + 'admin.php?page=gameengine';
            }}
          >
            {__("Go To Dashboard", "gameengine")}
          </button>
          <Button
            label={__("Visit Website", "gameengine")}
            icon={<FaArrowRightLong />}
            iconPosition="right"
            style={{ fontSize: '12px', fontWeight: '400' }}
            onClick={() => window.open(site_url, '__blank')}
          />
        </div>
      </div>
    </div>
  );
};

export default Congratulation;
