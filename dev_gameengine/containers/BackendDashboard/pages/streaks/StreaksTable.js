import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import Select from 'react-select';
import ListTable from '@GFComponents/ListTable';
import Button from '@GFComponents/Button';
import OptionMenu from '@GFComponents/OptionMenu';
import Modal from '@GFComponents/Modal/Modal';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { API, namespace } from '@GFUtils/helper';
import {
    fetchStreaks,
    createStreak,
    updateStreak,
    deleteStreak,
} from '@GFRedux/Slices/streaksSlice/streaksSlice';

const defaultForm = {
    title: '',
    trigger_hook: '',
    interval: 'daily',
    bonus_points: '',
    milestone_at: '',
};

const intervalOptions = [
    { value: 'daily', label: __('Daily', 'gameengine') },
    { value: 'weekly', label: __('Weekly', 'gameengine') },
];

const StreaksTable = () => {
    const dispatch = useDispatch();
    const { items, status } = useSelector(state => state.streaks);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStreak, setEditingStreak] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [hookOptions, setHookOptions] = useState([]);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchStreaks());
        }
        loadHooks();
    }, []);

    const loadHooks = async () => {
        try {
            const res = await API.get(namespace + 'tools/available-hooks');
            const hooks = (res.data || []).map(h => ({
                value: h.hook_key,
                label: h.label ? `${h.label} (${h.hook_key})` : h.hook_key,
            }));
            setHookOptions(hooks);
        } catch (e) {
            // hooks list is optional
        }
    };

    const openCreate = () => {
        setEditingStreak(null);
        setForm(defaultForm);
        setIsModalOpen(true);
    };

    const openEdit = (streak) => {
        setEditingStreak(streak);
        setForm({
            title: streak.title || '',
            trigger_hook: streak.trigger_hook || '',
            interval: streak.interval_type || streak.interval || 'daily',
            bonus_points: streak.bonus_points || '',
            milestone_at: streak.milestone_at || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStreak(null);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.trigger_hook) return;

        setSaving(true);
        const payload = {
            title: form.title,
            trigger_hook: form.trigger_hook,
            interval_type: form.interval,
            bonus_points: form.bonus_points !== '' ? Number(form.bonus_points) : 0,
            milestone_at: form.milestone_at !== '' ? Number(form.milestone_at) : 0,
        };

        if (editingStreak) {
            await dispatch(updateStreak({ id: editingStreak.id, payload }));
        } else {
            await dispatch(createStreak(payload));
        }

        setSaving(false);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(__('Delete this streak?', 'gameengine'))) {
            dispatch(deleteStreak(id));
        }
    };

    const columns = [
        {
            name: __('Title', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.title}</span>,
        },
        {
            name: __('Trigger Hook', 'gameengine'),
            cell: (row) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.trigger_hook}</code>
            ),
        },
        {
            name: __('Interval', 'gameengine'),
            cell: (row) => (
                <span className="capitalize text-sm">{row.interval_type || 'daily'}</span>
            ),
        },
        {
            name: __('Bonus Points', 'gameengine'),
            cell: (row) => (
                <span className="text-sm">{row.bonus_points || 0}</span>
            ),
        },
        {
            name: __('Milestone Every', 'gameengine'),
            cell: (row) => (
                <span className="text-sm">{row.milestone_at ? `${row.milestone_at} streaks` : '—'}</span>
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
                            onClick: () => handleDelete(row.id),
                        },
                    ]}
                />
            ),
        },
    ];

    const selectedInterval = intervalOptions.find(o => o.value === form.interval) || intervalOptions[0];
    const selectedHook = hookOptions.find(o => o.value === form.trigger_hook) || null;

    return (
        <div className="gameengine-page-content">
            <div className="flex justify-between items-center py-6 px-1">
                <h2 className="gameengine-page-heading">{__('Streaks', 'gameengine')}</h2>
                <Button
                    label={__('Add new streak', 'gameengine')}
                    icon={<GoPlus size="16px" />}
                    onClick={openCreate}
                />
            </div>

            <ListTable
                columns={columns}
                data={items}
                dataFetchingStatus={status === 'loading'}
                noDataText={__('No streaks found. Create your first streak!', 'gameengine')}
                showSubHeader={false}
                showColumnFilter={false}
                showPagination={false}
                isRowSelectable={false}
            />

            <Modal
                isOpen={isModalOpen}
                title={editingStreak ? __('Edit Streak', 'gameengine') : __('Add New Streak', 'gameengine')}
                onRequestClose={closeModal}
                size="medium"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button
                            label={__('Cancel', 'gameengine')}
                            preset="secondary"
                            onClick={closeModal}
                        />
                        <Button
                            label={editingStreak ? __('Update Streak', 'gameengine') : __('Create Streak', 'gameengine')}
                            isLoading={saving}
                            onClick={handleSubmit}
                            type="button"
                        />
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Streak Title', 'gameengine')}>
                        <input
                            type="text"
                            className="gameengine-input"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder={__('e.g. Daily Login Streak', 'gameengine')}
                            required
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Trigger Hook', 'gameengine')} desc={__('The WordPress action that counts toward this streak.', 'gameengine')}>
                        {hookOptions.length > 0 ? (
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                placeholder={__('Select a hook…', 'gameengine')}
                                options={hookOptions}
                                value={selectedHook}
                                onChange={(opt) => handleChange('trigger_hook', opt ? opt.value : '')}
                                isClearable
                            />
                        ) : (
                            <input
                                type="text"
                                className="gameengine-input"
                                value={form.trigger_hook}
                                onChange={(e) => handleChange('trigger_hook', e.target.value)}
                                placeholder="wp_login"
                                required
                            />
                        )}
                    </GameEngineInput>

                    <GameEngineInput label={__('Interval', 'gameengine')} desc={__('How often the user must trigger the action to keep their streak alive.', 'gameengine')}>
                        <Select
                            className="gameengine-select"
                            classNamePrefix="gameengine-select"
                            options={intervalOptions}
                            value={selectedInterval}
                            onChange={(opt) => handleChange('interval', opt ? opt.value : 'daily')}
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Bonus Points', 'gameengine')} desc={__('Points awarded each time the milestone is reached.', 'gameengine')}>
                        <input
                            type="number"
                            className="gameengine-input"
                            value={form.bonus_points}
                            onChange={(e) => handleChange('bonus_points', e.target.value)}
                            placeholder="0"
                            min="0"
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Milestone Every (streak count)', 'gameengine')} desc={__('Award bonus points every N consecutive completions. Leave 0 to disable.', 'gameengine')}>
                        <input
                            type="number"
                            className="gameengine-input"
                            value={form.milestone_at}
                            onChange={(e) => handleChange('milestone_at', e.target.value)}
                            placeholder="7"
                            min="0"
                        />
                    </GameEngineInput>
                </form>
            </Modal>
        </div>
    );
};

export default StreaksTable;
