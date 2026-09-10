import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import ListTable from '@GFComponents/ListTable';
import Button from '@GFComponents/Button';
import OptionMenu from '@GFComponents/OptionMenu';
import Modal from '@GFComponents/Modal/Modal';
import GameEngineInput from '@GFComponents/GameEngineInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { API, namespace } from '@GFUtils/helper';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM = {
    name: '',
    hook_key: '',
    conditions: {},
    bonus_type: 'fixed',
    bonus_value: 0,
    active: true,
};

const isPro = () => Boolean(window.GameEngineGlobal && window.GameEngineGlobal.is_pro);

/**
 * Per-point-type "Bonus Multipliers" section shown inside the Point Type editor.
 *
 * Reads and writes the same `pro/bonus-rules` REST resource as the standalone
 * Bonus Rules screen, but scoped: the list is filtered to rules that target
 * this point type, and every rule created here is stamped with `point_type_id`.
 * Rules that apply to all point types stay on the global screen.
 */
const BonusMultipliers = ({ pointTypeId }) => {
    const scopedId = Number(pointTypeId);

    const [open, setOpen] = useState(false);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hookOptions, setHookOptions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchRules = () => {
        setLoading(true);
        API.get(namespace + 'pro/bonus-rules')
            .then((res) => {
                // A rule with no point_type_id is a legacy "all point types" rule;
                // it behaves as the primary point type (id 1) at runtime, so surface
                // it under the primary type's editor rather than orphaning it.
                const rows = (res.data || []).filter(
                    (r) => Number(r.point_type_id || 1) === scopedId
                );
                setRules(rows);
            })
            .catch(() => setRules([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!isPro()) {
            setLoading(false);
            return;
        }
        fetchRules();
        API.get(namespace + 'tools/available-hooks')
            .then((r) => setHookOptions(r.data || []))
            .catch(() => {});
    }, [pointTypeId]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...EMPTY_FORM, conditions: {} });
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setEditing(row);
        setForm({ ...row, conditions: row.conditions || {} });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const setCondition = (key, value) =>
        setForm((f) => ({ ...f, conditions: { ...f.conditions, [key]: value } }));
    const clearCondition = (key) =>
        setForm((f) => {
            const c = { ...f.conditions };
            delete c[key];
            return { ...f, conditions: c };
        });

    const saveRule = async () => {
        setSaving(true);
        const payload = { ...form, point_type_id: scopedId };
        try {
            if (editing) {
                await API.put(namespace + 'pro/bonus-rules/' + editing.id, payload);
            } else {
                await API.post(namespace + 'pro/bonus-rules', payload);
            }
            fetchRules();
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
        fetchRules();
    };

    const toggleActive = async (row) => {
        await API.put(namespace + 'pro/bonus-rules/' + row.id, {
            ...row,
            point_type_id: scopedId,
            active: !row.active,
        });
        fetchRules();
    };

    const conditionsLabel = (c) => {
        if (!c || !Object.keys(c).length) return __('Always', 'gameengine');
        return Object.keys(c).join(', ');
    };

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            name: __('Trigger', 'gameengine'),
            cell: (row) => (
                <span className="text-sm text-gray-500">{row.hook_key || __('Any', 'gameengine')}</span>
            ),
        },
        {
            name: __('When', 'gameengine'),
            cell: (row) => (
                <span className="text-sm text-gray-500">{conditionsLabel(row.conditions)}</span>
            ),
        },
        {
            name: __('Bonus', 'gameengine'),
            cell: (row) => (
                <span className="text-sm">
                    {row.bonus_type === 'percent'
                        ? `+${row.bonus_value}%`
                        : `+${row.bonus_value} pts`}
                </span>
            ),
        },
        {
            name: __('Active', 'gameengine'),
            cell: (row) => (
                <button
                    onClick={() => toggleActive(row)}
                    style={{
                        background: row.active ? '#10b981' : '#e2e8f0',
                        color: row.active ? '#fff' : '#64748b',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '3px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                    }}
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

    if (!isPro()) {
        return null;
    }

    return (
        <CollapsibleItem
            label={__('Bonus Multipliers', 'gameengine')}
            open={open}
            onClick={() => setOpen((v) => !v)}
            dynamicClasses="mt-6"
        >
            {open && (
                <div className="w-full mt-4">
                    <div className="flex justify-between items-start gap-4 mb-3">
                        <GFLabel
                            type="subtitle"
                            color="var(--gameengine-font-color)"
                            label={__(
                                'Add extra points or a percentage multiplier for this point type based on conditions like user role, day of week, or a first-time action. Rules stack with each other.',
                                'gameengine'
                            )}
                        />
                        <Button
                            label={__('Add multiplier', 'gameengine')}
                            icon={<GoPlus size="16px" />}
                            onClick={openCreate}
                        />
                    </div>

                    <ListTable
                        columns={columns}
                        data={rules}
                        dataFetchingStatus={loading}
                        noDataText={__('No bonus multipliers for this point type yet.', 'gameengine')}
                        showSubHeader={false}
                        showColumnFilter={false}
                        showPagination={false}
                        isRowSelectable={false}
                    />
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                title={editing ? __('Edit Bonus Multiplier', 'gameengine') : __('New Bonus Multiplier', 'gameengine')}
                onRequestClose={closeModal}
                size="medium"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button
                            label={editing ? __('Save Changes', 'gameengine') : __('Create Rule', 'gameengine')}
                            isLoading={saving}
                            onClick={saveRule}
                            type="button"
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Rule Name', 'gameengine')}>
                        <input
                            className="gameengine-input"
                            value={form.name}
                            onChange={(e) => setField('name', e.target.value)}
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Trigger (leave blank for any)', 'gameengine')}>
                        {hookOptions.length > 0 ? (
                            <select
                                className="gameengine-input"
                                value={form.hook_key}
                                onChange={(e) => setField('hook_key', e.target.value)}
                            >
                                <option value="">{__('— Any trigger —', 'gameengine')}</option>
                                {hookOptions.map((h, i) => (
                                    <option key={i} value={h.hook_key}>
                                        {h.label || h.hook_key}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                className="gameengine-input"
                                value={form.hook_key}
                                onChange={(e) => setField('hook_key', e.target.value)}
                                placeholder="e.g. publish_post"
                            />
                        )}
                    </GameEngineInput>

                    <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <legend style={{ fontSize: '13px', fontWeight: '600', padding: '0 6px' }}>
                            {__('Conditions', 'gameengine')}
                        </legend>

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                marginBottom: '10px',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={!!form.conditions.is_first_time}
                                onChange={(e) =>
                                    e.target.checked
                                        ? setCondition('is_first_time', true)
                                        : clearCondition('is_first_time')
                                }
                            />
                            {__('First time performing this action', 'gameengine')}
                        </label>

                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                            {__('Day of week (any day if none selected):', 'gameengine')}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                            {DAYS.map((day) => (
                                <label
                                    key={day}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={(form.conditions.day_of_week || []).includes(day)}
                                        onChange={(e) => {
                                            const curr = form.conditions.day_of_week || [];
                                            if (e.target.checked) {
                                                setCondition('day_of_week', [...curr, day]);
                                            } else {
                                                const next = curr.filter((d) => d !== day);
                                                next.length
                                                    ? setCondition('day_of_week', next)
                                                    : clearCondition('day_of_week');
                                            }
                                        }}
                                    />
                                    {day.slice(0, 3)}
                                </label>
                            ))}
                        </div>

                        <label
                            style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}
                        >
                            {__('Required user role (blank = any role):', 'gameengine')}
                        </label>
                        <input
                            className="gameengine-input"
                            style={{ width: '100%' }}
                            placeholder="subscriber, editor…"
                            value={form.conditions.user_role || ''}
                            onChange={(e) =>
                                e.target.value
                                    ? setCondition('user_role', e.target.value)
                                    : clearCondition('user_role')
                            }
                        />
                    </fieldset>

                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                            {__('Bonus Type', 'gameengine')}
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {['fixed', 'percent'].map((t) => (
                                <label
                                    key={t}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                >
                                    <input
                                        type="radio"
                                        name="ge-bonus-mult-type"
                                        value={t}
                                        checked={form.bonus_type === t}
                                        onChange={() => setField('bonus_type', t)}
                                    />
                                    {t === 'fixed'
                                        ? __('Fixed Points', 'gameengine')
                                        : __('Percent Multiplier', 'gameengine')}
                                </label>
                            ))}
                        </div>
                    </div>

                    <GameEngineInput
                        label={form.bonus_type === 'percent' ? __('Bonus %', 'gameengine') : __('Bonus Points', 'gameengine')}
                    >
                        <input
                            type="number"
                            min="0"
                            className="gameengine-input"
                            style={{ width: '120px' }}
                            value={form.bonus_value}
                            onChange={(e) => setField('bonus_value', parseInt(e.target.value, 10) || 0)}
                        />
                    </GameEngineInput>
                </div>
            </Modal>
        </CollapsibleItem>
    );
};

export default BonusMultipliers;
