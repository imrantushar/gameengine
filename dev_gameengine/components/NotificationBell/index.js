import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { FiBell, FiCheck } from 'react-icons/fi';
import {
    fetchNotifications,
    markRead,
    markAllRead,
    toggleBell,
    closeBell,
} from '@GFRedux/Slices/notificationCenterSlice/notificationCenterSlice';

const typeIcon = (type) => {
    const map = {
        points_added: '🪙',
        points_deducted: '📉',
        achievement: '🏆',
        level_up: '⬆️',
        rank: '🎖️',
    };
    return map[type] || '🔔';
};

const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return __('Just now', 'gameengine');
    if (diff < 3600) return Math.floor(diff / 60) + __('m ago', 'gameengine');
    if (diff < 86400) return Math.floor(diff / 3600) + __('h ago', 'gameengine');
    return Math.floor(diff / 86400) + __('d ago', 'gameengine');
};

const NotificationBell = () => {
    const dispatch = useDispatch();
    const { items, unread, isOpen } = useSelector(state => state.notificationCenter);
    const panelRef = useRef(null);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                dispatch(closeBell());
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleItemClick = (item) => {
        if (item.is_read !== '1') {
            dispatch(markRead(item.id));
        }
    };

    const handleMarkAllRead = () => {
        dispatch(markAllRead());
    };

    return (
        <div className="ge-notification-bell" ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => dispatch(toggleBell())}
                className="ge-bell-btn"
                title={__('Notifications', 'gameengine')}
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'inherit',
                }}
            >
                <FiBell size={20} />
                {unread > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: '#e53e3e',
                            color: '#fff',
                            borderRadius: '9999px',
                            fontSize: '10px',
                            fontWeight: '700',
                            minWidth: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 3px',
                            lineHeight: '1',
                        }}
                    >
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '340px',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        zIndex: 9999,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e2e8f0',
                        }}
                    >
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            {__('Notifications', 'gameengine')}
                            {unread > 0 && (
                                <span
                                    style={{
                                        marginLeft: '6px',
                                        background: '#e53e3e',
                                        color: '#fff',
                                        borderRadius: '9999px',
                                        fontSize: '11px',
                                        padding: '1px 6px',
                                    }}
                                >
                                    {unread}
                                </span>
                            )}
                        </span>
                        {unread > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: 'var(--gameengine-primary-color, #6c5ce7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: 0,
                                }}
                            >
                                <FiCheck size={13} />
                                {__('Mark all read', 'gameengine')}
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {items.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#a0aec0', fontSize: '13px' }}>
                                {__('No notifications yet.', 'gameengine')}
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    style={{
                                        display: 'flex',
                                        gap: '10px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f7f7f7',
                                        background: item.is_read === '1' ? '#fff' : '#f0f4ff',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: '1.4' }}>
                                        {typeIcon(item.type)}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#2d3748', lineHeight: '1.5', wordBreak: 'break-word' }}>
                                            {item.message}
                                        </p>
                                        <span style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px', display: 'block' }}>
                                            {relativeTime(item.created_at)}
                                        </span>
                                    </div>
                                    {item.is_read !== '1' && (
                                        <span
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '9999px',
                                                background: 'var(--gameengine-primary-color, #6c5ce7)',
                                                flexShrink: 0,
                                                marginTop: '6px',
                                            }}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
