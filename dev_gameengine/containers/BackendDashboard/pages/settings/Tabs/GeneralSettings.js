import React from 'react';
import { Switch } from '@GFComponents/UI';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { useFormikContext } from 'formik';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';

const displaycicle = [
  {
    label: __('Immediate', 'gameengine'),
    value: 'immediate',
  },
  {
    label: __('After 24 Hours', 'gameengine'),
    value: 'daily',
  },
  {
    label: __('After 7 Days', 'gameengine'),
    value: 'weekly',
  },
];

const retentionDays = [
  {
    label: __('Never', 'gameengine'),
    value: '0',
  },
  {
    label: __('30 Days', 'gameengine'),
    value: '30',
  },
  {
    label: __('90 Days', 'gameengine'),
    value: '90',
  },
];

const GeneralSettings = () => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <>
      <GameEngineBox
        dynamicClasses="gameengine-settings overflow-visible"
        boxShadow="var(--gameengine-shadow)"
      >
        <p className="gameengine-settings-heading">
          {__('Log', 'gameengine')}
        </p>

        <div className="flex flex-col gap-4">
          <SettingsInput
            label={__('Log Display', 'gameengine')}
            subtitle={__(
              'Choose how activity logs are processed. Select "Immediate" to record and display log entries as soon as they occur.',
              'gameengine'
            )}
          >
            <Select
              className="gameengine-select gameengine-select--300"
              classNamePrefix="gameengine-select"
              options={displaycicle}
              value={
                displaycicle?.find(
                  (opt) => opt.value === values?.logs?.display_cycle
                ) || null
              }
              onChange={(option) => {
                setFieldValue('logs.display_cycle', option.value);
              }}
              menuPlacement="auto"
            />
          </SettingsInput>

          <SettingsInput
            label={__('Auto Cleanup', 'gameengine')}
            subtitle={__(
              'Automatically remove old activity logs from the database after a specific period to keep your database optimized and improve performance.',
              'gameengine'
            )}
          >
            <Select
              className="gameengine-select gameengine-select--300"
              classNamePrefix="gameengine-select"
              options={retentionDays}
              value={
                retentionDays?.find(
                  (opt) =>
                    Number(opt.value) ===
                    Number(values?.logs?.retention_days)
                ) || null
              }
              onChange={(option) => {
                setFieldValue('logs.retention_days', option.value);
              }}
              menuPlacement="auto"
            />
          </SettingsInput>
        </div>
      </GameEngineBox>

      <GameEngineBox
        dynamicClasses="gameengine-settings mt-6"
        boxShadow="var(--gameengine-shadow)"
      >
        <p
          className="gameengine-settings-heading"
        >
          {__('Economy', 'gameengine')}
        </p>

        <div className="flex flex-col gap-4">
          <SettingsInput
            label={__('Enable successful rewards', 'gameengine')}
            subtitle={__(
              'Enable this to record a log entry every time a user successfully earns points, achievements, or levels.',
              'gameengine'
            )}
          >
            <Switch.Root
              colorPalette="blue"
              size="sm"
              mt="0.5"
              aria-label="Select row"
              checked={values?.logs?.log_levels?.includes('success')}
              onCheckedChange={(changes) => {
                if (changes.checked) {
                  setFieldValue('logs.log_levels', [
                    ...values?.logs?.log_levels,
                    'success',
                  ]);
                } else {
                  setFieldValue(
                    'logs.log_levels',
                    values?.logs?.log_levels.filter(
                      (item) => item !== 'success'
                    )
                  );
                }
              }}
            >
              <Switch.HiddenInput />
              <Switch.Control />
            </Switch.Root>
          </SettingsInput>

          <SettingsInput
            label={__('Enable System Errors', 'gameengine')}
            subtitle={__(
              'Enable this to track and record failed reward attempts or system-level errors to help diagnose potential issues.',
              'gameengine'
            )}
          >
            <Switch.Root
              colorPalette="blue"
              size="sm"
              mt="0.5"
              aria-label="Select row"
              checked={values?.logs?.log_levels?.includes('error')}
              onCheckedChange={(changes) => {
                if (changes.checked) {
                  setFieldValue('logs.log_levels', [
                    ...values?.logs?.log_levels,
                    'error',
                  ]);
                } else {
                  setFieldValue(
                    'logs.log_levels',
                    values?.logs?.log_levels.filter(
                      (item) => item !== 'error'
                    )
                  );
                }
              }}
            >
              <Switch.HiddenInput />
              <Switch.Control />
            </Switch.Root>
          </SettingsInput>
        </div>
      </GameEngineBox>
    </>
  );
};

export default GeneralSettings;
