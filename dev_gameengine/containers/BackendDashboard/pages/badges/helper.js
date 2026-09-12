import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';

/**
 * BadgeManager stores the colour through `sanitize_hex_color()`, which rejects
 * anything that is not a hex triplet and falls back to exactly this value. The
 * form used to default to `var(--gameengine-primary)` — not a value an
 * <input type="color"> can display, so the swatch rendered black while the
 * database received indigo. Default to what actually gets saved.
 */
export const DEFAULT_COLOR = '#6366f1';

export const defaultBadge = {
    title: '',
    icon: '',
    color: DEFAULT_COLOR,
    icon_type: 'dashicon',
    shape: 'circle',
    border_color: '#ffffff',
    text_color: '#ffffff',
};

export const SHAPES = [
    { value: 'circle', label: __('Circle', 'gameengine') },
    { value: 'square', label: __('Square', 'gameengine') },
    { value: 'shield', label: __('Shield', 'gameengine') },
];

const SHIELD_CLIP = 'polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)';

/**
 * `icon_type` is derived, never chosen — the value itself says which it is.
 * The picker writes a dashicon slug or a media URL into one field, so a
 * separate control for the type could only ever contradict it.
 */
export const iconTypeOf = (icon) => {
    if (!icon) return 'dashicon'; // what format_badge() falls back to when unset
    return icon.startsWith('dashicons-') ? 'dashicon' : 'url';
};

export const getBadgeStyle = (shape, color, borderColor, borderWidth = 2) => {
    const base = {
        backgroundColor: color || DEFAULT_COLOR,
        border: `${borderWidth}px solid ${borderColor || '#ffffff'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    };

    if (shape === 'square') return { ...base, borderRadius: '22%' };
    // A clip-path crops the border away, so drawing one only wastes the inset.
    if (shape === 'shield') return { ...base, borderRadius: 0, clipPath: SHIELD_CLIP, border: 'none' };

    return { ...base, borderRadius: '50%' };
};

/**
 * One renderer for a badge, shared by the list and the editor preview so the
 * two cannot drift apart on what a saved badge actually looks like.
 */
export const BadgeGlyph = ({ badge = {}, size = 64 }) => {
    const style = {
        ...getBadgeStyle(badge.shape, badge.color, badge.border_color, Math.max(1, Math.round(size / 32))),
        width: size,
        height: size,
    };
    const iconColor = badge.text_color || '#ffffff';

    if (badge.icon && badge.icon.startsWith('dashicons-')) {
        return (
            <div style={style}>
                {/* The base `dashicons` class applies the font; the modifier alone renders a box. */}
                <span
                    className={`dashicons ${badge.icon}`}
                    style={{
                        fontSize: size * 0.45,
                        width: size * 0.45,
                        height: size * 0.45,
                        lineHeight: 1,
                        color: iconColor,
                    }}
                />
            </div>
        );
    }

    if (badge.icon) {
        return (
            <div style={style}>
                <img
                    src={badge.icon}
                    alt={badge.title || ''}
                    style={{ width: size * 0.58, height: size * 0.58, objectFit: 'contain' }}
                />
            </div>
        );
    }

    return (
        <div style={style}>
            <span style={{ color: iconColor, fontSize: size * 0.4, fontWeight: 700, lineHeight: 1 }}>
                {(badge.title || '?').charAt(0).toUpperCase()}
            </span>
        </div>
    );
};

const isHex = (v) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(v);

/**
 * A colour swatch with a typable hex field.
 *
 * The old form printed the value as static text, so a brand colour could only
 * be reached by hunting through the OS colour picker — there was no way to
 * paste one in.
 */
export const ColorField = ({ value, onChange, id }) => {
    const [draft, setDraft] = useState(null);
    const shown = draft ?? value ?? '';
    const valid = isHex(shown);

    return (
        <div className="flex items-center gap-2">
            <label
                className="relative shrink-0 cursor-pointer rounded-md overflow-hidden"
                style={{
                    width: '38px',
                    height: '38px',
                    border: '1px solid var(--gameengine-border-color)',
                    background: valid ? shown : 'transparent',
                }}
                title={__('Pick a colour', 'gameengine')}
            >
                <input
                    id={id}
                    type="color"
                    value={valid ? shown : DEFAULT_COLOR}
                    onChange={(e) => { setDraft(null); onChange(e.target.value); }}
                    style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }}
                />
            </label>

            <input
                type="text"
                className="gameengine-input"
                style={{ width: '116px', fontFamily: 'monospace', textTransform: 'lowercase' }}
                value={shown}
                spellCheck={false}
                onChange={(e) => {
                    const next = e.target.value;
                    setDraft(next);
                    if (isHex(next)) onChange(next);
                }}
                onBlur={() => setDraft(null)}
                aria-invalid={!valid}
            />

            {!valid && (
                <span className="text-xs" style={{ color: 'var(--gameengine-placing, #d63638)' }}>
                    {__('Use a hex value', 'gameengine')}
                </span>
            )}
        </div>
    );
};
