import React, { useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiBell, FiRefreshCw } from 'react-icons/fi';
import { API, namespace } from '@GFUtils/helper';

const TYPE_ICONS = {
    points_added:    '🪙',
    points_deducted: '📉',
    achievement:     '🏆',
    level_up:        '⬆️',
    rank:            '🎖️',
};

function relativeTime(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)  return __('Just now', 'gameengine');
    if (diff < 3600) return Math.floor(diff / 60) + __('m ago', 'gameengine');
    if (diff < 86400) return Math.floor(diff / 3600) + __('h ago', 'gameengine');
    return Math.floor(diff / 86400) + __('d ago', 'gameengine');
}

const AdminActivityFeed = () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [recentCount, setRecentCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const res = await API.get(namespace + 'notifications/admin-feed');
            setItems(res.data || []);
            const count = parseInt(res.headers['x-ge-recent-count'] || '0', 10);
            setRecentCount(count);
        } catch (e) {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const badgeLabel = recentCount > 99 ? '99+' : recentCount;

    return (
        <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4a5568',
                    position: 'relative',
                }}
                title={__('Platform Activity Feed', 'gameengine')}
            >
                <FiBell size={20} />
                {recentCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: '#e53e3e',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '700',
                        borderRadius: '10px',
                        padding: '1px 4px',
                        lineHeight: '14px',
                        minWidth: '14px',
                        textAlign: 'center',
                    }}>
                        {badgeLabel}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '340px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                    border: '1px solid #e2e8f0',
                    zIndex: 9999,
                    overflow: 'hidden',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                        <strong style={{ fontSize: '13px', color: '#2d3748' }}>
                            {__('Platform Activity', 'gameengine')}
                        </strong>
                        <button
                            onClick={fetchFeed}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center' }}
                            title={__('Refresh', 'gameengine')}
                        >
                            <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                    </div>

                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                        {loading && items.length === 0 && (
                            <p style={{ padding: '16px', textAlign: 'center', color: '#a0aec0', fontSize: '13px', margin: 0 }}>
                                {__('Loading…', 'gameengine')}
                            </p>
                        )}
                        {!loading && items.length === 0 && (
                            <p style={{ padding: '16px', textAlign: 'center', color: '#a0aec0', fontSize: '13px', margin: 0 }}>
                                {__('No recent activity', 'gameengine')}
                            </p>
                        )}
                        {items.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 14px',
                                borderBottom: '1px solid #f7fafc',
                            }}>
                                <span style={{ fontSize: '16px', lineHeight: '1', marginTop: '2px', flexShrink: 0 }}>
                                    {TYPE_ICONS[item.type] || '🔔'}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#2d3748', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.display_name}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#4a5568', lineHeight: '1.4' }}>
                                        {item.message}
                                    </p>
                                </div>
                                <span style={{ fontSize: '11px', color: '#a0aec0', flexShrink: 0, marginTop: '2px' }}>
                                    {relativeTime(item.created_at)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '8px 14px', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                        <a href="#" style={{ fontSize: '12px', color: '#6c5ce7', textDecoration: 'none' }}>
                            {__('View All', 'gameengine')}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminActivityFeed;
