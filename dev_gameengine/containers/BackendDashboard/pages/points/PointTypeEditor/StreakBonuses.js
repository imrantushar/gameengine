import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import Select from 'react-select';
import CollapsibleItem from '@GFComponents/Collapsible/CollapsibleItem';
import ListTable from '@GFComponents/ListTable';
import Button from '@GFComponents/Button';
import OptionMenu from '@GFComponents/OptionMenu';
import Modal from '@GFComponents/Modal/Modal';
import GameEngineInput from '@GFComponents/GameEngineInput';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { API, namespace } from '@GFUtils/helper';

const EMPTY_FORM = {
    title: '',
    trigger_hook: '',
    interval_type: 'daily',
    milestone_at: '',
    bonus_points: '',
};

const intervalOptions = [
    { value: 'daily', label: __('Daily', 'gameengine') },
    { value: 'weekly', label: __('Weekly', 'gameengine') },
];

/**
 * Per-point-type "Streak Bonuses" section shown inside the Point Type editor.
 *
 * Reads and writes the same `streaks` REST resource as the standalone Streaks
 * screen, but scoped: the list is filtered to streaks that pay out this point
 * type, and every streak created here is stamped with `bonus_point_type_id`.
 */
const StreakBonuses = ({ pointTypeId }) => {
    const scopedId = Number(pointTypeId);

    const [open, setOpen] = useState(false);
    const [streaks, setStreaks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hookOptions, setHookOptions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchStreaks = () => {
        setLoading(true);
        API.get(namespace + 'streaks')
            .then((res) => {
                // A streak with no bonus_point_type_id pays into the primary point
                // type (id 1) at runtime, so surface it under that type's editor.
                const rows = (res.data || []).filter(
                    (s) => Number(s.bonus_point_type_id || 1) === scopedId
                );
                setStreaks(rows);
            })
            .catch(() => setStreaks([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStreaks();
        API.get(namespace + 'tools/available-hooks')
            .then((r) =>
                setHookOptions(
                    (r.data || []).map((h) => ({
                        value: h.hook_key,
                        label: h.label ? `${h.label} (${h.hook_key})` : h.hook_key,
                    }))
                )
            )
            .catch(() => {});
    }, [pointTypeId]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setEditing(row);
        setForm({
            title: row.title || '',
            trigger_hook: row.trigger_hook || '',
            interval_type: row.interval_type || 'daily',
            milestone_at: row.milestone_at || '',
            bonus_points: row.bonus_points || '',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

    const saveStreak = async () => {
        if (!form.title || !form.trigger_hook) return;
        setSaving(true);
        const payload = {
            title: form.title,
            trigger_hook: form.trigger_hook,
            interval_type: form.interval_type,
            milestone_at: form.milestone_at !== '' ? Number(form.milestone_at) : 0,
            bonus_points: form.bonus_points !== '' ? Number(form.bonus_points) : 0,
            bonus_point_type_id: scopedId,
        };
        try {
            if (editing) {
                await API.put(namespace + 'streaks/' + editing.id, payload);
            } else {
                await API.post(namespace + 'streaks', payload);
            }
            fetchStreaks();
            closeModal();
        } catch (e) {
            console.warn(e);
        } finally {
            setSaving(false);
        }
    };

    const deleteStreak = async (id) => {
        if (!window.confirm(__('Delete this streak?', 'gameengine'))) return;
        await API.delete(namespace + 'streaks/' + id);
        fetchStreaks();
    };

    const columns = [
        {
            name: __('Title', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.title}</span>,
        },
        {
            name: __('Trigger', 'gameengine'),
            cell: (row) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.trigger_hook}</code>
            ),
        },
        {
            name: __('Interval', 'gameengine'),
            cell: (row) => <span className="capitalize text-sm">{row.interval_type || 'daily'}</span>,
        },
        {
            name: __('Milestone', 'gameengine'),
            cell: (row) => (
                <span className="text-sm">
                    {row.milestone_at ? __('every ', 'gameengine') + row.milestone_at : '—'}
                </span>
            ),
        },
        {
            name: __('Bonus', 'gameengine'),
            cell: (row) => <span className="text-sm">{`+${row.bonus_points || 0} pts`}</span>,
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
                            onClick: () => deleteStreak(row.id),
                        },
                    ]}
                />
            ),
        },
    ];

    const selectedInterval =
        intervalOptions.find((o) => o.value === form.interval_type) || intervalOptions[0];
    const selectedHook = hookOptions.find((o) => o.value === form.trigger_hook) || null;

    return (
        <CollapsibleItem
            label={__('Streak Bonuses', 'gameengine')}
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
                                'Reward this point type when a user keeps performing an action on consecutive days or weeks. Milestone bonuses are paid into this point type.',
                                'gameengine'
                            )}
                        />
                        <Button
                            label={__('Add streak', 'gameengine')}
                            icon={<GoPlus size="16px" />}
                            onClick={openCreate}
                        />
                    </div>

                    <ListTable
                        columns={columns}
                        data={streaks}
                        dataFetchingStatus={loading}
                        noDataText={__('No streak bonuses for this point type yet.', 'gameengine')}
                        showSubHeader={false}
                        showColumnFilter={false}
                        showPagination={false}
                        isRowSelectable={false}
                    />
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                title={editing ? __('Edit Streak', 'gameengine') : __('Add Streak', 'gameengine')}
                onRequestClose={closeModal}
                size="medium"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button
                            label={editing ? __('Save Changes', 'gameengine') : __('Create Streak', 'gameengine')}
                            isLoading={saving}
                            onClick={saveStreak}
                            type="button"
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Streak Title', 'gameengine')}>
                        <input
                            className="gameengine-input"
                            value={form.title}
                            onChange={(e) => setField('title', e.target.value)}
                            placeholder={__('e.g. Daily Login Streak', 'gameengine')}
                        />
                    </GameEngineInput>

                    <GameEngineInput
                        label={__('Trigger Hook', 'gameengine')}
                        desc={__('The action that counts toward this streak.', 'gameengine')}
                    >
                        {hookOptions.length > 0 ? (
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                placeholder={__('Select a hook…', 'gameengine')}
                                options={hookOptions}
                                value={selectedHook}
                                onChange={(opt) => setField('trigger_hook', opt ? opt.value : '')}
                                isClearable
                            />
                        ) : (
                            <input
                                className="gameengine-input"
                                value={form.trigger_hook}
                                onChange={(e) => setField('trigger_hook', e.target.value)}
                                placeholder="wp_login"
                            />
                        )}
                    </GameEngineInput>

                    <GameEngineInput label={__('Interval', 'gameengine')}>
                        <Select
                            className="gameengine-select"
                            classNamePrefix="gameengine-select"
                            options={intervalOptions}
                            value={selectedInterval}
                            onChange={(opt) => setField('interval_type', opt ? opt.value : 'daily')}
                        />
                    </GameEngineInput>

                    <GameEngineInput
                        label={__('Milestone Every (streak count)', 'gameengine')}
                        desc={__('Award the bonus every N consecutive completions. Leave 0 to disable.', 'gameengine')}
                    >
                        <input
                            type="number"
                            min="0"
                            className="gameengine-input"
                            style={{ width: '120px' }}
                            value={form.milestone_at}
                            onChange={(e) => setField('milestone_at', e.target.value)}
                            placeholder="7"
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Bonus Points', 'gameengine')}>
                        <input
                            type="number"
                            min="0"
                            className="gameengine-input"
                            style={{ width: '120px' }}
                            value={form.bonus_points}
                            onChange={(e) => setField('bonus_points', e.target.value)}
                            placeholder="0"
                        />
                    </GameEngineInput>
                </div>
            </Modal>
        </CollapsibleItem>
    );
};

export default StreakBonuses;
