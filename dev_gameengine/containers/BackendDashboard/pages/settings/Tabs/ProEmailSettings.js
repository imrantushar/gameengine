import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Switch from '@GFComponents/Switch/Switch';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';

const ProEmailSettings = () => {
    const { values, setFieldValue } = useFormikContext();
    const en = values?.email_notifications || {};

    const set = (field, val) => setFieldValue(`email_notifications.${field}`, val);

    const events = [
        {
            key: 'rank_achieved',
            label: __('Rank Achieved', 'gameengine'),
            desc: __('Email the user when they reach a new rank.', 'gameengine'),
        },
        {
            key: 'achievement_unlocked',
            label: __('Achievement Unlocked', 'gameengine'),
            desc: __('Email the user when they unlock an achievement.', 'gameengine'),
        },
        {
            key: 'streak_milestone',
            label: __('Streak Milestone', 'gameengine'),
            desc: __('Email the user when they hit a streak milestone.', 'gameengine'),
        },
        {
            key: 'streak_broken',
            label: __('Streak Broken', 'gameengine'),
            desc: __('Email the user when their streak is reset.', 'gameengine'),
        },
    ];

    return (
        <GameEngineBox dynamicClasses="gameengine-settings overflow-visible" boxShadow="var(--gameengine-shadow)">
            <p className="gameengine-settings-heading">{__('Email Notifications', 'gameengine')}</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                {__('Automatically email users when gamification events occur. Uses your site\'s default WordPress mail settings.', 'gameengine')}
            </p>
            <div className="flex flex-col gap-4">
                {events.map(({ key, label, desc }) => (
                    <SettingsInput key={key} label={label} subtitle={desc}>
                        <Switch
                            checked={!!en[key]}
                            onChange={(val) => set(key, val)}
                        />
                    </SettingsInput>
                ))}
            </div>
        </GameEngineBox>
    );
};

export default ProEmailSettings;
