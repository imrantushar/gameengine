import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
import ListTable from '@GFComponents/ListTable';
import Modal from '@GFComponents/Modal/Modal';
import OptionMenu from '@GFComponents/OptionMenu';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { FiEye, FiCamera, FiTrash2, FiPlay, FiCheck } from 'react-icons/fi';
import { API, namespace } from '@GFUtils/helper';

const STATUS_COLORS = { draft: '#94a3b8', active: '#10b981', completed: '#6c5ce7' };

const Seasons = () => {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', start_date: '', end_date: '' });
    const [rankings, setRankings] = useState({});
    const [rankingsSeason, setRankingsSeason] = useState(null);
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
            await API.post(namespace + 'pro/seasons', form);
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
        } catch (e) {
            console.warn(e);
        } finally {
            setSnapshotting(null);
        }
    };

    const viewRankings = async (season) => {
        if (!rankings[season.id]) {
            const res = await API.get(namespace + 'pro/seasons/' + season.id + '/rankings');
            setRankings(r => ({ ...r, [season.id]: res.data }));
        }
        setRankingsSeason(season);
    };

    const setStatus = async (season, status) => {
        await API.put(namespace + 'pro/seasons/' + season.id, { ...season, status });
        fetchAll();
    };

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            name: __('Dates', 'gameengine'),
            cell: (row) => <span className="text-sm text-gray-500">{row.start_date} → {row.end_date}</span>,
        },
        {
            name: __('Status', 'gameengine'),
            cell: (row) => (
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: STATUS_COLORS[row.status] + '20', color: STATUS_COLORS[row.status], fontWeight: '600' }}>
                    {row.status}
                </span>
            ),
        },
        {
            name: __('Actions', 'gameengine'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: 'button',
                            label: snapshotting === row.id ? __('Capturing…', 'gameengine') : __('Capture Rankings', 'gameengine'),
                            icon: <FiCamera />,
                            onClick: () => captureSnapshot(row.id),
                            hasBorder: true,
                        },
                        {
                            type: 'button',
                            label: __('View Rankings', 'gameengine'),
                            icon: <FiEye />,
                            onClick: () => viewRankings(row),
                            hasBorder: true,
                        },
                        ...(row.status === 'draft' ? [{
                            type: 'button',
                            label: __('Activate', 'gameengine'),
                            icon: <FiPlay />,
                            onClick: () => setStatus(row, 'active'),
                            hasBorder: true,
                        }] : []),
                        ...(row.status === 'active' ? [{
                            type: 'button',
                            label: __('Complete', 'gameengine'),
                            icon: <FiCheck />,
                            onClick: () => setStatus(row, 'completed'),
                            hasBorder: true,
                        }] : []),
                        ...(row.status === 'draft' ? [{
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gameengine'),
                            icon: <FiTrash2 />,
                            onClick: () => deleteSeason(row.id),
                        }] : []),
                    ]}
                />
            ),
        },
    ];

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

                <ListTable
                    columns={columns}
                    data={seasons}
                    dataFetchingStatus={loading}
                    noDataText={__('No seasons yet. Create your first season!', 'gameengine')}
                    showSubHeader={false}
                    showColumnFilter={false}
                    showPagination={false}
                    isRowSelectable={false}
                />
            </div>

            <Modal
                isOpen={modal === 'create'}
                title={__('New Season', 'gameengine')}
                onRequestClose={closeModal}
                size="small"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button label={__('Create Season', 'gameengine')} isLoading={saving} onClick={save} type="button" />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Season Name', 'gameengine')}>
                        <input className="gameengine-input" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Spring 2026" />
                    </GameEngineInput>
                    <GameEngineInput label={__('Start Date', 'gameengine')}>
                        <input type="date" className="gameengine-input" value={form.start_date}
                            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                    </GameEngineInput>
                    <GameEngineInput label={__('End Date', 'gameengine')}>
                        <input type="date" className="gameengine-input" value={form.end_date}
                            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                    </GameEngineInput>
                </div>
            </Modal>

            <Modal
                isOpen={!!rankingsSeason}
                title={rankingsSeason ? __('Rankings:', 'gameengine') + ' ' + rankingsSeason.name : ''}
                onRequestClose={() => setRankingsSeason(null)}
                size="small"
            >
                <div className="p-4">
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: '#64748b', fontSize: '12px' }}>
                                <th style={{ textAlign: 'left', padding: '4px 0' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '4px 0' }}>{__('User', 'gameengine')}</th>
                                <th style={{ textAlign: 'right', padding: '4px 0' }}>{__('Points', 'gameengine')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(rankingsSeason && rankings[rankingsSeason.id] || []).map(r => (
                                <tr key={r.position} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '5px 0', width: '40px' }}>{r.position}</td>
                                    <td style={{ padding: '5px 0' }}>{r.display_name}</td>
                                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: '600' }}>{Number(r.total_points).toLocaleString()}</td>
                                </tr>
                            ))}
                            {rankingsSeason && (rankings[rankingsSeason.id] || []).length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '10px 0', color: '#94a3b8', textAlign: 'center' }}>{__('No rankings captured yet.', 'gameengine')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>
    );
};

export default Seasons;
