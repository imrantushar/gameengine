import React, { useEffect } from 'react';
import SettingsHeader from '../../components/SettingsHeader';
import { __ } from '@wordpress/i18n';
import Checkbox from '@GFComponents/Checkbox/Checkbox';
import { academyLms, wooCommerce, tutorLms, storeEngine } from '@GFUtils/icons';
import { is_academylms_active, is_woocommerce_active, is_tutorlms_active, is_storeengine_active, plugin_root_url } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { useFormikContext } from 'formik';

const AddonsCard = [
  {
    label: __('Progress Map', 'gameengine'),
    name: 'progress_map',
    description: __('Show members their progress as a map of steps', 'gameengine'),
    icon: false,
    image: plugin_root_url + 'assets/images/progress_map.svg'
  },
  {
    label: __('Restrict Content', 'gameengine'),
    name: 'restrict_content',
    description: __('Lock content until a member has the points, achievement or level', 'gameengine'),
    icon: false,
    image: plugin_root_url + 'assets/images/restrict_content.svg'
  },
  {
    label: __('Restrict Unlock', 'gameengine'),
    name: 'restrict_unlock',
    description: __('Make an achievement or level require another one first', 'gameengine'),
    icon: false,
    image: plugin_root_url + 'assets/images/restrict_unlock.svg',
    plugin_required: false
  },
  {
    label: __('Academy LMS Integration', 'gameengine'),
    name: 'academylms',
    description: __('Award points for course activity', 'gameengine'),
    icon: academyLms,
    plugin_required: true
  },
  {
    label: __('StoreEngine Integration', 'gameengine'),
    name: 'storeengine',
    description: __('Award points for purchases in your store', 'gameengine'),
    icon: storeEngine,
    plugin_required: true
  },
    {
    label: __('WooCommerce Integration', 'gameengine'),
    name: 'woocommerce',
    description: __('Award points for purchases in your store', 'gameengine'),
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

  // A preset whose rule belongs to an integration only fires with that add-on on.
  useEffect(() => {
    if (values.preset === 'shop' && is_woocommerce_active && !values.addons.includes('woocommerce')) {
      setFieldValue('addons', [...values.addons.filter(a => a !== 'decide_later'), 'woocommerce']);
    }
  }, [values.preset]);

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
        title={__('Connect your plugins', 'gameengine')}
        subTitle={__('Switch on what your site uses. You can change this later under Add-ons.', 'gameengine')}
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
                <item.icon />
              ) : (
                <img className="h-auto" style={{ "maxWidth": "36px" }} src={item?.image} />
              )}

              <div className="flex flex-col items-start gap-1">
                <GFLabel type="simpleHeading" margin={0} padding={0} label={item?.label} lineHeight={'20px'} />
                <GFLabel type="simple" margin={0} padding={0} label={item?.description} fontSize={'12px'} lineHeight={'16px'} />
              </div>

              <span className='ml-auto'>
                <Checkbox checked={isChecked} disabled={isDisabled} onChange={() => handleToggle(item?.name)} />
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Addons;
