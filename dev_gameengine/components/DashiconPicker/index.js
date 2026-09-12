import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';

const DASHICONS = [
    'dashicons-star-filled', 'dashicons-star-half', 'dashicons-star-empty',
    'dashicons-awards', 'dashicons-thumbs-up', 'dashicons-heart',
    'dashicons-smiley', 'dashicons-groups', 'dashicons-admin-users',
    'dashicons-shield', 'dashicons-shield-alt', 'dashicons-superhero',
    'dashicons-chart-bar', 'dashicons-chart-line', 'dashicons-chart-pie',
    'dashicons-chart-area', 'dashicons-games', 'dashicons-buddicons-activity',
    'dashicons-universal-access', 'dashicons-plus-alt', 'dashicons-update',
    'dashicons-lightbulb', 'dashicons-info', 'dashicons-yes-alt',
    'dashicons-tickets-alt', 'dashicons-cart', 'dashicons-money-alt',
    'dashicons-palmtree', 'dashicons-megaphone', 'dashicons-performance',
    'dashicons-search', 'dashicons-visibility', 'dashicons-lock',
    'dashicons-unlock', 'dashicons-flag', 'dashicons-location',
    'dashicons-location-alt', 'dashicons-tag', 'dashicons-nametag',
    'dashicons-id', 'dashicons-id-alt', 'dashicons-camera',
    'dashicons-images-alt2', 'dashicons-video-alt3', 'dashicons-playlist-video',
    'dashicons-rss', 'dashicons-email-alt', 'dashicons-share',
    'dashicons-share-alt', 'dashicons-share-alt2', 'dashicons-twitter',
    'dashicons-facebook-alt', 'dashicons-clock', 'dashicons-calendar-alt',
    'dashicons-list-view', 'dashicons-grid-view', 'dashicons-move',
    'dashicons-randomize', 'dashicons-redo', 'dashicons-undo',
];

const isDashiconValue = (value) =>
    typeof value === 'string' && value.startsWith('dashicons-');

/**
 * Pick an icon: upload one, or choose a dashicon.
 *
 * Both write the same field. An uploaded image is stored as its media URL and
 * a dashicon as its slug, so the value tells you which of the two it is.
 */
const DashiconPicker = ({ value, onChange, color, title }) => {
    const hasDashicon = isDashiconValue(value);
    const hasImage = !!value && !hasDashicon;

    // Follow whatever is already set; default to the icon grid, since that is
    // the choice most levels and badges make.
    const [mode, setMode] = useState(hasImage ? 'image' : 'dashicon');

    // Switching tabs used to clear the field, so glancing at the other option
    // lost the icon you had picked.
    const openMediaLibrary = () => {
        if (typeof wp === 'undefined' || !wp.media) {
            return;
        }

        const frame = wp.media({
            title: title || __('Select an image', 'gameengine'),
            button: { text: __('Use this image', 'gameengine') },
            library: { type: 'image' },
            multiple: false,
        });

        frame.on('select', () => {
            const media = frame.state().get('selection').first().toJSON();
            onChange(media.url);
        });

        frame.open();
    };

    const tab = (key, label) => (
        <button
            type="button"
            onClick={() => setMode(key)}
            style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid var(--gameengine-border-color)',
                background: mode === key ? 'var(--gameengine-primary)' : 'var(--gameengine-background)',
                color: mode === key ? '#fff' : 'var(--gameengine-warn-muted)',
                cursor: 'pointer',
            }}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
                <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '6px',
                        border: '1px solid var(--gameengine-border-color)',
                        background: 'var(--gameengine-secondary-color)',
                        overflow: 'hidden',
                    }}
                >
                    {hasDashicon && (
                        <span
                            className={`dashicons ${value}`}
                            style={{ fontSize: '28px', width: '28px', height: '28px', color: color || 'var(--gameengine-primary)' }}
                        />
                    )}
                    {hasImage && (
                        <img src={value} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                    {!value && (
                        <span style={{ fontSize: '11px', color: 'var(--gameengine-placeholder)' }}>
                            {__('None', 'gameengine')}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        {tab('image', __('Upload image', 'gameengine'))}
                        {tab('dashicon', __('Choose icon', 'gameengine'))}
                    </div>

                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            style={{
                                alignSelf: 'flex-start',
                                padding: 0,
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                color: 'var(--gameengine-warn-muted)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                            }}
                        >
                            {__('Remove', 'gameengine')}
                        </button>
                    )}
                </div>
            </div>

            {mode === 'image' && (
                <button
                    type="button"
                    onClick={openMediaLibrary}
                    className="text-white text-xs font-medium leading-4 h-auto border-none rounded bg-[var(--gameengine-primary-strong)]"
                    style={{ padding: '8px 12px', cursor: 'pointer' }}
                >
                    {hasImage ? __('Replace image', 'gameengine') : __('Choose from Media Library', 'gameengine')}
                </button>
            )}

            {mode === 'dashicon' && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, 36px)',
                    gap: '4px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    padding: '8px',
                    border: '1px solid var(--gameengine-border-color)',
                    borderRadius: '6px',
                    background: 'var(--gameengine-secondary-color)',
                }}>
                    {DASHICONS.map((slug) => (
                        <button
                            key={slug}
                            type="button"
                            title={slug.replace('dashicons-', '')}
                            onClick={() => onChange(slug)}
                            style={{
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: value === slug
                                    ? '2px solid var(--gameengine-primary)'
                                    : '1px solid var(--gameengine-border-color)',
                                borderRadius: '4px',
                                background: value === slug
                                    ? 'var(--gameengine-primary-light)'
                                    : 'var(--gameengine-background)',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            <span
                                // The base `dashicons` class is what applies the
                                // icon font; the modifier alone renders a box.
                                className={`dashicons ${slug}`}
                                style={{
                                    fontSize: '18px',
                                    color: value === slug ? 'var(--gameengine-primary)' : 'var(--gameengine-warn-muted)',
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashiconPicker;
