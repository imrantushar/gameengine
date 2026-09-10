import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
import ListTable from '@GFComponents/ListTable';
import Modal from '@GFComponents/Modal/Modal';
import OptionMenu from '@GFComponents/OptionMenu';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { FiEye, FiCamera, FiTrash2, FiPlay, FiCheck, FiEdit2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import { API, namespace } from '@GFUtils/helper';

const STATUS_COLORS = { draft: 'var(--gameengine-placeholder)', active: 'var(--gameengine-success)', completed: 'var(--gameengine-primary)' };

// A REST rejection carries its reason; the screen used to swallow it, so a
// refused save looked like a button that did nothing.
const errorMessage = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

const Seasons = () => {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', start_date: '', end_date: '' });
    const [rankings, setRankings] = useState({});
    const [rankingsSeason, setRankingsSeason] = useState(null);
    const [snapshotting, setSnapshotting] = useState(null);

    const notifyError = (e, fallback) =>
        dispatch(showNotification({ type: 'error', message: errorMessage(e, fallback) }));

    const fetchAll = () => {
        setLoading(true);
        API.get(namespace + 'pro/seasons')
            .then(res => setSeasons(res.data || []))
            .catch(e => notifyError(e, __('Could not load seasons.', 'gameengine')))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreate = () => { setEditing(null); setForm({ name: '', start_date: '', end_date: '' }); setModal('create'); };
    const openEdit = (season) => {
        setEditing(season.id);
        setForm({ name: season.name, start_date: season.start_date, end_date: season.end_date });
        setModal('create');
    };
    const closeModal = () => { setModal(null); setEditing(null); };

    const save = async () => {
        setSaving(true);
        try {
            if (editing) {
                await API.put(namespace + 'pro/seasons/' + editing, form);
            } else {
                await API.post(namespace + 'pro/seasons', form);
            }
            fetchAll();
            closeModal();
        } catch (e) {
            notifyError(e, __('Could not save the season.', 'gameengine'));
        } finally {
            setSaving(false);
        }
    };

    const deleteSeason = async (id) => {
        if (!window.confirm(__('Delete this draft season?', 'gameengine'))) return;
        try {
            await API.delete(namespace + 'pro/seasons/' + id);
            fetchAll();
        } catch (e) {
            notifyError(e, __('Could not delete the season.', 'gameengine'));
        }
    };

    const captureSnapshot = async (id) => {
        setSnapshotting(id);
        try {
            await API.post(namespace + 'pro/seasons/' + id + '/snapshot', {});
            const res = await API.get(namespace + 'pro/seasons/' + id + '/rankings');
            setRankings(r => ({ ...r, [id]: res.data }));
            dispatch(showNotification({ type: 'success', message: __('Rankings captured.', 'gameengine') }));
        } catch (e) {
            notifyError(e, __('Could not capture rankings.', 'gameengine'));
        } finally {
            setSnapshotting(null);
        }
    };

    // Always re-fetch: a running season is scored live, so cached rows go stale
    // the moment anybody earns a point.
    const viewRankings = async (season) => {
        try {
            const res = await API.get(namespace + 'pro/seasons/' + season.id + '/rankings');
            setRankings(r => ({ ...r, [season.id]: res.data }));
            setRankingsSeason(season);
        } catch (e) {
            notifyError(e, __('Could not load rankings.', 'gameengine'));
        }
    };

    const setStatus = async (season, status) => {
        try {
            await API.put(namespace + 'pro/seasons/' + season.id, { status });
            fetchAll();
        } catch (e) {
            notifyError(e, __('Could not update the season.', 'gameengine'));
        }
    };

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            name: __('Dates', 'gameengine'),
            cell: (row) => <span className="text-sm text-[var(--gameengine-warn-muted)]">{row.start_date} → {row.end_date}</span>,
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
                        ...(row.status !== 'completed' ? [{
                            type: 'button',
                            label: snapshotting === row.id ? __('Capturing…', 'gameengine') : __('Capture Rankings', 'gameengine'),
                            icon: <FiCamera />,
                            onClick: () => captureSnapshot(row.id),
                            hasBorder: true,
                        }] : []),
                        {
                            type: 'button',
                            label: __('View Rankings', 'gameengine'),
                            icon: <FiEye />,
                            onClick: () => viewRankings(row),
                            hasBorder: true,
                        },
                        ...(row.status === 'draft' ? [{
                            type: 'button',
                            label: __('Edit', 'gameengine'),
                            icon: <FiEdit2 />,
                            onClick: () => openEdit(row),
                            hasBorder: true,
                        }] : []),
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
                <p style={{ fontSize: '13px', color: 'var(--gameengine-warn-muted)', marginBottom: '16px' }}>
                    {__('A season ranks members by the points they earn between its start and end dates. While it runs the standings are live; once it completes they are frozen as a permanent record. Use [gameengine_leaderboard season_id=1] to show one.', 'gameengine')}
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
                title={editing ? __('Edit Season', 'gameengine') : __('New Season', 'gameengine')}
                onRequestClose={closeModal}
                size="small"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button label={editing ? __('Save Season', 'gameengine') : __('Create Season', 'gameengine')} isLoading={saving} onClick={save} type="button" />
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
                            <tr style={{ color: 'var(--gameengine-warn-muted)', fontSize: '12px' }}>
                                <th style={{ textAlign: 'left', padding: '4px 0' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '4px 0' }}>{__('User', 'gameengine')}</th>
                                <th style={{ textAlign: 'right', padding: '4px 0' }}>{__('Points', 'gameengine')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(rankingsSeason && rankings[rankingsSeason.id] || []).map(r => (
                                <tr key={r.position} style={{ borderBottom: '1px solid var(--gameengine-secondary-color)' }}>
                                    <td style={{ padding: '5px 0', width: '40px' }}>{r.position}</td>
                                    <td style={{ padding: '5px 0' }}>{r.display_name}</td>
                                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: '600' }}>{Number(r.total_points).toLocaleString()}</td>
                                </tr>
                            ))}
                            {rankingsSeason && (rankings[rankingsSeason.id] || []).length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '10px 0', color: 'var(--gameengine-placeholder)', textAlign: 'center' }}>{__('No rankings captured yet.', 'gameengine')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>
    );
};

export default Seasons;
