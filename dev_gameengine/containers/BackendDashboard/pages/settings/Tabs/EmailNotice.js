import React, { useEffect } from 'react';
import { __ } from "@wordpress/i18n";
import LabeledInput from '@GFComponents/LabeledInput';
import Select from 'react-select';
import { fetchSettings, setEmailField, resetSaveStatus } from '../../../../../redux/Slices/settingsSlice/settingsSlice';
import SettingsInner from '../Components/SettingsInner';
import { useDispatch } from 'react-redux';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { useFormikContext } from 'formik';
const EmailNotice = () => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const {
    email
  } = values;

  // Helper options
  const formatOptions = [{
    label: __('Plain Text', 'gameengine'),
    value: 'plain'
  }, {
    label: __('HTML', 'gameengine'),
    value: 'html'
  }];
  const scheduleOptions = [{
    label: __('Immediate', 'gameengine'),
    value: 'immediate'
  }, {
    label: __('Daily Digest', 'gameengine'),
    value: 'daily'
  }];
  return <SettingsInner heading={__(`Email Notification`, "gameengine")}>
            <div className="flex flex-col gap-4">
                <GameEngineInput label={__("Format", "gameengine")}>
                    <Select className="gameengine-select" classNamePrefix="gameengine-select" placeholder="Choose one" options={formatOptions} value={formatOptions.find(opt => opt?.value === email?.format)} onChange={opt => setFieldValue('email.format', opt.value)} />
                </GameEngineInput>

                <GameEngineInput label={__("Schedule", "gameengine")}>
                    <Select className="gameengine-select" classNamePrefix="gameengine-select" placeholder="Choose one" options={scheduleOptions} value={scheduleOptions.find(opt => opt?.value === email?.schedule)} onChange={opt => setFieldValue('email.schedule', opt.value)} />
                </GameEngineInput>

                <GameEngineInput label={__("From Name", "gameengine")}>
                    <input className="w-full border border-solid border-[var(--gameengine-border-color)] rounded-[6px] px-3 py-2 text-sm bg-white outline-none text-[var(--gameengine-font-color)]" placeholder={__("Enter from name", "gameengine")} value={email?.from_name || ''} onChange={e => setFieldValue('email.from_name', e.target.value)} />
                </GameEngineInput>

                <GameEngineInput label={__("From Address", "gameengine")}>
                    <input className="w-full border border-solid border-[var(--gameengine-border-color)] rounded-[6px] px-3 py-2 text-sm bg-white outline-none text-[var(--gameengine-font-color)]" placeholder={__("Enter from address", "gameengine")} value={email?.from_address || ''} onChange={e => setFieldValue('email.from_address', e.target.value)} />
                </GameEngineInput>

                <GameEngineInput label={__("Default Email Content", "gameengine")}>
                    <textarea placeholder={__("Enter email content", "gameengine")} value={email?.default_content || ''} onChange={e => setFieldValue('email.default_content', e.target.value)} />
                </GameEngineInput>

                <p className="text-xs text-[#718096]" style={{
        "marginTop": "-10px"
      }}>
                    {__('Available placeholders: {user_name}, {level_name}, {site_name}', 'gameengine')}
                </p>
            </div>
        </SettingsInner>;
};
export default EmailNotice;