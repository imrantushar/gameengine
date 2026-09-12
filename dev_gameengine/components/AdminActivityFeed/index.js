import React, { useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiBell, FiRefreshCw } from 'react-icons/fi';
import { admin_url, API, namespace, relativeTime } from '@GFUtils/helper';

// Keyed on what NotificationManager actually stores. The previous keys —
// points_added, level_up — matched nothing, so every row but an achievement
// fell through to the bell.
const TYPE_ICONS = {
    points:      '🪙',
    achievement: '🏆',
    level:       '⬆️',
};


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
                    color: 'var(--gameengine-warn-muted)',
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
                        background: 'var(--gameengine-placing)',
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
                    background: 'var(--gameengine-background)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                    border: '1px solid var(--gameengine-border-color)',
                    zIndex: 9999,
                    overflow: 'hidden',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--gameengine-border-color)' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--gameengine-font-color)' }}>
                            {__('Platform Activity', 'gameengine')}
                        </strong>
                        <button
                            onClick={fetchFeed}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gameengine-warn-muted)', display: 'flex', alignItems: 'center' }}
                            title={__('Refresh', 'gameengine')}
                        >
                            <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                    </div>

                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                        {loading && items.length === 0 && (
                            <p style={{ padding: '16px', textAlign: 'center', color: 'var(--gameengine-placeholder)', fontSize: '13px', margin: 0 }}>
                                {__('Loading…', 'gameengine')}
                            </p>
                        )}
                        {!loading && items.length === 0 && (
                            <p style={{ padding: '16px', textAlign: 'center', color: 'var(--gameengine-placeholder)', fontSize: '13px', margin: 0 }}>
                                {__('No recent activity', 'gameengine')}
                            </p>
                        )}
                        {items.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 14px',
                                borderBottom: '1px solid var(--gameengine-secondary-color)',
                            }}>
                                <span style={{ fontSize: '16px', lineHeight: '1', marginTop: '2px', flexShrink: 0 }}>
                                    {TYPE_ICONS[item.type] || '🔔'}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--gameengine-font-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.display_name}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gameengine-warn-muted)', lineHeight: '1.4' }}>
                                        {item.message}
                                    </p>
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--gameengine-placeholder)', flexShrink: 0, marginTop: '2px' }}>
                                    {relativeTime(item.created_at)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '8px 14px', borderTop: '1px solid var(--gameengine-border-color)', textAlign: 'right' }}>
                        <a
                            href={`${admin_url}admin.php?page=gameengine-activity`}
                            style={{ fontSize: '12px', color: 'var(--gameengine-primary)', textDecoration: 'none' }}
                        >
                            {__('View All', 'gameengine')}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminActivityFeed;
