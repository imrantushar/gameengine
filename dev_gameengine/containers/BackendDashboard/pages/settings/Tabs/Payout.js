import GameEngineBox from '@GFComponents/GameEngineBox';
import React from 'react';
import { __ } from "@wordpress/i18n";
import { Input, Switch } from '@chakra-ui/react';
import GFLabel from '@GFComponents/Labels/GFLabel';
import SettingsInput from '../Components/SettingsInput';
import { useFormikContext } from 'formik';
import Select from 'react-select';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import { is_pro } from '@GFUtils/helper';

const Payout = () => {
  const { values, setFieldValue } = useFormikContext();
  const payoutMethods = values?.available_methods || [];

  return (
    <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" width="100%">
      <GFLabel type="heading" margin='0 0 24px 0' padding='0 0 16px 0' label={__("Payout", "gameengine")} />
      <SettingsInput isPro={!is_pro} label={__("Enable Payout", "gameengine")}  margin='0 0 24px 0'>
        <Switch.Root
            colorPalette="blue"
            size="sm"
            mt="0.5"
            disabled={!is_pro}
            aria-label="Select row"
            checked={values?.payout?.enable_payout}
            onCheckedChange={(changes) => {
              setFieldValue('payout.enable_payout', changes.checked)
            }}
        >
            <Switch.HiddenInput />
            <Switch.Control />
        </Switch.Root>
      </SettingsInput>
      <SettingsInput isPro={!is_pro} label={__("Payout methods", "gameengine")}  margin='0 0 24px 0'>
        <Select
          className="gameengine-select gameengine-select--300"
          classNamePrefix="gameengine-select"
          options={payoutMethods}
          isMulti
          isDisabled={!is_pro}
          value={payoutMethods.filter(option => (values?.payout?.methods || []).includes(option.value))}
          onChange={options => {
            const cleanValues = (options || [])
              .map(item => item?.value)
              .filter(Boolean);
              setFieldValue('payout.methods', cleanValues)
          }}
          menuPlacement="bottom"
        />
      </SettingsInput>
      <SettingsInput isPro={!is_pro} width='100%' label={__("Max Points", "gameengine")}  margin='0 0 24px 0'>
        <Input
          type="number"
          min="0"
          placeholder={__("0", "gameengine")}
          step="1"
          width="300px"
          disabled={!is_pro}
          value={values.payout?.max_points}
          onChange={(event) => {
              const rawValue = event.target.value;
              setFieldValue(
                  `payout.max_points`, Number(rawValue)
              );
          }}
          {...commonInput}
        />
      </SettingsInput>
      <SettingsInput isPro={!is_pro} width='100%' label={__("Min Points", "gameengine")} margin='0 0 24px 0'>
        <Input
          type="number"
          min="0"
          step="1"
          disabled={!is_pro}
          width="300px"
          placeholder={__("0", "gameengine")}
          value={values.payout?.min_points}
          onChange={(event) => {
              const rawValue = event.target.value;
              setFieldValue(
                  `payout.min_points`, Number(rawValue)
              );
          }}
          {...commonInput}
        />
      </SettingsInput>
    </GameEngineBox>
  );
};

export default Payout;