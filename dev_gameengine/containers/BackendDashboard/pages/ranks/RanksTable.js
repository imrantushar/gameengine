import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import ListTable from '@GFComponents/ListTable';
import Button from '@GFComponents/Button';
import OptionMenu from '@GFComponents/OptionMenu';
import Modal from '@GFComponents/Modal/Modal';
import GameEngineInput from '@GFComponents/GameEngineInput';
import {
    fetchRanks,
    createRank,
    updateRank,
    deleteRank,
} from '@GFRedux/Slices/ranksSlice/ranksSlice';

const defaultForm = {
    title: '',
    points_required: '',
    icon: '',
    color: '#6c5ce7',
};

const RanksTable = () => {
    const dispatch = useDispatch();
    const { items, status } = useSelector(state => state.ranks);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRank, setEditingRank] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchRanks());
        }
    }, []);

    const openCreate = () => {
        setEditingRank(null);
        setForm(defaultForm);
        setIsModalOpen(true);
    };

    const openEdit = (rank) => {
        setEditingRank(rank);
        setForm({
            title: rank.title || '',
            points_required: rank.points_required || '',
            icon: rank.icon || '',
            color: rank.color || '#6c5ce7',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRank(null);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || form.points_required === '') return;

        setSaving(true);
        const payload = {
            title: form.title,
            points_required: Number(form.points_required),
            icon: form.icon,
            color: form.color,
        };

        if (editingRank) {
            await dispatch(updateRank({ id: editingRank.id, payload }));
        } else {
            await dispatch(createRank(payload));
        }

        setSaving(false);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(__('Delete this rank? This cannot be undone.', 'gameengine'))) {
            dispatch(deleteRank(id));
        }
    };

    const columns = [
        {
            name: __('Rank', 'gameengine'),
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.icon ? (
                        <img src={row.icon} alt="" className="w-7 h-7 object-contain" />
                    ) : (
                        <span
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: row.color || '#6c5ce7' }}
                        >
                            {(row.title || '?').charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="font-medium">{row.title}</span>
                </div>
            ),
        },
        {
            name: __('Points Required', 'gameengine'),
            cell: (row) => (
                <span className="font-semibold text-sm">{Number(row.points_required).toLocaleString()}</span>
            ),
        },
        {
            name: __('Users', 'gameengine'),
            cell: (row) => (
                <span className="text-sm text-gray-600">{row.user_count || 0}</span>
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

    return (
        <div className="gameengine-page-content">
            <div className="flex justify-between items-center py-6 px-1">
                <h2 className="gameengine-page-heading">{__('Ranks', 'gameengine')}</h2>
                <Button
                    label={__('Add new rank', 'gameengine')}
                    icon={<GoPlus size="16px" />}
                    onClick={openCreate}
                />
            </div>

            <ListTable
                columns={columns}
                data={items}
                dataFetchingStatus={status === 'loading'}
                noDataText={__('No ranks found. Create your first rank!', 'gameengine')}
                showSubHeader={false}
                showColumnFilter={false}
                showPagination={false}
                isRowSelectable={false}
            />

            <Modal
                isOpen={isModalOpen}
                title={editingRank ? __('Edit Rank', 'gameengine') : __('Add New Rank', 'gameengine')}
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
                            label={editingRank ? __('Update Rank', 'gameengine') : __('Create Rank', 'gameengine')}
                            isLoading={saving}
                            onClick={handleSubmit}
                            type="button"
                        />
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Rank Title', 'gameengine')}>
                        <input
                            type="text"
                            className="gameengine-input"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder={__('e.g. Gold, Diamond, Legend', 'gameengine')}
                            required
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Points Required', 'gameengine')} desc={__('Minimum total points to earn this rank.', 'gameengine')}>
                        <input
                            type="number"
                            className="gameengine-input"
                            value={form.points_required}
                            onChange={(e) => handleChange('points_required', e.target.value)}
                            placeholder="0"
                            min="0"
                            required
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Icon URL', 'gameengine')} desc={__('Optional image URL for this rank badge.', 'gameengine')}>
                        <input
                            type="url"
                            className="gameengine-input"
                            value={form.icon}
                            onChange={(e) => handleChange('icon', e.target.value)}
                            placeholder="https://..."
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Color', 'gameengine')} desc={__('Used as fallback when no icon is set.', 'gameengine')}>
                        <input
                            type="color"
                            value={form.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            style={{ width: '48px', height: '36px', cursor: 'pointer', border: 'none', padding: 0 }}
                        />
                    </GameEngineInput>
                </form>
            </Modal>
        </div>
    );
};

export default RanksTable;
