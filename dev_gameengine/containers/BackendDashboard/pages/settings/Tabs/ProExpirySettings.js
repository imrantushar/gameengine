import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { API, namespace } from '@GFUtils/helper';

const ProExpirySettings = () => {
    const { values, setFieldValue } = useFormikContext();
    const expiry = values?.expiry || {};
    const [pointTypes, setPointTypes] = useState([]);

    useEffect(() => {
        API.get(namespace + 'point-types').then((res) => {
            setPointTypes(res.data || []);
        }).catch(() => {});
    }, []);

    return (
        <GameEngineBox dynamicClasses="gameengine-settings overflow-visible" boxShadow="var(--gameengine-shadow)">
            <p className="gameengine-settings-heading">{__('Points Expiry', 'gameengine')}</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                {__('Set how many days before earned points expire. Enter 0 to disable expiry for a point type. Expired points are deducted automatically by a daily background job.', 'gameengine')}
            </p>
            <div className="flex flex-col gap-4">
                {pointTypes.length === 0 && (
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>{__('Loading point types…', 'gameengine')}</p>
                )}
                {pointTypes.map((pt) => {
                    const ptId = pt.id;
                    const days = expiry[ptId] !== undefined ? expiry[ptId] : 0;
                    return (
                        <SettingsInput
                            key={ptId}
                            label={pt.title || __('Point Type', 'gameengine')}
                            subtitle={__('Days until points expire (0 = no expiry).', 'gameengine')}
                        >
                            <input
                                type="number"
                                min="0"
                                className="gameengine-input"
                                style={{ width: '120px' }}
                                value={days}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    setFieldValue(`expiry.${ptId}`, val);
                                }}
                            />
                        </SettingsInput>
                    );
                })}
            </div>
        </GameEngineBox>
    );
};

export default ProExpirySettings;
