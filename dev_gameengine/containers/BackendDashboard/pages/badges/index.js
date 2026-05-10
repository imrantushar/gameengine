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
import DashiconPicker from '@GFComponents/DashiconPicker';
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
    shape: 'circle',
    border_color: '#ffffff',
    text_color: '#ffffff',
};

const SHAPES = [
    { value: 'circle', label: __('Circle', 'gameengine') },
    { value: 'square', label: __('Square', 'gameengine') },
    { value: 'shield', label: __('Shield', 'gameengine') },
];

const shieldClipPath = 'polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)';

function getBadgeStyle(shape, color, borderColor) {
    const base = {
        backgroundColor: color || '#6c5ce7',
        border: `2px solid ${borderColor || '#ffffff'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    if (shape === 'square') return { ...base, borderRadius: '8px' };
    if (shape === 'shield') return { ...base, borderRadius: '0', clipPath: shieldClipPath, border: 'none' };
    return { ...base, borderRadius: '50%' };
}

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
            shape: badge.shape || 'circle',
            border_color: badge.border_color || '#ffffff',
            text_color: badge.text_color || '#ffffff',
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
            shape: form.shape,
            border_color: form.border_color,
            text_color: form.text_color,
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

    const renderBadgeIcon = (badge, size = 64, fontSize = 28) => {
        const style = { ...getBadgeStyle(badge.shape, badge.color, badge.border_color), width: size, height: size };
        const iconColor = badge.text_color || '#ffffff';
        if (badge.icon && badge.icon.startsWith('dashicons-')) {
            return (
                <div style={style}>
                    <span className={badge.icon} style={{ fontSize, color: iconColor }} />
                </div>
            );
        }
        if (badge.icon) {
            return (
                <div style={style}>
                    <img src={badge.icon} alt={badge.title} style={{ width: size * 0.6, height: size * 0.6, objectFit: 'contain' }} />
                </div>
            );
        }
        return (
            <div style={style}>
                <span style={{ color: iconColor, fontSize: fontSize * 0.75, fontWeight: 'bold' }}>
                    {(badge.title || '?').charAt(0).toUpperCase()}
                </span>
            </div>
        );
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
                            {renderBadgeIcon(badge, 64, 28)}
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

                    <GameEngineInput label={__('Icon', 'gameengine')} desc={__('Choose a dashicon or enter an image URL.', 'gameengine')}>
                        <DashiconPicker value={form.icon} onChange={(val) => handleChange('icon', val)} />
                    </GameEngineInput>

                    <GameEngineInput label={__('Background Color', 'gameengine')}>
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

                    <GameEngineInput label={__('Shape', 'gameengine')} desc={__('Controls the badge outline.', 'gameengine')}>
                        <div className="flex gap-3">
                            {SHAPES.map(s => (
                                <label key={s.value} className="flex items-center gap-1 cursor-pointer text-sm">
                                    <input
                                        type="radio"
                                        name="badge_shape"
                                        value={s.value}
                                        checked={form.shape === s.value}
                                        onChange={() => handleChange('shape', s.value)}
                                    />
                                    {s.label}
                                </label>
                            ))}
                        </div>
                    </GameEngineInput>

                    <GameEngineInput label={__('Border Color', 'gameengine')} desc={__('Border around the badge (not shown on Shield shape).', 'gameengine')}>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={form.border_color}
                                onChange={(e) => handleChange('border_color', e.target.value)}
                                style={{ width: '48px', height: '36px', cursor: 'pointer', border: 'none', padding: 0 }}
                            />
                            <span className="text-sm text-gray-500">{form.border_color}</span>
                        </div>
                    </GameEngineInput>

                    <GameEngineInput label={__('Icon / Text Color', 'gameengine')} desc={__('Color of the icon or initial letter.', 'gameengine')}>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={form.text_color}
                                onChange={(e) => handleChange('text_color', e.target.value)}
                                style={{ width: '48px', height: '36px', cursor: 'pointer', border: 'none', padding: 0 }}
                            />
                            <span className="text-sm text-gray-500">{form.text_color}</span>
                        </div>
                    </GameEngineInput>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">{__('Preview', 'gameengine')}</span>
                        <div className="flex items-center gap-3">
                            {renderBadgeIcon({ ...form, title: form.title || '?' }, 64, 28)}
                            <div className="text-sm text-gray-600">
                                <div className="font-medium">{form.title || __('Badge Name', 'gameengine')}</div>
                                <div className="text-xs text-gray-400 capitalize">{form.shape}</div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default BadgesPage;
