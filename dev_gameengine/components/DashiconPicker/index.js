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
    'dashicons-fire', 'dashicons-lightbulb', 'dashicons-info',
    'dashicons-yes-alt', 'dashicons-medals', 'dashicons-tickets-alt',
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

const DashiconPicker = ({ value, onChange }) => {
    const isDashicon = typeof value === 'string' && value.startsWith('dashicons-');
    const [mode, setMode] = useState(isDashicon ? 'dashicon' : 'url');

    const switchMode = (newMode) => {
        setMode(newMode);
        onChange('');
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                    type="button"
                    onClick={() => switchMode('url')}
                    style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e0',
                        background: mode === 'url' ? '#6c5ce7' : '#fff',
                        color: mode === 'url' ? '#fff' : '#4a5568',
                        cursor: 'pointer',
                    }}
                >
                    {__('Image URL', 'gameengine')}
                </button>
                <button
                    type="button"
                    onClick={() => switchMode('dashicon')}
                    style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e0',
                        background: mode === 'dashicon' ? '#6c5ce7' : '#fff',
                        color: mode === 'dashicon' ? '#fff' : '#4a5568',
                        cursor: 'pointer',
                    }}
                >
                    {__('Dashicon', 'gameengine')}
                </button>
            </div>

            {mode === 'url' && (
                <input
                    type="text"
                    className="gameengine-input"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://example.com/icon.png"
                />
            )}

            {mode === 'dashicon' && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 36px)',
                    gap: '4px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: '#f7fafc',
                }}>
                    {DASHICONS.map(slug => (
                        <button
                            key={slug}
                            type="button"
                            title={slug}
                            onClick={() => onChange(slug)}
                            style={{
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: value === slug ? '2px solid #6c5ce7' : '1px solid #e2e8f0',
                                borderRadius: '4px',
                                background: value === slug ? '#ede9fe' : '#fff',
                                cursor: 'pointer',
                                padding: 0,
                                boxShadow: value === slug ? '0 0 0 2px #c4b5fd' : 'none',
                            }}
                        >
                            <span className={slug} style={{ fontSize: '18px', color: value === slug ? '#6c5ce7' : '#4a5568' }} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashiconPicker;
