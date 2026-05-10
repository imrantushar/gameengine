import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
import { API, namespace } from '@GFUtils/helper';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_RULE = {
    name: '',
    point_type_id: null,
    hook_key: '',
    conditions: {},
    bonus_type: 'fixed',
    bonus_value: 0,
    active: true,
};

const BonusRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_RULE);
    const [pointTypes, setPointTypes] = useState([]);
    const [availableHooks, setAvailableHooks] = useState([]);

    const fetchAll = () => {
        setLoading(true);
        API.get(namespace + 'pro/bonus-rules')
            .then(res => setRules(res.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAll();
        API.get(namespace + 'point-types').then(r => setPointTypes(r.data || [])).catch(() => {});
        API.get(namespace + 'tools/available-hooks').then(r => setAvailableHooks(r.data || [])).catch(() => {});
    }, []);

    const openCreate = () => { setForm({ ...EMPTY_RULE, conditions: {} }); setModal('create'); };
    const openEdit = (rule) => { setForm({ ...rule, conditions: rule.conditions || {} }); setModal('edit'); };

    const closeModal = () => { setModal(null); setForm(EMPTY_RULE); };

    const setCondition = (key, val) => setForm(f => ({ ...f, conditions: { ...f.conditions, [key]: val } }));
    const clearCondition = (key) => setForm(f => {
        const c = { ...f.conditions };
        delete c[key];
        return { ...f, conditions: c };
    });

    const saveRule = async () => {
        setSaving(true);
        try {
            if (modal === 'create') {
                await API.post(namespace + 'pro/bonus-rules', form);
            } else {
                await API.put(namespace + 'pro/bonus-rules/' + form.id, form);
            }
            fetchAll();
            closeModal();
        } catch (e) {
            console.warn(e);
        } finally {
            setSaving(false);
        }
    };

    const deleteRule = async (id) => {
        if (!window.confirm(__('Delete this rule?', 'gameengine'))) return;
        await API.delete(namespace + 'pro/bonus-rules/' + id);
        fetchAll();
    };

    const toggleActive = async (rule) => {
        await API.put(namespace + 'pro/bonus-rules/' + rule.id, { ...rule, active: !rule.active });
        fetchAll();
    };

    const conditionsLabel = (c) => {
        if (!c || !Object.keys(c).length) return __('None', 'gameengine');
        return Object.keys(c).join(', ');
    };

    return (
        <>
            <TopBar path={__('Bonus Rules', 'gameengine')} rightContent={
                <Button label={__('+ New Rule', 'gameengine')} onClick={openCreate} />
            } />
            <div className="gameengine-page-content">
                <h2 className="gameengine-page-heading py-6">{__('Conditional Bonus Rules', 'gameengine')}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    {__('Add point multipliers or bonuses based on conditions like user role, day of week, or first-time action.', 'gameengine')}
                </p>

                {loading ? (
                    <p style={{ color: '#94a3b8' }}>{__('Loading…', 'gameengine')}</p>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Name', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Hook / Trigger', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Conditions', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Bonus', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Active', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map(rule => (
                                    <tr key={rule.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px 16px', fontWeight: '500' }}>{rule.name}</td>
                                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{rule.hook_key || __('All', 'gameengine')}</td>
                                        <td style={{ padding: '10px 16px', color: '#64748b' }}>{conditionsLabel(rule.conditions)}</td>
                                        <td style={{ padding: '10px 16px' }}>
                                            {rule.bonus_type === 'percent' ? `+${rule.bonus_value}%` : `+${rule.bonus_value} pts`}
                                        </td>
                                        <td style={{ padding: '10px 16px' }}>
                                            <button
                                                onClick={() => toggleActive(rule)}
                                                style={{ background: rule.active ? '#10b981' : '#e2e8f0', color: rule.active ? '#fff' : '#64748b', border: 'none', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                {rule.active ? __('On', 'gameengine') : __('Off', 'gameengine')}
                                            </button>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <button onClick={() => openEdit(rule)} style={{ marginRight: '8px', cursor: 'pointer', background: 'none', border: 'none', color: '#6c5ce7', fontWeight: '500' }}>{__('Edit', 'gameengine')}</button>
                                            <button onClick={() => deleteRule(rule.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: '500' }}>{__('Delete', 'gameengine')}</button>
                                        </td>
                                    </tr>
                                ))}
                                {rules.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8' }}>{__('No bonus rules yet.', 'gameengine')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', width: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,.15)' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '17px' }}>
                            {modal === 'create' ? __('New Bonus Rule', 'gameengine') : __('Edit Bonus Rule', 'gameengine')}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Rule Name', 'gameengine')}
                                <input className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </label>

                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Hook Key / Trigger (leave blank for any)', 'gameengine')}
                                {availableHooks.length > 0 ? (
                                    <select className="gameengine-input" style={{ marginTop: '4px', width: '100%' }}
                                        value={form.hook_key}
                                        onChange={e => setForm(f => ({ ...f, hook_key: e.target.value }))}>
                                        <option value="">{__('— Any hook —', 'gameengine')}</option>
                                        {availableHooks.map((h, i) => (
                                            <option key={i} value={h.hook_key}>{h.label || h.hook_key}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} value={form.hook_key}
                                        onChange={e => setForm(f => ({ ...f, hook_key: e.target.value }))} placeholder="e.g. publish_post" />
                                )}
                            </label>

                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Point Type (leave blank for all)', 'gameengine')}
                                <select className="gameengine-input" style={{ marginTop: '4px', width: '100%' }}
                                    value={form.point_type_id || ''}
                                    onChange={e => setForm(f => ({ ...f, point_type_id: e.target.value ? parseInt(e.target.value) : null }))}>
                                    <option value="">{__('— All point types —', 'gameengine')}</option>
                                    {pointTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.title}</option>)}
                                </select>
                            </label>

                            <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                                <legend style={{ fontSize: '13px', fontWeight: '600', padding: '0 6px' }}>{__('Conditions', 'gameengine')}</legend>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '10px' }}>
                                    <input type="checkbox"
                                        checked={!!form.conditions.is_first_time}
                                        onChange={e => e.target.checked ? setCondition('is_first_time', true) : clearCondition('is_first_time')} />
                                    {__('First time performing this action', 'gameengine')}
                                </label>

                                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>{__('Day of week (any day if none selected):', 'gameengine')}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                    {DAYS.map(day => (
                                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                            <input type="checkbox"
                                                checked={(form.conditions.day_of_week || []).includes(day)}
                                                onChange={e => {
                                                    const curr = form.conditions.day_of_week || [];
                                                    if (e.target.checked) {
                                                        setCondition('day_of_week', [...curr, day]);
                                                    } else {
                                                        const next = curr.filter(d => d !== day);
                                                        next.length ? setCondition('day_of_week', next) : clearCondition('day_of_week');
                                                    }
                                                }} />
                                            {day.slice(0, 3)}
                                        </label>
                                    ))}
                                </div>

                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{__('Required user role (blank = any role):', 'gameengine')}</label>
                                <input className="gameengine-input" style={{ width: '100%' }}
                                    placeholder="subscriber, editor…"
                                    value={form.conditions.user_role || ''}
                                    onChange={e => e.target.value ? setCondition('user_role', e.target.value) : clearCondition('user_role')} />
                            </fieldset>

                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>{__('Bonus Type', 'gameengine')}</div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {['fixed', 'percent'].map(t => (
                                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                            <input type="radio" name="bonus_type" value={t} checked={form.bonus_type === t}
                                                onChange={() => setForm(f => ({ ...f, bonus_type: t }))} />
                                            {t === 'fixed' ? __('Fixed Points', 'gameengine') : __('Percent Multiplier', 'gameengine')}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {form.bonus_type === 'percent' ? __('Bonus %', 'gameengine') : __('Bonus Points', 'gameengine')}
                                <input type="number" min="0" className="gameengine-input" style={{ marginTop: '4px', width: '120px', display: 'block' }}
                                    value={form.bonus_value}
                                    onChange={e => setForm(f => ({ ...f, bonus_value: parseInt(e.target.value, 10) || 0 }))} />
                            </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                            <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>{__('Cancel', 'gameengine')}</button>
                            <Button label={modal === 'create' ? __('Create Rule', 'gameengine') : __('Save Changes', 'gameengine')} isLoading={saving} onClick={saveRule} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BonusRules;
