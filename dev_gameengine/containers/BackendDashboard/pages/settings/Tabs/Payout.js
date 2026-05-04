import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Select from 'react-select';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { Switch } from '@GFComponents/UI';
import SettingsInput from '../Components/SettingsInput';
import { is_pro } from '@GFUtils/helper';

const Payout = () => {
  const { values, setFieldValue } = useFormikContext();

  const payoutMethods = values?.available_methods || [];

  return (
    <GameEngineBox
      dynamicClasses="gameengine-settings"
      boxShadow="var(--gameengine-shadow)"
      width="100%"
    >
      <p className="gameengine-settings-heading">
        {__('Payout', 'gameengine')}
      </p>

      <SettingsInput
        isPro={!is_pro}
        className="m-[0_0_24px_0]"
        label={__('Enable Payout', 'gameengine')}
        subtitle={__(
          'Enable users to request real money withdrawals in exchange for their earned points.',
          'gameengine'
        )}
      >
        <Switch.Root
          colorPalette="blue"
          size="sm"
          mt="0.5"
          disabled={!is_pro}
          aria-label="Select row"
          checked={values?.payout?.enable_payout}
          onCheckedChange={(changes) => {
            setFieldValue('payout.enable_payout', changes.checked);
          }}
        >
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      </SettingsInput>

      <SettingsInput
        isPro={!is_pro}
        label={__('Payout methods', 'gameengine')}
        className="m-[0_0_24px_0]"
        subtitle={__(
          'Select which payment methods are available for users to receive their money (e.g. PayPal, bKash, Bank).',
          'gameengine'
        )}
      >
        <Select
          className="gameengine-select gameengine-select--300"
          classNamePrefix="gameengine-select"
          options={payoutMethods}
          isMulti
          isClearable={false}
          isDisabled={!is_pro}
          value={payoutMethods.filter((option) =>
            (values?.payout?.methods || []).includes(option.value)
          )}
          onChange={(options) => {
            const cleanValues = (options || [])
              .map((item) => item?.value)
              .filter(Boolean);

            setFieldValue('payout.methods', cleanValues);
          }}
          menuPlacement="auto"
        />
      </SettingsInput>

      <SettingsInput
        isPro={!is_pro}
        width="100%"
        label={__('Max Points', 'gameengine')}
        className="m-[0_0_24px_0]"
        subtitle={__(
          'The maximum number of points a user can request for a withdrawal.',
          'gameengine'
        )}
      >
        <input
          className="gameengine-input border border-solid border-[var(--gameengine-border-color)] rounded-[6px] px-3 py-2 text-sm bg-white outline-none text-[var(--gameengine-font-color)]"
          style={{ width: '300px' }}
          type="number"
          min="0"
          placeholder={__('0', 'gameengine')}
          step="1"
          disabled={!is_pro}
          value={values.payout?.max_points}
          onChange={(event) => {
            const rawValue = event.target.value;

            setFieldValue('payout.max_points', Number(rawValue));
          }}
        />
      </SettingsInput>

      <SettingsInput
        isPro={!is_pro}
        width="100%"
        label={__('Min Points', 'gameengine')}
        subtitle={__(
          'The minimum number of points a user must have to request a withdrawal.',
          'gameengine'
        )}
      >
        <input
          className="gameengine-input border border-solid border-[var(--gameengine-border-color)] rounded-[6px] px-3 py-2 text-sm bg-white outline-none text-[var(--gameengine-font-color)]"
          style={{ width: '300px' }}
          type="number"
          min="0"
          step="1"
          disabled={!is_pro}
          placeholder={__('0', 'gameengine')}
          value={values.payout?.min_points}
          onChange={(event) => {
            const rawValue = event.target.value;

            setFieldValue('payout.min_points', Number(rawValue));
          }}
        />
      </SettingsInput>
    </GameEngineBox>
  );
};

export default Payout;
