import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import { API, namespace } from '@GFUtils/helper';

const CSSBarChart = ({ data, labelKey, valueKey, color = '#6c5ce7' }) => {
    const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px', overflowX: 'auto' }}>
            {data.map((d, i) => {
                const pct = ((Number(d[valueKey]) || 0) / max) * 100;
                return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                        <div title={`${d[labelKey]}: ${d[valueKey]}`} style={{
                            width: '18px',
                            height: `${pct}%`,
                            minHeight: pct > 0 ? '2px' : '0',
                            background: color,
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.3s',
                        }} />
                    </div>
                );
            })}
        </div>
    );
};

const Card = ({ title, children }) => (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>{title}</h4>
        {children}
    </div>
);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get(namespace + 'pro/analytics')
            .then(res => setData(res.data))
            .catch(() => setError(__('Failed to load analytics data.', 'gameengine')))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <TopBar path={__('Analytics', 'gameengine')} />
            <div className="gameengine-page-content">
                <h2 className="gameengine-page-heading py-6">{__('Analytics', 'gameengine')}</h2>

                {loading && <p style={{ color: '#64748b' }}>{__('Loading…', 'gameengine')}</p>}
                {error && <p style={{ color: '#dc2626' }}>{error}</p>}

                {data && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                            <Card title={__('Active Streaks', 'gameengine')}>
                                <div style={{ fontSize: '36px', fontWeight: '700', color: '#6c5ce7' }}>
                                    {data.active_streaks_count}
                                </div>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                                    {__('users currently on a streak', 'gameengine')}
                                </p>
                            </Card>
                        </div>

                        <Card title={__('Points Awarded (Last 30 Days)', 'gameengine')}>
                            <CSSBarChart data={data.points_by_day} labelKey="date" valueKey="total" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                <span>{data.points_by_day[0]?.date}</span>
                                <span>{data.points_by_day[data.points_by_day.length - 1]?.date}</span>
                            </div>
                        </Card>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Card title={__('Top 10 Earners', 'gameengine')}>
                                <ol style={{ margin: 0, padding: '0 0 0 20px', fontSize: '13px' }}>
                                    {data.top_earners.map((u, i) => (
                                        <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{u.display_name}</span>
                                            <strong>{Number(u.total_points).toLocaleString()}</strong>
                                        </li>
                                    ))}
                                    {data.top_earners.length === 0 && <li style={{ color: '#94a3b8' }}>{__('No data yet.', 'gameengine')}</li>}
                                </ol>
                            </Card>

                            <Card title={__('Most Unlocked Achievements', 'gameengine')}>
                                <ol style={{ margin: 0, padding: '0 0 0 20px', fontSize: '13px' }}>
                                    {data.achievement_counts.map((a, i) => (
                                        <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{a.title}</span>
                                            <strong>{a.unlock_count}</strong>
                                        </li>
                                    ))}
                                    {data.achievement_counts.length === 0 && <li style={{ color: '#94a3b8' }}>{__('No data yet.', 'gameengine')}</li>}
                                </ol>
                            </Card>
                        </div>

                        <Card title={__('Rank Distribution', 'gameengine')}>
                            <CSSBarChart data={data.rank_distribution} labelKey="title" valueKey="user_count" color="#10b981" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                {data.rank_distribution.map((r, i) => (
                                    <span key={i} style={{ fontSize: '12px', color: '#64748b' }}>
                                        {r.title}: <strong>{r.user_count}</strong>
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
};

export default Analytics;
