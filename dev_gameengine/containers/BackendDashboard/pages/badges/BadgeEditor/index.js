import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import GameEngineBox from '@GFComponents/GameEngineBox';
import GameEngineInput from '@GFComponents/GameEngineInput';
import Button from '@GFComponents/Button';
import DashiconPicker from '@GFComponents/DashiconPicker';
import { route_path } from '@GFUtils/helper';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import {
    fetchBadges,
    createBadge,
    updateBadge,
} from '@GFRedux/Slices/badgesSlice/badgesSlice';
import {
    BadgeGlyph,
    ColorField,
    SHAPES,
    defaultBadge,
    getBadgeStyle,
    iconTypeOf,
} from '../helper';

const LIST_URL = `${route_path}admin.php?page=gameengine-badge-editor`;

const ShapeTile = ({ shape, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="flex flex-col items-center gap-2 cursor-pointer rounded-lg transition-colors"
        style={{
            padding: '14px 18px',
            background: active ? 'var(--gameengine-primary-light)' : 'var(--gameengine-background)',
            border: `1px solid ${active ? 'var(--gameengine-primary)' : 'var(--gameengine-border-color)'}`,
        }}
    >
        <span
            style={{
                ...getBadgeStyle(shape.value, 'var(--gameengine-warn-muted)', 'transparent', 0),
                width: '30px',
                height: '30px',
            }}
        />
        <span
            className="text-xs"
            style={{ color: active ? 'var(--gameengine-primary)' : 'var(--gameengine-warn-muted)' }}
        >
            {shape.label}
        </span>
    </button>
);

const BadgeEditor = ({ id: propId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const editId = propId ?? searchParams.get('id');
    const { items, status } = useSelector((state) => state.badges);
    const existing = items.find((item) => Number(item.id) === Number(editId));

    const [form, setForm] = useState(defaultBadge);
    const [initial, setInitial] = useState(defaultBadge);
    const [saving, setSaving] = useState(false);

    // The list is the only source of a badge; land here directly (a bookmark,
    // a reload after saving) and it has not been fetched yet.
    useEffect(() => {
        if (items.length === 0 && status !== 'loading') dispatch(fetchBadges());
    }, []);

    useEffect(() => {
        if (!editId) return;
        if (!existing) return;

        const loaded = {
            title: existing.title || '',
            icon: existing.icon || '',
            color: existing.color || defaultBadge.color,
            icon_type: existing.icon_type || 'dashicon',
            shape: existing.shape || 'circle',
            border_color: existing.border_color || '#ffffff',
            text_color: existing.text_color || '#ffffff',
        };
        setForm(loaded);
        setInitial(loaded);
    }, [editId, existing]);

    const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const dirty = useMemo(
        () => JSON.stringify(form) !== JSON.stringify(initial),
        [form, initial]
    );

    const loading = !!editId && !existing && status === 'loading';

    const save = async () => {
        if (!form.title.trim()) {
            dispatch(showNotification({
                message: __('Badge title is required.', 'gameengine'),
                isShow: true,
                type: 'error',
            }));
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form, title: form.title.trim(), icon_type: iconTypeOf(form.icon) };

            if (editId) {
                const { payload: saved } = await dispatch(updateBadge({ id: editId, payload }));
                // Re-baseline from what came back, so Save disables again and a
                // value the backend rewrote (an unparseable colour) is visible.
                if (saved?.id) setInitial({ ...payload, ...saved });
                if (saved?.id) setForm((prev) => ({ ...prev, ...saved }));
            } else {
                const { payload: saved } = await dispatch(createBadge(payload));
                if (saved?.id) {
                    navigate(`${LIST_URL}&action=edit&id=${saved.id}`);
                } else {
                    setSaving(false);
                    return;
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const preview = { ...form, title: form.title || __('Badge', 'gameengine') };

    return (
        <>
            <TopBar
                path={editId ? __('Edit Badge', 'gameengine') : __('New Badge', 'gameengine')}
                hasBreadCrumb={true}
                items={[
                    { label: __('Badges', 'gameengine'), href: LIST_URL },
                    { label: form.title || (editId ? __('Untitled', 'gameengine') : __('New Badge', 'gameengine')) },
                ]}
                rightContent={
                    <div className="flex gap-2.5">
                        <Button
                            label={__('Cancel', 'gameengine')}
                            preset="secondary"
                            onClick={() => navigate(LIST_URL)}
                        />
                        <Button
                            label={editId ? __('Update Badge', 'gameengine') : __('Create Badge', 'gameengine')}
                            isLoading={saving}
                            isDisabled={saving || !dirty}
                            onClick={save}
                        />
                    </div>
                }
            />

            <div className="gameengine-page-content">
                {loading ? (
                    <p className="text-sm px-1 text-[var(--gameengine-warn-muted)]">
                        {__('Loading badge…', 'gameengine')}
                    </p>
                ) : (
                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
                        <div className="flex flex-col gap-6 min-w-0">
                            <GameEngineBox heading={__('Badge details', 'gameengine')}>
                                <div className="flex flex-col gap-5">
                                    <GameEngineInput label={__('Badge Title', 'gameengine')}>
                                        <input
                                            type="text"
                                            className="gameengine-input"
                                            value={form.title}
                                            onChange={(e) => change('title', e.target.value)}
                                            placeholder={__('e.g. Star Contributor', 'gameengine')}
                                        />
                                    </GameEngineInput>

                                    <GameEngineInput
                                        label={__('Icon', 'gameengine')}
                                        desc={__('Upload an image or pick a built-in icon. With neither, the badge shows the first letter of its title.', 'gameengine')}
                                    >
                                        <DashiconPicker
                                            value={form.icon}
                                            color={form.color}
                                            title={__('Select a badge image', 'gameengine')}
                                            onChange={(val) => change('icon', val)}
                                        />
                                    </GameEngineInput>
                                </div>
                            </GameEngineBox>

                            <GameEngineBox heading={__('Appearance', 'gameengine')}>
                                <div className="flex flex-col gap-5">
                                    <GameEngineInput label={__('Shape', 'gameengine')}>
                                        <div className="flex gap-3 flex-wrap">
                                            {SHAPES.map((shape) => (
                                                <ShapeTile
                                                    key={shape.value}
                                                    shape={shape}
                                                    active={form.shape === shape.value}
                                                    onClick={() => change('shape', shape.value)}
                                                />
                                            ))}
                                        </div>
                                    </GameEngineInput>

                                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                                        <GameEngineInput label={__('Background Color', 'gameengine')}>
                                            <ColorField
                                                value={form.color}
                                                onChange={(v) => change('color', v)}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Icon / Text Color', 'gameengine')}>
                                            <ColorField
                                                value={form.text_color}
                                                onChange={(v) => change('text_color', v)}
                                            />
                                        </GameEngineInput>
                                    </div>

                                    <GameEngineInput
                                        label={__('Border Color', 'gameengine')}
                                        desc={form.shape === 'shield'
                                            ? __('The Shield shape is clipped to its outline, so it has no border.', 'gameengine')
                                            : __('Border drawn around the badge.', 'gameengine')}
                                    >
                                        <div style={{ opacity: form.shape === 'shield' ? 0.45 : 1 }}>
                                            <ColorField
                                                value={form.border_color}
                                                onChange={(v) => change('border_color', v)}
                                            />
                                        </div>
                                    </GameEngineInput>
                                </div>
                            </GameEngineBox>
                        </div>

                        <div className="xl:sticky" style={{ top: '110px' }}>
                            <GameEngineBox heading={__('Preview', 'gameengine')}>
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <BadgeGlyph badge={preview} size={112} />
                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-[var(--gameengine-font-color)]">
                                            {form.title || __('Badge Name', 'gameengine')}
                                        </div>
                                        <div className="text-xs capitalize text-[var(--gameengine-placeholder)]">
                                            {form.shape}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="flex items-center justify-center gap-4 mt-4 pt-4"
                                    style={{ borderTop: '1px solid var(--gameengine-border-color)' }}
                                >
                                    {/* The sizes it is actually rendered at elsewhere — a badge
                                        that reads well at 112px can be a smudge in a list. */}
                                    <BadgeGlyph badge={preview} size={48} />
                                    <BadgeGlyph badge={preview} size={32} />
                                    <BadgeGlyph badge={preview} size={20} />
                                </div>

                                <div
                                    className="flex items-center justify-center gap-4 mt-4 pt-4 rounded-md"
                                    style={{
                                        borderTop: '1px solid var(--gameengine-border-color)',
                                    }}
                                >
                                    {/* A white border on a white card is invisible until it is
                                        put on something darker. */}
                                    <div className="flex-1 flex justify-center py-3 rounded-md" style={{ background: '#ffffff' }}>
                                        <BadgeGlyph badge={preview} size={40} />
                                    </div>
                                    <div className="flex-1 flex justify-center py-3 rounded-md" style={{ background: '#1f2430' }}>
                                        <BadgeGlyph badge={preview} size={40} />
                                    </div>
                                </div>
                            </GameEngineBox>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default BadgeEditor;
