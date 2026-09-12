import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import Select from 'react-select';
import ListTable from '@GFComponents/ListTable';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Button from '@GFComponents/Button';
import OptionMenu from '@GFComponents/OptionMenu';
import Modal from '@GFComponents/Modal/Modal';
import GameEngineInput from '@GFComponents/GameEngineInput';
import Search from '@GFComponents/Search';
import {
    fetchRewards,
    createReward,
    updateReward,
    deleteReward,
} from '@GFRedux/Slices/rewardsSlice/rewardsSlice';

const defaultForm = {
    title: '',
    description: '',
    cost_points: '',
    stock: '',
    limit_per_user: '',
    status: 'publish',
};

const statusOptions = [
    { value: 'publish', label: __('Published', 'gameengine') },
    { value: 'draft', label: __('Draft', 'gameengine') },
];

const RewardsTable = () => {
    const dispatch = useDispatch();
    const { items, total, page, perPage, status } = useSelector((state) => state.rewards);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(fetchRewards({ page: 1, per_page: perPage }));
    }, []);

    const handlePageChange = (newPage) => {
        dispatch(fetchRewards({ page: newPage, per_page: perPage, search }));
    };

    const handlePerPageChange = (itemsPerPage) => {
        dispatch(fetchRewards({ page: 1, per_page: itemsPerPage, search }));
    };

    const handleSearch = (val) => {
        setSearch(val);
        dispatch(fetchRewards({ page: 1, per_page: perPage, search: val }));
    };

    const openCreate = () => {
        setEditingReward(null);
        setForm(defaultForm);
        setIsModalOpen(true);
    };

    const openEdit = (reward) => {
        setEditingReward(reward);
        setForm({
            title: reward.title || '',
            description: reward.description || '',
            cost_points: reward.cost_points ?? '',
            stock: reward.stock ?? '',
            limit_per_user: reward.limit_per_user ?? '',
            status: reward.status || 'publish',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return;

        setSaving(true);
        const payload = {
            title: form.title,
            description: form.description,
            cost_points: form.cost_points !== '' ? Number(form.cost_points) : 0,
            stock: form.stock !== '' ? Number(form.stock) : -1,
            limit_per_user: form.limit_per_user !== '' ? Number(form.limit_per_user) : 0,
            status: form.status,
        };

        if (editingReward) {
            await dispatch(updateReward({ id: editingReward.id, payload }));
        } else {
            await dispatch(createReward(payload));
        }

        setSaving(false);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(__('Delete this reward?', 'gameengine'))) {
            dispatch(deleteReward(id));
        }
    };

    const columns = useMemo(() => [
        {
            name: __('Reward', 'gameengine'),
            cell: (row) => (
                <div className="flex flex-col gap-[4px]">
                    <span className="font-semibold">{row.title}</span>
                    {row.description && (
                        <span className="text-xs" style={{ color: '#666' }}>{row.description}</span>
                    )}
                </div>
            ),
            columnWidth: '280px',
        },
        {
            name: __('Cost', 'gameengine'),
            cell: (row) => <span>{Number(row.cost_points).toLocaleString()} {__('pts', 'gameengine')}</span>,
        },
        {
            name: __('Stock', 'gameengine'),
            cell: (row) => (
                <span>
                    {Number(row.stock) < 0 ? __('Unlimited', 'gameengine') : row.stock}
                </span>
            ),
        },
        {
            name: __('Limit / User', 'gameengine'),
            cell: (row) => (
                <span>
                    {Number(row.limit_per_user) === 0 ? __('Unlimited', 'gameengine') : row.limit_per_user}
                </span>
            ),
        },
        {
            name: __('Status', 'gameengine'),
            cell: (row) => (
                <span
                    className="rounded-full pl-3 pr-3 capitalize"
                    style={{
                        color: row.status === 'publish' ? '#22A06B' : '#909399',
                        background: row.status === 'publish' ? '#EAFBF3' : '#F4F4F5',
                        padding: '2px 10px',
                        fontSize: '12px',
                    }}
                >
                    {row.status === 'publish' ? __('Published', 'gameengine') : __('Draft', 'gameengine')}
                </span>
            ),
        },
        {
            name: __('Action', 'gameengine'),
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
            columnWidth: '80px',
        },
    ], []);

    const subHeaderComponentMemo = useMemo(() => (
        <>
            <div className="flex items-center gap-2">
                <GFLabel color="var(--gameengine-font-color)" fontWeight="700" fontSize="16px" label={__('Rewards Catalog', 'gameengine')} />
            </div>

            <div className="flex items-center gap-2 mb-[10px]">
                <Search placeholder={__('Search rewards', 'gameengine')} defaultValue={search} onSearchHandler={handleSearch} />

                <Button
                    label={__('Add Reward', 'gameengine')}
                    icon={<GoPlus size="16px" />}
                    onClick={openCreate}
                />
            </div>
        </>
    ), [search]);

    const selectedStatus = statusOptions.find((o) => o.value === form.status) || statusOptions[0];

    return (
        <>
            <ListTable
                columns={columns}
                isRowSelectable={false}
                data={items}
                showSubHeader={true}
                subHeaderComponent={subHeaderComponentMemo}
                showColumnFilter={false}
                showPagination={true}
                noDataText={__('No rewards yet. Add your first reward for users to redeem.', 'gameengine')}
                totalItems={total}
                currentPageNumber={page}
                perPage={perPage}
                onChangePage={handlePageChange}
                onChangeItemsPerPage={handlePerPageChange}
                dataFetchingStatus={status === 'loading'}
                suffix="rewards-table"
            />

            <Modal
                isOpen={isModalOpen}
                title={editingReward ? __('Edit Reward', 'gameengine') : __('Add New Reward', 'gameengine')}
                onRequestClose={closeModal}
                size="medium"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button
                            label={editingReward ? __('Update Reward', 'gameengine') : __('Create Reward', 'gameengine')}
                            isLoading={saving}
                            onClick={handleSubmit}
                            type="button"
                        />
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Reward Title', 'gameengine')}>
                        <input
                            type="text"
                            className="gameengine-input"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder={__('e.g. Free T-Shirt', 'gameengine')}
                            required
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Description', 'gameengine')}>
                        <textarea
                            className="gameengine-input"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder={__('Shown to users in the store.', 'gameengine')}
                            rows={3}
                        />
                    </GameEngineInput>

                    <div className="flex gap-4">
                        <GameEngineInput label={__('Cost (points)', 'gameengine')}>
                            <input
                                type="number"
                                className="gameengine-input"
                                value={form.cost_points}
                                onChange={(e) => handleChange('cost_points', e.target.value)}
                                placeholder="100"
                                min="0"
                                required
                            />
                        </GameEngineInput>

                        <GameEngineInput label={__('Stock', 'gameengine')} desc={__('-1 for unlimited.', 'gameengine')}>
                            <input
                                type="number"
                                className="gameengine-input"
                                value={form.stock}
                                onChange={(e) => handleChange('stock', e.target.value)}
                                placeholder="-1"
                            />
                        </GameEngineInput>
                    </div>

                    <div className="flex gap-4">
                        <GameEngineInput label={__('Limit Per User', 'gameengine')} desc={__('0 for unlimited.', 'gameengine')}>
                            <input
                                type="number"
                                className="gameengine-input"
                                value={form.limit_per_user}
                                onChange={(e) => handleChange('limit_per_user', e.target.value)}
                                placeholder="0"
                                min="0"
                            />
                        </GameEngineInput>

                        <GameEngineInput label={__('Status', 'gameengine')}>
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                options={statusOptions}
                                value={selectedStatus}
                                onChange={(opt) => handleChange('status', opt ? opt.value : 'publish')}
                            />
                        </GameEngineInput>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default RewardsTable;
