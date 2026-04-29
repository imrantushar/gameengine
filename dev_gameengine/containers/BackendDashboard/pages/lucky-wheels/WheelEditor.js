import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { route_path } from '@GFUtils/helper';
import { Formik, FieldArray } from 'formik';
import TopBar from '@GFComponents/TopBar';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import GameEngineInput from '@GFComponents/GameEngineInput';
import Button from '@GFComponents/Button';
import { commonInput } from '../../../../../assets/scss/chakra/recipe';

const DEFAULT_SLICES = [
    { label: '10 Points', type: 'points', amount: 10, prob: 50, color: '#3498db' },
    { label: 'Try Again', type: 'empty', amount: 0, prob: 50, color: '#e74c3c' },
];

const DEFAULT_VALUES = {
    name: '',
    spin_cost: 0,
    daily_limit: 0,
    cooldown_timer: 0,
    settings: {
        who_can_play: 'all',
        allowed_roles: '',
        ip_limit: 0,
        jackpot_limit: 0,
        collect_email: false,
    },
    slices: DEFAULT_SLICES,
};

export default function WheelEditor({ action }) {
    const navigate   = useNavigate();
    const dispatch   = useDispatch();
    const [searchParams] = useSearchParams();

    // Read editId directly from URL (same as PointTypeEditor)
    const editId = searchParams.get('id');

    const [values, setValues]   = useState(DEFAULT_VALUES);
    const [loading, setLoading] = useState(!!editId);

    // Fetch wheel when editId is present
    useEffect(() => {
        if (!editId) return;

        setLoading(true);
        fetch(window.GameEngineGlobal.rest_url + 'gameengine/v1/lucky-wheels', {
            headers: { 'X-WP-Nonce': window.GameEngineGlobal.nonce },
        })
            .then(r => r.json())
            .then(wheels => {
                if (!Array.isArray(wheels)) return;
                const wheel = wheels.find(w => String(w.id) === String(editId));
                if (!wheel) return;

                let slices = wheel.slices;
                if (typeof slices === 'string') {
                    try { slices = JSON.parse(slices); } catch (_) { slices = []; }
                }
                if (!Array.isArray(slices)) slices = [];

                const def = (v, fallback) => (v !== null && v !== undefined && v !== '') ? Number(v) : fallback;
                setValues({
                    name:           wheel.name          || '',
                    spin_cost:      def(wheel.spin_cost, 0),
                    daily_limit:    def(wheel.daily_limit, 0),
                    cooldown_timer: def(wheel.cooldown_timer, 0),
                    settings:       {
                        who_can_play: wheel.settings?.who_can_play || 'all',
                        allowed_roles: Array.isArray(wheel.settings?.allowed_roles) ? wheel.settings.allowed_roles.join(', ') : '',
                        ip_limit: def(wheel.settings?.ip_limit, 0),
                        jackpot_limit: def(wheel.settings?.jackpot_limit, 0),
                        collect_email: !!wheel.settings?.collect_email,
                    },
                    slices,
                });
            })
            .catch(err => console.error('Wheel fetch error:', err))
            .finally(() => setLoading(false));
    }, [editId]);

    // ────────── save ──────────
    const handleSubmit = async (formValues, { setSubmitting }) => {
        try {
            let parsedSettings = { ...formValues.settings };
            if (typeof parsedSettings.allowed_roles === 'string') {
                parsedSettings.allowed_roles = parsedSettings.allowed_roles.split(',').map(s => s.trim()).filter(s => s);
            }

            const payload = {
                ...formValues,
                settings: parsedSettings,
                id: editId ? parseInt(editId, 10) : 0,
            };

            const res = await fetch(
                window.GameEngineGlobal.rest_url + 'gameengine/v1/lucky-wheels',
                {
                    method:  'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce':   window.GameEngineGlobal.nonce,
                    },
                    body: JSON.stringify(payload),
                }
            );
            const result = await res.json();

            if (result && result.id) {
                dispatch(showNotification({
                    message: __('Lucky Wheel saved successfully.', 'gameengine'),
                    isShow:  true,
                    type:    'success',
                }));
                navigate(`${route_path}admin.php?page=gameengine-lucky-wheels`);
            } else {
                throw new Error(result.message || 'Unknown error');
            }
        } catch (err) {
            console.error('Save error:', err);
            dispatch(showNotification({
                message: __('Failed to save wheel. Check console for details.', 'gameengine'),
                isShow:  true,
                type:    'error',
            }));
        } finally {
            setSubmitting(false);
        }
    };

    // ────────── loading state ──────────
    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '300px' }}>
                <p>{__('Loading\u2026', 'gameengine')}</p>
            </div>
        );
    }

    // ────────── render ──────────
    return (
        <Formik
            initialValues={values}
            onSubmit={handleSubmit}
            enableReinitialize   /* safe here – values state changes only once after fetch */
        >
            {({ values: fv, handleChange, setFieldValue, handleSubmit: fSubmit, isSubmitting }) => (
                <>
                    {/* ── Top bar ── */}
                    <TopBar
                        path={editId
                            ? __('Edit Lucky Wheel', 'gameengine')
                            : __('Add New Lucky Wheel', 'gameengine')}
                        rightContent={
                            <div className="flex gap-3">
                                <button
                                    style={{ background: 'transparent', border: '1px solid var(--gameengine-border-color)', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}
                                    onClick={() => navigate(`${route_path}admin.php?page=gameengine-lucky-wheels`)}
                                >
                                    {__('Cancel', 'gameengine')}
                                </button>
                                <Button
                                    label={editId ? __('Update Wheel', 'gameengine') : __('Save Wheel', 'gameengine')}
                                    isLoading={isSubmitting}
                                    onClick={fSubmit}
                                />
                            </div>
                        }
                    />

                    {/* ── Page body ── */}
                    <div className="gameengine-page-content">
                        <div className="flex flex-col lg:flex-row gap-6 mt-6">

                            {/* ── General Settings ── */}
                            <div className="flex-1">
                                <GameEngineBox heading={__('General Settings', 'gameengine')}>
                                    <div className="flex flex-col gap-4">

                                        <GameEngineInput label={__('Wheel Name', 'gameengine')}>
                                            <input
                                                className="gameengine-input"
                                                style={commonInput}
                                                name="name"
                                                value={fv.name}
                                                onChange={handleChange}
                                                placeholder={__('e.g. Daily Spin', 'gameengine')}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Spin Cost (Points)', 'gameengine')}>
                                            <input
                                                className="gameengine-input"
                                                style={commonInput}
                                                type="number"
                                                name="spin_cost"
                                                value={fv.spin_cost}
                                                onChange={handleChange}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Daily Limit (0 = unlimited)', 'gameengine')}>
                                            <input
                                                className="gameengine-input"
                                                style={commonInput}
                                                type="number"
                                                name="daily_limit"
                                                value={fv.daily_limit}
                                                onChange={handleChange}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Cooldown (seconds)', 'gameengine')}>
                                            <input
                                                className="gameengine-input"
                                                style={commonInput}
                                                type="number"
                                                name="cooldown_timer"
                                                value={fv.cooldown_timer}
                                                onChange={handleChange}
                                            />
                                        </GameEngineInput>

                                    </div>
                                </GameEngineBox>

                                <div className="mt-6">
                                <GameEngineBox heading={__('Rules & Security', 'gameengine')}>
                                    <div className="flex flex-col gap-4">
                                        <GameEngineInput label={__('Who Can Play', 'gameengine')}>
                                            <select
                                                name="settings.who_can_play"
                                                value={fv.settings?.who_can_play}
                                                onChange={handleChange}
                                                style={{
                                                    width:           '100%',
                                                    height:          '40px',
                                                    padding:         '0 10px',
                                                    borderRadius:    '4px',
                                                    border:          '1px solid #e2e8f0',
                                                    backgroundColor: 'white',
                                                    fontSize:        '14px',
                                                }}
                                            >
                                                <option value="all">{__('Everyone (Guests & Logged In)', 'gameengine')}</option>
                                                <option value="logged_in">{__('Logged In Users Only', 'gameengine')}</option>
                                                <option value="specific_roles">{__('Specific Roles Only', 'gameengine')}</option>
                                            </select>
                                        </GameEngineInput>

                                        {fv.settings?.who_can_play === 'specific_roles' && (
                                            <GameEngineInput label={__('Allowed Roles (comma separated)', 'gameengine')}>
                                                <input
                                                    className="gameengine-input"
                                                    style={commonInput}
                                                    name="settings.allowed_roles"
                                                    value={fv.settings?.allowed_roles || ''}
                                                    onChange={handleChange}
                                                    placeholder={__('e.g. subscriber, customer', 'gameengine')}
                                                />
                                            </GameEngineInput>
                                        )}

                                        <GameEngineInput label={__('IP Daily Limit (0 = unlimited)', 'gameengine')}>
                                            <input
                                                className="gameengine-input"
                                                style={commonInput}
                                                type="number"
                                                name="settings.ip_limit"
                                                value={fv.settings?.ip_limit}
                                                onChange={handleChange}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Jackpot Minimum Spins', 'gameengine')}>
                                            <input
                                                className="gameengine-input"
                                                style={commonInput}
                                                type="number"
                                                name="settings.jackpot_limit"
                                                value={fv.settings?.jackpot_limit}
                                                onChange={handleChange}
                                            />
                                            <p className="text-xs text-gray-500 mt-1 m-0">
                                                {__('Require this many total spins before a jackpot (is_jackpot=true) can be won.', 'gameengine')}
                                            </p>
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Collect Guest Email?', 'gameengine')}>
                                            <div style={{ marginTop: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    name="settings.collect_email"
                                                    checked={!!fv.settings?.collect_email}
                                                    onChange={handleChange}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                                <span className="ml-2 text-sm align-top">
                                                    {__('Ask guest users for their email before spinning.', 'gameengine')}
                                                </span>
                                            </div>
                                        </GameEngineInput>
                                    </div>
                                </GameEngineBox>
                                </div>
                            </div>

                            {/* ── Wheel Slices ── */}
                            <div style={{ flex: 2 }}>
                                <FieldArray name="slices">
                                    {({ remove, push }) => (
                                        <GameEngineBox>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-semibold text-sm">
                                                    {__('Wheel Slices', 'gameengine')}
                                                </span>
                                                <Button
                                                    label={__('+ Add Slice', 'gameengine')}
                                                    onClick={() => push({
                                                        label:  'New Prize',
                                                        type:   'points',
                                                        amount: 10,
                                                        prob:   0,
                                                        color:  '#3498db',
                                                        is_jackpot: false,
                                                    })}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                {fv.slices && fv.slices.map((slice, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 border border-gray-200 rounded-md bg-gray-50 relative"
                                                    >
                                                        <button
                                                            type="button"
                                                            className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                                                            onClick={() => remove(index)}
                                                        >
                                                            {__('Delete', 'gameengine')}
                                                        </button>

                                                        <div
                                                            className="grid gap-4 items-start pr-10"
                                                            style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.6fr) minmax(0,0.8fr)' }}
                                                        >
                                                            {/* Label */}
                                                            <div>
                                                                <GameEngineInput label={__('Label', 'gameengine')}>
                                                                    <input
                                                                        className="gameengine-input"
                                                                        style={commonInput}
                                                                        name={`slices.${index}.label`}
                                                                        value={slice.label}
                                                                        onChange={handleChange}
                                                                    />
                                                                </GameEngineInput>
                                                            </div>

                                                            {/* Type */}
                                                            <div>
                                                                <GameEngineInput label={__('Type', 'gameengine')}>
                                                                    <select
                                                                        name={`slices.${index}.type`}
                                                                        value={slice.type}
                                                                        onChange={handleChange}
                                                                        style={{
                                                                            width:           '100%',
                                                                            height:          '32px',
                                                                            padding:         '0 8px',
                                                                            borderRadius:    '6px',
                                                                            border:          '1px solid #E2E8F0',
                                                                            backgroundColor: 'white',
                                                                            fontSize:        '13px',
                                                                            outline:         'none'
                                                                        }}
                                                                    >
                                                                        <option value="points">{__('Add Points', 'gameengine')}</option>
                                                                        <option value="deduct">{__('Deduct Points', 'gameengine')}</option>
                                                                        <option value="empty">{__('Try Again', 'gameengine')}</option>
                                                                        <option value="coupon">{__('Coupon', 'gameengine')}</option>
                                                                    </select>
                                                                </GameEngineInput>
                                                            </div>

                                                            {/* Amount / Coupon Code */}
                                                            <div>
                                                                <GameEngineInput label={slice.type === 'coupon' ? __('Code', 'gameengine') : __('Amount', 'gameengine')}>
                                                                    <input
                                                                        className="gameengine-input"
                                                                        style={commonInput}
                                                                        type={slice.type === 'coupon' ? 'text' : 'number'}
                                                                        name={`slices.${index}.amount`}
                                                                        value={slice.amount}
                                                                        onChange={handleChange}
                                                                        placeholder={slice.type === 'coupon' ? 'CODE' : '0'}
                                                                    />
                                                                </GameEngineInput>
                                                            </div>

                                                            {/* Probability */}
                                                            <div>
                                                                <GameEngineInput label={__('Prob (%)', 'gameengine')}>
                                                                    <input
                                                                        className="gameengine-input"
                                                                        style={commonInput}
                                                                        type="number"
                                                                        name={`slices.${index}.prob`}
                                                                        value={slice.prob}
                                                                        onChange={handleChange}
                                                                    />
                                                                </GameEngineInput>
                                                            </div>

                                                            {/* Color */}
                                                            <div>
                                                                <GameEngineInput label={__('Color', 'gameengine')}>
                                                                    <div
                                                                        className="relative overflow-hidden rounded-md border border-gray-200"
                                                                        style={{ height: '32px', width: '100%' }}
                                                                    >
                                                                        <input
                                                                            type="color"
                                                                            name={`slices.${index}.color`}
                                                                            value={slice.color}
                                                                            onChange={handleChange}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '-5px',
                                                                                left: '-5px',
                                                                                width: 'calc(100% + 10px)',
                                                                                height: 'calc(100% + 10px)',
                                                                                padding: 0,
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </GameEngineInput>
                                                            </div>

                                                            {/* Is Jackpot */}
                                                            <div className="text-center">
                                                                <GameEngineInput label={__('Jackpot?', 'gameengine')}>
                                                                    <div className="flex justify-center items-center" style={{ height: '32px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            name={`slices.${index}.is_jackpot`}
                                                                            checked={!!slice.is_jackpot}
                                                                            onChange={(e) => setFieldValue(`slices.${index}.is_jackpot`, e.target.checked)}
                                                                            style={{ 
                                                                                width: '18px', 
                                                                                height: '18px', 
                                                                                cursor: 'pointer',
                                                                                accentColor: '#3182ce'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </GameEngineInput>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Total probability indicator */}
                                                <div className="mt-1">
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            fv.slices.reduce((a, s) => a + (parseInt(s.prob) || 0), 0) === 100
                                                                ? 'text-green-500'
                                                                : 'text-orange-500'
                                                        }`}
                                                    >
                                                        {__('Total Probability:', 'gameengine')}{' '}
                                                        {fv.slices.reduce((a, s) => a + (parseInt(s.prob) || 0), 0)}%
                                                        {fv.slices.reduce((a, s) => a + (parseInt(s.prob) || 0), 0) !== 100
                                                            ? __(' (must equal 100%)', 'gameengine')
                                                            : ' ✓'}
                                                    </span>
                                                </div>
                                            </div>
                                        </GameEngineBox>
                                    )}
                                </FieldArray>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </Formik>
    );
}
