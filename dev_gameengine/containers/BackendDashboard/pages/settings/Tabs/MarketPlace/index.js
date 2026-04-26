import { Switch } from '@GFComponents/UI';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import React from 'react';
import SettingsInput from '../../Components/SettingsInput';
import { useFormikContext } from 'formik';
import MarketplaceFields from './MarketplaceFields';
import { clearBtn, commonInput, primaryBtn } from '../../../../../../../assets/scss/chakra/recipe';
import { is_pro } from '@GFUtils/helper';
import Select from 'react-select';
const MarketPlace = () => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  return <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)">
      <p className="text-xl font-medium text-[var(--gameengine-font-color)] [border-bottom:1px_solid_var(--gameengine-border-color)]" style={{
      "lineHeight": "30px",
      "margin": "0 0 24px 0",
      "padding": "0 0 16px 0"
    }}>
          {__("Coupon Generate", "gameengine")}
      </p>
      
      <div className="flex flex-col gap-4">
        <SettingsInput isPro={!is_pro} label={__("Enable Coupon Generate", "gameengine")} subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Activate the rewards store where users can exchange points for unique WooCommerce discount coupons via shortcode.', 'gameengine')} />}>
          <Switch.Root colorPalette="blue" size="sm" mt="0.5" disabled={!is_pro} aria-label="Select row" checked={values?.marketplace?.enable_marketplace} onCheckedChange={changes => {
          setFieldValue('marketplace.enable_marketplace', changes.checked);
        }}>
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </SettingsInput>
      </div>

      {(values?.marketplace?.enable_marketplace || !is_pro) && <div className="flex flex-col items-start w-full gap-4" marginTop={'24px'}>
          <div className="flex flex-col w-full gap-1 [border-bottom:1px_solid_var(--gameengine-border-color)]" style={{
        "margin": "0 0 12px 0",
        "padding": "0 0 12px 0"
      }}>
            <p className="font-semibold m-0 text-[var(--gameengine-font-color)]" style={{
          "fontSize": "1rem"
        }}>{__('Offers', 'gameengine')}</p>
            <GFLabel type="subtitle" color="var(--gameengine-warn-muted)" fontSize="0.75rem" margin='0' label={__('Create various coupon offers with specific point costs, discount amounts, and expiry dates.', 'gameengine')} />
          </div>

          {!!values?.marketplace?.offers.length && is_pro ? <MarketplaceFields /> : <div className="flex flex-col items-start w-full gap-4 rounded p-4 relative [box-shadow:var(--gameengine-shadow)]">
              <div className="flex w-full gap-4">
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Label", "gameengine")}>
                  <input className="gameengine-input" type="text" min="0" step="1" disabled={!is_pro} placeholder={__("Add label", "gameengine")} style={commonInput} />
                </SettingsInput>
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='50%' label={__("Offer Type", "gameengine")}>
                  <Select className="gameengine-select gameengine-select--width-full" classNamePrefix="gameengine-select" isDisabled={!is_pro} menuPlacement="bottom" />
                </SettingsInput>
              </div>
              <div className="flex w-full gap-4">
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Point Cost", "gameengine")}>
                  <input className="gameengine-input" type="number" min="0" step="1" isPro={!is_pro} placeholder={__("0", "gameengine")} disabled={!is_pro} style={commonInput} />
                </SettingsInput>
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Amount", "gameengine")}>
                  <input className="gameengine-input" type="number" min="0" step="1" placeholder={__("0", "gameengine")} disabled={!is_pro} style={commonInput} />
                </SettingsInput>
                <SettingsInput isPro={!is_pro} flexDirection="column" alignItems={'flex-start'} width='calc((100% / 3) - 6px)' label={__("Expiry Days", "gameengine")}>
                  <input className="gameengine-input" type="number" min="0" step="1" placeholder={__("0", "gameengine")} disabled={!is_pro} style={commonInput} />
                </SettingsInput>
              </div>
            </div>}
          {is_pro && <button style={primaryBtn} onClick={() => {
        setFieldValue('marketplace.offers', [...values.marketplace.offers, {
          label: "",
          points_cost: 0,
          amount: 0,
          type: "",
          expiry_days: 0
        }]);
      }}>
              {__('Add Offer', 'gameengine')}
            </button>}
        </div>}
    </GameEngineBox>;
};
export default MarketPlace;