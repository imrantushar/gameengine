import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Switch from '@GFComponents/Switch/Switch';
import GameEngineBox from '@GFComponents/GameEngineBox';
import GFLabel from '@GFComponents/Labels/GFLabel';
import SettingsInput from '../../Components/SettingsInput';
import MarketplaceFields from './MarketplaceFields';
import { is_pro } from '@GFUtils/helper';

const MarketPlace = () => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <GameEngineBox dynamicClasses="gameengine-settings shadow-[var(--gameengine-shadow)]">
      <p className="gameengine-settings-heading">
        {__('Coupon Generate', 'gameengine')}
      </p>

      <div className="flex flex-col gap-4">
        <SettingsInput
          isPro={!is_pro}
          label={__('Enable Coupon Generate', 'gameengine')}
          subtitle={__(
            'Activate the rewards store where users can exchange points for unique WooCommerce discount coupons via shortcode.',
            'gameengine'
          )}
        >
          <Switch
            disabled={!is_pro}
            checked={Boolean(values?.marketplace?.enable_marketplace)}
            onChange={(val) => setFieldValue('marketplace.enable_marketplace', val)}
          />
        </SettingsInput>
      </div>

      {(values?.marketplace?.enable_marketplace || !is_pro) && (
        <div className="flex flex-col items-start w-full gap-4 mt-[24px]">
          <div
            className="flex flex-col w-full gap-1 [border-bottom:1px_solid_var(--gameengine-border-color)]"
            style={{
              margin: '0 0 12px 0',
              padding: '0 0 12px 0',
            }}
          >
            <p
              className="font-semibold m-0 text-[var(--gameengine-font-color)]"
              style={{ fontSize: '1rem' }}
            >
              {__('Offers', 'gameengine')}
            </p>

            <GFLabel
              type="subtitle"
              color="var(--gameengine-warn-muted)"
              fontSize="0.75rem"
              margin="0"
              label={__(
                'Create various coupon offers with specific point costs, discount amounts, and expiry dates.',
                'gameengine'
              )}
            />
          </div>

          <MarketplaceFields />

          {is_pro && (
            <button
              className="bg-[var(--gameengine-primary)] text-white text-sm font-semibold leading-5 border border-solid border-[var(--gameengine-primary)] px-4 py-2 rounded cursor-pointer"
              onClick={() => {
                setFieldValue('marketplace.offers', [
                  ...values.marketplace.offers,
                  {
                    label: '',
                    points_cost: 0,
                    amount: 0,
                    type: '',
                    expiry_days: 0,
                  },
                ]);
              }}
            >
              {__('Add Offer', 'gameengine')}
            </button>
          )}
        </div>
      )}
    </GameEngineBox>
  );
};

export default MarketPlace;
