import React from 'react';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { useFormikContext } from 'formik';
import Switch from '@GFComponents/Switch/Switch';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';

const retentionOptions = [
    { label: __('7 Days', 'gameengine'), value: 7 },
    { label: __('30 Days', 'gameengine'), value: 30 },
    { label: __('90 Days', 'gameengine'), value: 90 },
    { label: __('Never', 'gameengine'), value: 0 },
];

const NotificationsSettings = () => {
    const { values, setFieldValue } = useFormikContext();
    const n = values?.notifications || {};

    const set = (field, val) => setFieldValue(`notifications.${field}`, val);

    return (
        <GameEngineBox dynamicClasses="gameengine-settings overflow-visible" boxShadow="var(--gameengine-shadow)">
            <p className="gameengine-settings-heading">{__('Notification Center', 'gameengine')}</p>

            <div className="flex flex-col gap-4">
                <SettingsInput
                    label={__('Enable Notifications', 'gameengine')}
                    subtitle={__('Master toggle for the in-admin notification center.', 'gameengine')}
                >
                    <Switch
                        checked={!!n.enabled}
                        onChange={(val) => set('enabled', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Points Awarded', 'gameengine')}
                    subtitle={__('Notify users when they earn points.', 'gameengine')}
                >
                    <Switch
                        checked={!!n.notify_points_added}
                        onChange={(val) => set('notify_points_added', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Points Deducted', 'gameengine')}
                    subtitle={__('Notify users when points are deducted from their balance.', 'gameengine')}
                >
                    <Switch
                        checked={!!n.notify_points_deducted}
                        onChange={(val) => set('notify_points_deducted', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Achievement Unlocked', 'gameengine')}
                    subtitle={__('Notify users when they unlock an achievement.', 'gameengine')}
                >
                    <Switch
                        checked={!!n.notify_achievement}
                        onChange={(val) => set('notify_achievement', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Level Up', 'gameengine')}
                    subtitle={__('Notify users when they advance to a new level.', 'gameengine')}
                >
                    <Switch
                        checked={!!n.notify_level_up}
                        onChange={(val) => set('notify_level_up', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('New Rank Earned', 'gameengine')}
                    subtitle={__('Notify users when they earn a new rank.', 'gameengine')}
                >
                    <Switch
                        checked={!!n.notify_rank}
                        onChange={(val) => set('notify_rank', val)}
                    />
                </SettingsInput>

                <SettingsInput
                    label={__('Auto Cleanup After', 'gameengine')}
                    subtitle={__('Automatically delete old notifications to keep the database lean.', 'gameengine')}
                >
                    <Select
                        className="gameengine-select gameengine-select--300"
                        classNamePrefix="gameengine-select"
                        options={retentionOptions}
                        value={retentionOptions.find(o => Number(o.value) === Number(n.retention_days)) || retentionOptions[1]}
                        onChange={(opt) => set('retention_days', opt.value)}
                        menuPlacement="auto"
                    />
                </SettingsInput>
            </div>
        </GameEngineBox>
    );
};

export default NotificationsSettings;
