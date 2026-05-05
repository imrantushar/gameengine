import React from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';
import { Checkbox, } from '@GFComponents/UI';
import { academyLms, wooCommerce, tutorLms, storeEngine } from '@GFUtils/icons';
import { is_academylms_active, is_woocommerce_active, is_tutorlms_active, is_storeengine_active, plugin_root_url } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { useFormikContext } from 'formik';

const AddonsCard = [
  {
    label: __('Progress Map', 'gameengine'),
    name: 'progress_map',
    description: __('Keep users loyal to your brand', 'gameengine'),
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg'
  },
  {
    label: __('Restrict Content', 'gameengine'),
    name: 'restrict_content',
    description: __('Boost interactions with content', 'gameengine'),
    icon: false,
    image: plugin_root_url + 'assets/images/restrict_content.svg'
  },
  {
    label: __('Restrict Unlock', 'gameengine'),
    name: 'restrict_unlock',
    description: __('Boost interactions with content', 'gameengine'),
    icon: false,
    image: plugin_root_url + 'assets/images/restrict_unlock.svg',
    plugin_required: false
  },
  {
    label: __('Academy LMS Integration', 'gameengine'),
    name: 'academylms',
    description: __('Boost interactions with content', 'gameengine'),
    icon: academyLms,
    plugin_required: true
  },
  {
    label: __('StoreEngine Integration', 'gameengine'),
    name: 'storeengine',
    description: __('Boost interactions with content', 'gameengine'),
    icon: storeEngine,
    plugin_required: true
  },
    {
    label: __('WooCommerce Integration', 'gameengine'),
    name: 'woocommerce',
    description: __('Boost interactions with content', 'gameengine'),
    icon: wooCommerce,
    plugin_required: true
  },
  {
    label: __('Tutor LMS Integration', 'gameengine'),
    name: 'tutorlms',
    description: __('Award points for course activity', 'gameengine'),
    icon: tutorLms,
    plugin_required: true
  },
  {
    label: __("I’ll decide later", 'gameengine'), name: 'decide_later', description: "",
    icon: false,
    plugin_required: false
  }
];

const Addons = () => {
  const { values, setFieldValue } = useFormikContext();

  const handleToggle = (itemName) => {
    const isDeciodeLater = itemName === 'decide_later';
    if (!values.addons.includes(itemName)) {
      if (isDeciodeLater) {
        setFieldValue('addons', ['decide_later']);
      } else {
        setFieldValue('addons', [...values.addons.filter(a => a !== 'decide_later'), itemName]);
      }
    } else {
      setFieldValue('addons', values.addons.filter(addon => addon !== itemName));
    }
  };

  return (
    <>
      <SettingsHeader
        title={__('Gamification Category', 'gemboards')}
        subTitle={__('What best describes your Needs?', 'gemboards')}
      />

      <div className="w-full h-px" style={{ "background": "#E0E4E8" }} />

      <div className="flex flex-wrap gap-4">
        {AddonsCard.map((item, idx) => {
          const isChecked = item?.name === 'academylms' && values.addons.includes('academylms') && is_academylms_active || item?.name === 'tutorlms' && values.addons.includes('tutorlms') && is_tutorlms_active || item?.name === 'woocommerce' && values.addons.includes('woocommerce') && is_woocommerce_active || item?.name === 'storeengine' && values.addons.includes('storeengine') && is_storeengine_active || values.addons.includes(item?.name);
          const isDisabled = item?.name === 'academylms' && !is_academylms_active || item?.name === 'tutorlms' && !is_tutorlms_active || item?.name === 'woocommerce' && !is_woocommerce_active || item?.name === 'storeengine' && !is_storeengine_active;

          return (
            <div
              className="flex items-center cursor-pointer gap-3 p-4 rounded text-center"
              style={{
                "maxWidth": "280px",
                "border": "1px solid #CBD1D7",
                "width": "calc(100% / 2)",
                "opacity": isDisabled ? 0.6 : 1,
                "pointerEvents": isDisabled ? 'none' : 'auto'
              }}
              key={idx}
              onClick={() => handleToggle(item?.name)}
            >
              {item?.icon ? (
                <>{item?.icon}</>
              ) : (
                <img className="h-auto" style={{ "maxWidth": "36px" }} src={item?.image} />
              )}

              <div className="flex flex-col items-start gap-1">
                <GFLabel type="simpleHeading" margin={0} padding={0} label={item?.label} lineHeight={'20px'} />
                <GFLabel type="simple" margin={0} padding={0} label={item?.description} fontSize={'12px'} lineHeight={'16px'} />
              </div>

              <span className='ml-auto'>
                <Checkbox.Root
                  size="sm"
                  mt="0.5"
                  ml='auto'
                  disabled={isDisabled}
                  checked={isChecked}
                  readOnly
                >
                  <Checkbox.Control />
                </Checkbox.Root>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Addons;
