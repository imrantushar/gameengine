import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { API, namespace } from '@GFUtils/helper';
import Select from 'react-select';
import GameEngineBox from '@GFComponents/GameEngineBox';
import Button from '@GFComponents/Button';

const emptyRow = () => ({ product_id: '', point_type_id: '', amount: '', gift_mode: 'disabled' });

const BuyPointsSettings = () => {
    const { values, setFieldValue } = useFormikContext();
    const [pointTypeOptions, setPointTypeOptions] = useState([]);

    const giftModeOptions = [
        { value: 'disabled', label: __('Disabled (Self Only)', 'gameengine') },
        { value: 'optional', label: __('Optional (Self or Gift)', 'gameengine') },
        { value: 'gift_only', label: __('Gift Only', 'gameengine') },
    ];

    const rawMappings = values?.buy_points?.mappings || {};
    const rows = Array.isArray(rawMappings)
        ? rawMappings
        : Object.entries(rawMappings).map(([product_id, val]) => ({
            product_id,
            point_type_id: Array.isArray(val) ? (val[0] || '') : (val?.point_type_id || ''),
            amount: Array.isArray(val) ? (val[1] || '') : (val?.amount || ''),
            gift_mode: Array.isArray(val) ? (val[2] || 'disabled') : (val?.gift_mode || 'disabled'),
        }));

    const [localRows, setLocalRows] = useState(rows.length > 0 ? rows : [emptyRow()]);

    useEffect(() => {
        API.get(namespace + 'point-types').then(res => {
            const opts = (res.data?.pointTypes || res.data || []).map(pt => ({
                value: pt.id,
                label: pt.name || pt.slug,
            }));
            setPointTypeOptions(opts);
        }).catch(() => {});
    }, []);

    const syncToFormik = (updated) => {
        setLocalRows(updated);
        setFieldValue('buy_points.mappings', updated);
    };

    const addRow = () => syncToFormik([...localRows, emptyRow()]);

    const removeRow = (index) => {
        const updated = localRows.filter((_, i) => i !== index);
        syncToFormik(updated.length > 0 ? updated : [emptyRow()]);
    };

    const updateRow = (index, field, value) => {
        const updated = localRows.map((row, i) =>
            i === index ? { ...row, [field]: value } : row
        );
        syncToFormik(updated);
    };

    return (
        <GameEngineBox dynamicClasses="gameengine-settings overflow-visible" boxShadow="var(--gameengine-shadow)">
            <p className="gameengine-settings-heading">{__('Buy & Gift Points', 'gameengine')}</p>
            <p className="text-sm text-[var(--gameengine-warn-muted)] mb-4">
                {__('Map WooCommerce or StoreEngine products to point awards. Enable gifting to allow buyers to send points to friends via WooCommerce checkout.', 'gameengine')}
            </p>

            <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center text-xs font-semibold text-[var(--gameengine-warn-muted)] px-2">
                    <span style={{ flex: '0 0 120px' }}>{__('Product ID', 'gameengine')}</span>
                    <span style={{ flex: 1 }}>{__('Point Type', 'gameengine')}</span>
                    <span style={{ flex: '0 0 90px' }}>{__('Amount', 'gameengine')}</span>
                    <span style={{ flex: '0 0 180px' }}>{__('Gift Mode', 'gameengine')}</span>
                    <span style={{ flex: '0 0 40px' }}></span>
                </div>

                {localRows.map((row, index) => (
                    <div key={index} className="flex gap-3 items-center">
                        <input
                            type="number"
                            className="gameengine-input"
                            style={{ flex: '0 0 120px' }}
                            value={row.product_id}
                            onChange={(e) => updateRow(index, 'product_id', e.target.value)}
                            placeholder={__('Product ID', 'gameengine')}
                            min="1"
                        />

                        <div style={{ flex: 1 }}>
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                placeholder={__('Select point type…', 'gameengine')}
                                options={pointTypeOptions}
                                value={pointTypeOptions.find(o => Number(o.value) === Number(row.point_type_id)) || null}
                                onChange={(opt) => updateRow(index, 'point_type_id', opt ? opt.value : '')}
                            />
                        </div>

                        <input
                            type="number"
                            className="gameengine-input"
                            style={{ flex: '0 0 90px' }}
                            value={row.amount}
                            onChange={(e) => updateRow(index, 'amount', e.target.value)}
                            placeholder="100"
                            min="1"
                        />

                        <div style={{ flex: '0 0 180px' }}>
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                options={giftModeOptions}
                                value={giftModeOptions.find(o => o.value === (row.gift_mode || 'disabled')) || giftModeOptions[0]}
                                onChange={(opt) => updateRow(index, 'gift_mode', opt ? opt.value : 'disabled')}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            style={{
                                flex: '0 0 40px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--gameengine-placing)',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                padding: '4px',
                            }}
                            title={__('Remove row', 'gameengine')}
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <Button
                    label={__('Add Row', 'gameengine')}
                    icon={<FiPlus size={14} />}
                    preset="secondary"
                    onClick={addRow}
                    type="button"
                />
            </div>
        </GameEngineBox>
    );
};

export default BuyPointsSettings;
