import GameEngineBox from '@GFComponents/GameEngineBox';
import React from 'react';
import { __ } from "@wordpress/i18n";
import { Switch } from '@GFUtils/ui';
import GFLabel from '@GFComponents/Labels/GFLabel';
import SettingsInput from '../Components/SettingsInput';
import { useFormikContext } from 'formik';
import Select from 'react-select';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import { is_pro } from '@GFUtils/helper';
const Payout = () => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const payoutMethods = values?.available_methods || [];
  return <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" width="100%">
      <p className="text-xl font-medium text-[var(--gameengine-font-color)] [border-bottom:1px_solid_var(--gameengine-border-color)]" style={{
      "lineHeight": "30px",
      "margin": "0 0 24px 0",
      "padding": "0 0 16px 0"
    }}>
          {__("Payout", "gameengine")}
      </p>

      <SettingsInput isPro={!is_pro} label={__("Enable Payout", "gameengine")} margin='0 0 24px 0' subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Enable users to request real money withdrawals in exchange for their earned points.', 'gameengine')} />}>
        <Switch.Root colorPalette="blue" size="sm" mt="0.5" disabled={!is_pro} aria-label="Select row" checked={values?.payout?.enable_payout} onCheckedChange={changes => {
        setFieldValue('payout.enable_payout', changes.checked);
      }}>
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      </SettingsInput>
      <SettingsInput isPro={!is_pro} label={__("Payout methods", "gameengine")} margin='0 0 24px 0' subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('Select which payment methods are available for users to receive their money (e.g. PayPal, bKash, Bank).', 'gameengine')} />}>
        <Select className="gameengine-select gameengine-select--300" classNamePrefix="gameengine-select" options={payoutMethods} isMulti isDisabled={!is_pro} value={payoutMethods.filter(option => (values?.payout?.methods || []).includes(option.value))} onChange={options => {
        const cleanValues = (options || []).map(item => item?.value).filter(Boolean);
        setFieldValue('payout.methods', cleanValues);
      }} menuPlacement="auto" />
      </SettingsInput>
      <SettingsInput isPro={!is_pro} width='100%' label={__("Max Points", "gameengine")} margin='0 0 24px 0' subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('The maximum number of points a user can request for a withdrawal.', 'gameengine')} />}>
        <input style={{
        "width": "300px",
        ...commonInput
      }} type="number" min="0" placeholder={__("0", "gameengine")} step="1" disabled={!is_pro} value={values.payout?.max_points} onChange={event => {
        const rawValue = event.target.value;
        setFieldValue(`payout.max_points`, Number(rawValue));
      }} />
      </SettingsInput>
      <SettingsInput isPro={!is_pro} width='100%' label={__("Min Points", "gameengine")} margin='0 0 24px 0' subtitle={<GFLabel fontSize="0.75rem" color="var(--gameengine-warn-muted)" type="subtitle" margin={0} label={__('The minimum number of points a user must have to request a withdrawal.', 'gameengine')} />}>
        <input style={{
        "width": "300px",
        ...commonInput
      }} type="number" min="0" step="1" disabled={!is_pro} placeholder={__("0", "gameengine")} value={values.payout?.min_points} onChange={event => {
        const rawValue = event.target.value;
        setFieldValue(`payout.min_points`, Number(rawValue));
      }} />
      </SettingsInput>
    </GameEngineBox>;
};
export default Payout;