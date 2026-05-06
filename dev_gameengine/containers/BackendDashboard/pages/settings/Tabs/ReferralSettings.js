import React from 'react';
import Switch from '@GFComponents/Switch/Switch';
import { __ } from "@wordpress/i18n";
import { FaLock } from 'react-icons/fa6';
import Select from "react-select";
import { useFormikContext } from 'formik';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { is_pro } from '@GFUtils/helper';

const cookieExpiryOptions = [
    { label: __('7 Days', 'gameengine'),  value: '7' },
    { label: __('14 Days', 'gameengine'), value: '14' },
    { label: __('30 Days', 'gameengine'), value: '30' },
    { label: __('60 Days', 'gameengine'), value: '60' },
    { label: __('90 Days', 'gameengine'), value: '90' },
];

const fraudDetectionTimeframeOptions = [
    { label: __('1 Hour', 'gameengine'),  value: '1' },
    { label: __('6 Hours', 'gameengine'), value: '6' },
    { label: __('12 Hours', 'gameengine'), value: '12' },
    { label: __('24 Hours (1 Day)', 'gameengine'), value: '24' },
    { label: __('72 Hours (3 Days)', 'gameengine'), value: '72' },
    { label: __('1 Week', 'gameengine'), value: '168' },
];

const ReferralSettings = () => {
    const { values, setFieldValue } = useFormikContext();
    const referral = values?.referral || {};
    const isDisabled = !is_pro;

    return (
        <div className="w-full">
            <GameEngineBox dynamicClasses='gameengine-settings overflow-visible shadow-[var(--gameengine-shadow)]'>
                <p className='gameengine-settings-heading'>
                    {__("Referral System", "gameengine")}
                </p>

                {!is_pro && (
                    <div className="flex items-center gap-2 mb-4">
                        <FaLock size="16px" color='#f97316' />
                        <p className="text-xs text-[var(--gameengine-primary)] m-0">
                            {__("Referral settings are available in GameEngine Pro only.", "gameengine")}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {/* Enable / Disable */}
                    <SettingsInput
                        label={__("Enable Referral System", "gameengine")}
                        subtitle={__('Turn the entire referral & affiliate tracking system on or off.', 'gameengine')}
                    >
                        <Switch
                            checked={referral?.enabled === 'yes'}
                            disabled={isDisabled}
                            onChange={(val) => setFieldValue('referral.enabled', val ? 'yes' : 'no')}
                        />
                    </SettingsInput>

                    {/* Referral URL Slug */}
                    <SettingsInput
                        label={__("Referral URL Parameter", "gameengine")}
                        subtitle={__('The query parameter used in referral links (e.g. "ref" → ?ref=username). Avoid spaces or special characters.', 'gameengine')}
                    >
                        <input className="max-w-[300px] rounded-[6px] text-sm border border-solid border-[var(--gameengine-border-color)] px-3 py-1.5 outline-none bg-white text-[var(--gameengine-font-color)]"
                            value={referral?.referral_slug || 'ref'}
                            onChange={(e) => setFieldValue('referral.referral_slug', e.target.value.trim())}
                            placeholder="ref"
                            disabled={isDisabled}
                        />
                    </SettingsInput>

                    {/* Cookie Expiry */}
                    <SettingsInput
                        label={__("Cookie Expiry", "gameengine")}
                        subtitle={__('How long the referral tracking cookie stays active in the visitor\'s browser after clicking a referral link.', 'gameengine')}
                    >
                        <Select
                            className="gameengine-select gameengine-select--300"
                            classNamePrefix="gameengine-select"
                            options={cookieExpiryOptions}
                            value={cookieExpiryOptions.find(opt => opt.value === String(referral?.cookie_expiry)) || cookieExpiryOptions[2]}
                            onChange={(option) => setFieldValue('referral.cookie_expiry', option.value)}
                            isDisabled={isDisabled}
                            menuPlacement="auto"
                        />
                    </SettingsInput>
                </div>
            </GameEngineBox>

            {/* Reward Settings */}
            <GameEngineBox dynamicClasses='gameengine-settings mt-6 overflow-visible shadow-[var(--gameengine-shadow)]'>
                <p className='gameengine-settings-heading'>
                    {__("Reward Settings", "gameengine")}
                </p>

                <div className="flex flex-col gap-4">
                    {/* Signup Points */}
                    <SettingsInput
                        label={__("Points Per Successful Signup", "gameengine")}
                        subtitle={__('Default points awarded to the referrer when someone registers using their link. This is the fallback value — you can configure exact rewards in the Triggers section.', 'gameengine')}
                    >
                        <input 
                            className="gameengine-input"
                            type="number"
                            min={0}
                            value={referral?.signup_reward || '50'}
                            onChange={(e) => setFieldValue('referral.signup_reward', e.target.value)}
                            placeholder="50"
                            disabled={isDisabled}
                        />
                    </SettingsInput>
                </div>
            </GameEngineBox>

            {/* Fraud Detection Settings */}
            <GameEngineBox dynamicClasses='gameengine-settings mt-6 overflow-visible shadow-[var(--gameengine-shadow)]'>
                <p className="gameengine-settings-heading">
                    {__("🛡️ Fraud Detection", "gameengine")}
                </p>

                <div className="flex flex-col gap-4">
                    {/* Enable Fraud Detection */}
                    <SettingsInput
                        label={__("Enable Fraud Detection", "gameengine")}
                        subtitle={__('Monitor and flag suspicious referral patterns like multiple account signups from the same IP address.', 'gameengine')}
                    >
                        <Switch
                            checked={referral?.fraud_detection_enabled === 'yes'}
                            disabled={isDisabled}
                            onChange={(val) => setFieldValue('referral.fraud_detection_enabled', val ? 'yes' : 'no')}
                        />
                    </SettingsInput>

                    {/* Max Accounts Per IP */}
                    <SettingsInput
                        label={__("Max Accounts Per IP Address", "gameengine")}
                        subtitle={__('Maximum number of new accounts allowed from the same IP address within the specified timeframe. Exceeding this triggers a fraud alert.', 'gameengine')}
                    >
                        <input 
                            className="gameengine-input"
                            type="number"
                            min={1}
                            value={referral?.fraud_detection_max_accounts || '3'}
                            onChange={(e) => setFieldValue('referral.fraud_detection_max_accounts', e.target.value)}
                            placeholder="3"
                            disabled={isDisabled}
                        />
                    </SettingsInput>

                    {/* Fraud Detection Timeframe */}
                    <SettingsInput
                        label={__("Fraud Detection Timeframe", "gameengine")}
                        subtitle={__('Time window to check for multiple signups from the same IP (e.g., if set to 24 hours, any IP creating 4+ accounts in a day will be flagged).', 'gameengine')}
                    >
                        <Select
                            className="gameengine-select gameengine-select--300"
                            classNamePrefix="gameengine-select"
                            options={fraudDetectionTimeframeOptions}
                            value={fraudDetectionTimeframeOptions.find(opt => opt.value === String(referral?.fraud_detection_timeframe)) || fraudDetectionTimeframeOptions[3]}
                            onChange={(option) => setFieldValue('referral.fraud_detection_timeframe', option.value)}
                            isDisabled={isDisabled}
                            menuPlacement="auto"
                        />
                    </SettingsInput>
                </div>
            </GameEngineBox>
        </div>
    );
};

export default ReferralSettings;
