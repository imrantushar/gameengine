import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Switch from '@GFComponents/Switch/Switch';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';

const ProTransferSettings = () => {
    const { values, setFieldValue } = useFormikContext();
    const t = values?.transfer || {};

    const set = (field, val) => setFieldValue(`transfer.${field}`, val);

    return (
        <GameEngineBox dynamicClasses="gameengine-settings overflow-visible" boxShadow="var(--gameengine-shadow)">
            <p className="gameengine-settings-heading">{__('Points Transfer', 'gameengine')}</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                {__('Allow users to send points to each other directly from their profile.', 'gameengine')}
            </p>
            <div className="flex flex-col gap-4">
                <SettingsInput
                    label={__('Enable Point Transfers', 'gameengine')}
                    subtitle={__('Show the "Send Points" form on user profile pages.', 'gameengine')}
                >
                    <Switch
                        checked={!!t.enable_transfer}
                        onChange={(val) => set('enable_transfer', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Daily Transfer Limit', 'gameengine')}
                    subtitle={__('Maximum total points a user can send per day (0 = no limit).', 'gameengine')}
                >
                    <input
                        type="number"
                        min="0"
                        className="gameengine-input"
                        style={{ width: '160px' }}
                        value={t.daily_limit ?? 0}
                        onChange={(e) => set('daily_limit', parseInt(e.target.value, 10) || 0)}
                        disabled={!t.enable_transfer}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Minimum Sender Balance', 'gameengine')}
                    subtitle={__('Points the sender must keep in their account after a transfer.', 'gameengine')}
                >
                    <input
                        type="number"
                        min="0"
                        className="gameengine-input"
                        style={{ width: '160px' }}
                        value={t.min_sender_balance ?? 0}
                        onChange={(e) => set('min_sender_balance', parseInt(e.target.value, 10) || 0)}
                        disabled={!t.enable_transfer}
                    />
                </SettingsInput>
            </div>
        </GameEngineBox>
    );
};

export default ProTransferSettings;
