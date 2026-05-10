import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import TopBar from '@GFComponents/TopBar';
import GetHelp from '@GFComponents/GetHelp';
import Button from '@GFComponents/Button';
import Modal from '@GFComponents/Modal/Modal';
import GameEngineInput from '@GFComponents/GameEngineInput';
import {
    fetchBadges,
    createBadge,
    updateBadge,
    deleteBadge,
} from '@GFRedux/Slices/badgesSlice/badgesSlice';

const defaultForm = {
    title: '',
    icon: '',
    color: '#6c5ce7',
    icon_type: 'url',
};

const BadgesPage = () => {
    const dispatch = useDispatch();
    const { items, status } = useSelector(state => state.badges);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchBadges());
        }
    }, []);

    const openCreate = () => {
        setEditingBadge(null);
        setForm(defaultForm);
        setIsModalOpen(true);
    };

    const openEdit = (badge) => {
        setEditingBadge(badge);
        setForm({
            title: badge.title || '',
            icon: badge.icon || '',
            color: badge.color || '#6c5ce7',
            icon_type: badge.icon_type || 'url',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBadge(null);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return;

        setSaving(true);
        const payload = {
            title: form.title,
            icon: form.icon,
            color: form.color,
            icon_type: form.icon_type,
        };

        if (editingBadge) {
            await dispatch(updateBadge({ id: editingBadge.id, payload }));
        } else {
            await dispatch(createBadge(payload));
        }

        setSaving(false);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(__('Delete this badge?', 'gameengine'))) {
            dispatch(deleteBadge(id));
        }
    };

    return (
        <>
            <TopBar path={__('Badge Editor', 'gameengine')} rightContent={<GetHelp filterText={['badges']} />} />

            <div className="gameengine-page-content">
                <div className="flex justify-between items-center py-6 px-1">
                    <h2 className="gameengine-page-heading">{__('Badges', 'gameengine')}</h2>
                    <Button
                        label={__('Add new badge', 'gameengine')}
                        icon={<GoPlus size="16px" />}
                        onClick={openCreate}
                    />
                </div>

                {status === 'loading' && (
                    <p className="text-sm text-gray-500 px-1">{__('Loading badges…', 'gameengine')}</p>
                )}

                {status !== 'loading' && items.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>{__('No badges yet. Create your first badge!', 'gameengine')}</p>
                    </div>
                )}

                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                    {items.map((badge) => (
                        <div
                            key={badge.id}
                            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-3 relative group"
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: badge.color || '#6c5ce7' }}
                            >
                                {badge.icon ? (
                                    <img src={badge.icon} alt={badge.title} className="w-10 h-10 object-contain" />
                                ) : (
                                    <span className="text-white text-2xl font-bold">
                                        {(badge.title || '?').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-800 text-center">{badge.title}</span>
                            <div className="flex gap-2">
                                <button
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                    onClick={() => openEdit(badge)}
                                    title={__('Edit', 'gameengine')}
                                >
                                    <FiEdit size={15} />
                                </button>
                                <button
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={() => handleDelete(badge.id)}
                                    title={__('Delete', 'gameengine')}
                                >
                                    <FiTrash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                title={editingBadge ? __('Edit Badge', 'gameengine') : __('Add New Badge', 'gameengine')}
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
                            label={editingBadge ? __('Update Badge', 'gameengine') : __('Create Badge', 'gameengine')}
                            isLoading={saving}
                            onClick={handleSubmit}
                            type="button"
                        />
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Badge Title', 'gameengine')}>
                        <input
                            type="text"
                            className="gameengine-input"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder={__('e.g. Star Contributor', 'gameengine')}
                            required
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Icon URL', 'gameengine')} desc={__('Direct URL to an image file for this badge.', 'gameengine')}>
                        <input
                            type="url"
                            className="gameengine-input"
                            value={form.icon}
                            onChange={(e) => handleChange('icon', e.target.value)}
                            placeholder="https://..."
                        />
                    </GameEngineInput>

                    <GameEngineInput label={__('Background Color', 'gameengine')} desc={__('Shown when no icon image is set.', 'gameengine')}>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={form.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                                style={{ width: '48px', height: '36px', cursor: 'pointer', border: 'none', padding: 0 }}
                            />
                            <span className="text-sm text-gray-500">{form.color}</span>
                        </div>
                    </GameEngineInput>

                    {(form.icon || form.color) && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">{__('Preview', 'gameengine')}</span>
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: form.color || '#6c5ce7' }}
                            >
                                {form.icon ? (
                                    <img src={form.icon} alt="" className="w-10 h-10 object-contain" />
                                ) : (
                                    <span className="text-white text-2xl font-bold">
                                        {(form.title || '?').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </>
    );
};

export default BadgesPage;
