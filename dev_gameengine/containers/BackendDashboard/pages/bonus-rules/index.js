import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
import ListTable from '@GFComponents/ListTable';
import Modal from '@GFComponents/Modal/Modal';
import OptionMenu from '@GFComponents/OptionMenu';
import GameEngineInput from '@GFComponents/GameEngineInput';
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

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            name: __('Hook / Trigger', 'gameengine'),
            cell: (row) => <span className="text-sm text-[var(--gameengine-warn-muted)]">{row.hook_key || __('All', 'gameengine')}</span>,
        },
        {
            name: __('Conditions', 'gameengine'),
            cell: (row) => <span className="text-sm text-[var(--gameengine-warn-muted)]">{conditionsLabel(row.conditions)}</span>,
        },
        {
            name: __('Bonus', 'gameengine'),
            cell: (row) => (
                <span className="text-sm">{row.bonus_type === 'percent' ? `+${row.bonus_value}%` : `+${row.bonus_value} pts`}</span>
            ),
        },
        {
            name: __('Active', 'gameengine'),
            cell: (row) => (
                <button
                    onClick={() => toggleActive(row)}
                    style={{ background: row.active ? 'var(--gameengine-success)' : 'var(--gameengine-border-color)', color: row.active ? '#fff' : 'var(--gameengine-warn-muted)', border: 'none', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}
                >
                    {row.active ? __('On', 'gameengine') : __('Off', 'gameengine')}
                </button>
            ),
        },
        {
            name: __('Actions', 'gameengine'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: 'button',
                            label: __('Edit', 'gameengine'),
                            icon: <FiEdit />,
                            onClick: () => openEdit(row),
                            hasBorder: true,
                        },
                        {
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gameengine'),
                            icon: <FiTrash2 />,
                            onClick: () => deleteRule(row.id),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            <TopBar path={__('Bonus Rules', 'gameengine')} rightContent={
                <Button label={__('+ New Rule', 'gameengine')} onClick={openCreate} />
            } />
            <div className="gameengine-page-content">
                <h2 className="gameengine-page-heading py-6">{__('Conditional Bonus Rules', 'gameengine')}</h2>
                <p style={{ fontSize: '13px', color: 'var(--gameengine-warn-muted)', marginBottom: '16px' }}>
                    {__('Add point multipliers or bonuses based on conditions like user role, day of week, or first-time action.', 'gameengine')}
                </p>

                <ListTable
                    columns={columns}
                    data={rules}
                    dataFetchingStatus={loading}
                    noDataText={__('No bonus rules yet.', 'gameengine')}
                    showSubHeader={false}
                    showColumnFilter={false}
                    showPagination={false}
                    isRowSelectable={false}
                />
            </div>

            <Modal
                isOpen={!!modal}
                title={modal === 'create' ? __('New Bonus Rule', 'gameengine') : __('Edit Bonus Rule', 'gameengine')}
                onRequestClose={closeModal}
                size="medium"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button
                            label={modal === 'create' ? __('Create Rule', 'gameengine') : __('Save Changes', 'gameengine')}
                            isLoading={saving}
                            onClick={saveRule}
                            type="button"
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Rule Name', 'gameengine')}>
                        <input className="gameengine-input" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </GameEngineInput>

                    <GameEngineInput label={__('Hook Key / Trigger (leave blank for any)', 'gameengine')}>
                        {availableHooks.length > 0 ? (
                            <select className="gameengine-input"
                                value={form.hook_key}
                                onChange={e => setForm(f => ({ ...f, hook_key: e.target.value }))}>
                                <option value="">{__('— Any hook —', 'gameengine')}</option>
                                {availableHooks.map((h, i) => (
                                    <option key={i} value={h.hook_key}>{h.label || h.hook_key}</option>
                                ))}
                            </select>
                        ) : (
                            <input className="gameengine-input" value={form.hook_key}
                                onChange={e => setForm(f => ({ ...f, hook_key: e.target.value }))} placeholder="e.g. publish_post" />
                        )}
                    </GameEngineInput>

                    <GameEngineInput label={__('Point Type (leave blank for all)', 'gameengine')}>
                        <select className="gameengine-input"
                            value={form.point_type_id || ''}
                            onChange={e => setForm(f => ({ ...f, point_type_id: e.target.value ? parseInt(e.target.value) : null }))}>
                            <option value="">{__('— All point types —', 'gameengine')}</option>
                            {pointTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.title}</option>)}
                        </select>
                    </GameEngineInput>

                    <fieldset style={{ border: '1px solid var(--gameengine-border-color)', borderRadius: '8px', padding: '12px' }}>
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

                    <GameEngineInput label={form.bonus_type === 'percent' ? __('Bonus %', 'gameengine') : __('Bonus Points', 'gameengine')}>
                        <input type="number" min="0" className="gameengine-input" style={{ width: '120px' }}
                            value={form.bonus_value}
                            onChange={e => setForm(f => ({ ...f, bonus_value: parseInt(e.target.value, 10) || 0 }))} />
                    </GameEngineInput>
                </div>
            </Modal>
        </>
    );
};

export default BonusRules;
