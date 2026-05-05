import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import SettingsInput from '../Components/SettingsInput';
import SettingsInner from '../Components/SettingsInner';
import Switch from '@GFComponents/Switch/Switch';
import { is_pro } from '@GFUtils/helper';

export default function Dashboard() {
  const { setFieldValue, values } = useFormikContext();
  const addons = useSelector((state) => state.addons);

  const platformIntegrationOptions = [
    {
      value: 'woocommerce',
      label: __('WooCommerce', 'gameengine'),
      isDisabled: !addons?.woocommerce,
    },
    {
      value: 'academylms',
      label: __('Academy LMS', 'gameengine'),
      isDisabled: !addons?.academylms,
    },
    {
      value: 'tutorlms',
      label: __('Tutor LMS', 'gameengine'),
      isDisabled: !addons?.tutorlms,
    },
  ];

  return (
    <SettingsInner width="" heading={__('Frontend Dashboard', 'gameengine')}>
      <div className="flex flex-col gap-4">
        <SettingsInput
          isPro={!is_pro}
          label={__('Dashboard Integration', 'gameengine')}
          subtitle={__(
            'Select where you want to display game stats and navigation.',
            'gameengine'
          )}
        >
          <Select
            name="platform_integration"
            placeholder={__('Select Platform', 'gameengine')}
            className="gameengine-select"
            classNamePrefix="gameengine-select"
            options={platformIntegrationOptions}
            value={platformIntegrationOptions.filter((item) =>
              (values?.dashboard?.platform_integration ?? []).includes(
                item.value
              )
            )}
            onChange={(options) => {
              const cleanValues = (options || [])
                .map((item) => item?.value)
                .filter(Boolean);

              setFieldValue(
                'dashboard.platform_integration',
                cleanValues
              );
            }}
            menuPlacement="auto"
            isMulti
            isSearchable
            isClearable={false}
          />
        </SettingsInput>

        <SettingsInput
          isPro={!is_pro}
          label={__('Add User Stats Menu', 'gameengine')}
          subtitle={__(
            'Display a quick view of current Points and Rank to users.',
            'gameengine'
          )}
        >
          <Switch
            disabled={!is_pro}
            checked={Boolean(values?.dashboard?.show_stats_widget)}
            onChange={(val) => setFieldValue('dashboard.show_stats_widget', val)}
          />
        </SettingsInput>

        <SettingsInput
          isPro={!is_pro}
          label={__('Add Navigation Links', 'gameengine')}
          subtitle={__(
            'Allow users to redeem their points for WooCommerce discount coupons.',
            'gameengine'
          )}
        >
          <Switch
            disabled={!is_pro}
            checked={Boolean(values?.dashboard?.menu_payout)}
            onChange={(val) => setFieldValue('dashboard.menu_payout', val)}
          />
        </SettingsInput>

        <SettingsInput
          isPro={!is_pro}
          label={__('Add Coupon Exchange Menu', 'gameengine')}
          subtitle={__(
            'Let users trade their points for WooCommerce discount coupons.',
            'gameengine'
          )}
        >
          <Switch
            disabled={!is_pro}
            checked={Boolean(values?.dashboard?.menu_marketplace)}
            onChange={(val) => setFieldValue('dashboard.menu_marketplace', val)}
          />
        </SettingsInput>
      </div>
    </SettingsInner>
  );
}
