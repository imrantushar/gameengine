import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
import { API, namespace } from '@GFUtils/helper';

const STATUS_COLORS = { draft: '#94a3b8', active: '#10b981', completed: '#6c5ce7' };

const Seasons = () => {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', start_date: '', end_date: '' });
    const [rankings, setRankings] = useState({});
    const [expanded, setExpanded] = useState(null);
    const [snapshotting, setSnapshotting] = useState(null);

    const fetchAll = () => {
        setLoading(true);
        API.get(namespace + 'pro/seasons')
            .then(res => setSeasons(res.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreate = () => { setForm({ name: '', start_date: '', end_date: '' }); setModal('create'); };
    const closeModal = () => { setModal(null); };

    const save = async () => {
        setSaving(true);
        try {
            if (modal === 'create') {
                await API.post(namespace + 'pro/seasons', form);
            } else {
                await API.put(namespace + 'pro/seasons/' + form.id, form);
            }
            fetchAll();
            closeModal();
        } catch (e) {
            console.warn(e);
        } finally {
            setSaving(false);
        }
    };

    const deleteSeason = async (id) => {
        if (!window.confirm(__('Delete this draft season?', 'gameengine'))) return;
        await API.delete(namespace + 'pro/seasons/' + id);
        fetchAll();
    };

    const captureSnapshot = async (id) => {
        setSnapshotting(id);
        try {
            await API.post(namespace + 'pro/seasons/' + id + '/snapshot', {});
            const res = await API.get(namespace + 'pro/seasons/' + id + '/rankings');
            setRankings(r => ({ ...r, [id]: res.data }));
            setExpanded(id);
        } catch (e) {
            console.warn(e);
        } finally {
            setSnapshotting(null);
        }
    };

    const viewRankings = async (id) => {
        if (expanded === id) { setExpanded(null); return; }
        if (!rankings[id]) {
            const res = await API.get(namespace + 'pro/seasons/' + id + '/rankings');
            setRankings(r => ({ ...r, [id]: res.data }));
        }
        setExpanded(id);
    };

    const setStatus = async (season, status) => {
        await API.put(namespace + 'pro/seasons/' + season.id, { ...season, status });
        fetchAll();
    };

    return (
        <>
            <TopBar path={__('Seasons', 'gameengine')} rightContent={
                <Button label={__('+ New Season', 'gameengine')} onClick={openCreate} />
            } />
            <div className="gameengine-page-content">
                <h2 className="gameengine-page-heading py-6">{__('Leaderboard Seasons', 'gameengine')}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    {__('Create named seasons and capture point rankings snapshots. Use [gameengine_leaderboard season_id=1] to show a season\'s leaderboard.', 'gameengine')}
                </p>

                {loading ? (
                    <p style={{ color: '#94a3b8' }}>{__('Loading…', 'gameengine')}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {seasons.map(season => (
                            <div key={season.id} style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ fontSize: '15px' }}>{season.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                            {season.start_date} → {season.end_date}
                                        </div>
                                    </div>
                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: STATUS_COLORS[season.status] + '20', color: STATUS_COLORS[season.status], fontWeight: '600' }}>
                                        {season.status}
                                    </span>
                                    <button onClick={() => captureSnapshot(season.id)} disabled={snapshotting === season.id}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '12px' }}>
                                        {snapshotting === season.id ? '…' : __('Capture Rankings', 'gameengine')}
                                    </button>
                                    <button onClick={() => viewRankings(season.id)}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '12px' }}>
                                        {expanded === season.id ? __('Hide Rankings', 'gameengine') : __('View Rankings', 'gameengine')}
                                    </button>
                                    {season.status === 'draft' && (
                                        <button onClick={() => setStatus(season, 'active')}
                                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                                            {__('Activate', 'gameengine')}
                                        </button>
                                    )}
                                    {season.status === 'active' && (
                                        <button onClick={() => setStatus(season, 'completed')}
                                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#6c5ce7', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                                            {__('Complete', 'gameengine')}
                                        </button>
                                    )}
                                    {season.status === 'draft' && (
                                        <button onClick={() => deleteSeason(season.id)}
                                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>
                                            {__('Delete', 'gameengine')}
                                        </button>
                                    )}
                                </div>

                                {expanded === season.id && rankings[season.id] && (
                                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px' }}>
                                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: '#64748b', fontSize: '12px' }}>
                                                    <th style={{ textAlign: 'left', padding: '4px 0' }}>#</th>
                                                    <th style={{ textAlign: 'left', padding: '4px 0' }}>{__('User', 'gameengine')}</th>
                                                    <th style={{ textAlign: 'right', padding: '4px 0' }}>{__('Points', 'gameengine')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankings[season.id].map(r => (
                                                    <tr key={r.position} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                        <td style={{ padding: '5px 0', width: '40px' }}>{r.position}</td>
                                                        <td style={{ padding: '5px 0' }}>{r.display_name}</td>
                                                        <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: '600' }}>{Number(r.total_points).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {rankings[season.id].length === 0 && (
                                                    <tr><td colSpan={3} style={{ padding: '10px 0', color: '#94a3b8', textAlign: 'center' }}>{__('No rankings captured yet.', 'gameengine')}</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                        {seasons.length === 0 && (
                            <div style={{ background: '#fff', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                                {__('No seasons yet. Create your first season!', 'gameengine')}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', width: '420px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,.15)' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '17px' }}>{__('New Season', 'gameengine')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Season Name', 'gameengine')}
                                <input className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Spring 2026" />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Start Date', 'gameengine')}
                                <input type="date" className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} value={form.start_date}
                                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('End Date', 'gameengine')}
                                <input type="date" className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} value={form.end_date}
                                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                            <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>{__('Cancel', 'gameengine')}</button>
                            <Button label={__('Create Season', 'gameengine')} isLoading={saving} onClick={save} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Seasons;
