import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2, FiSend } from 'react-icons/fi';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
import ListTable from '@GFComponents/ListTable';
import Modal from '@GFComponents/Modal/Modal';
import OptionMenu from '@GFComponents/OptionMenu';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { API, namespace } from '@GFUtils/helper';

const EVENTS = [
    { key: 'points_added', label: __('Points Added', 'gameengine') },
    { key: 'rank_achieved', label: __('Rank Achieved', 'gameengine') },
    { key: 'achievement_unlocked', label: __('Achievement Unlocked', 'gameengine') },
    { key: 'streak_milestone', label: __('Streak Milestone', 'gameengine') },
    { key: 'streak_broken', label: __('Streak Broken', 'gameengine') },
];

const EMPTY_FORM = { name: '', url: '', events: [], secret: '', active: true };

const generateSecret = () => {
    const chars = 'abcdef0123456789';
    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const Webhooks = () => {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(null);

    const fetchAll = () => {
        setLoading(true);
        API.get(namespace + 'pro/webhooks')
            .then(res => setWebhooks(res.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreate = () => { setForm({ ...EMPTY_FORM, events: [] }); setModal('create'); };
    const openEdit = (wh) => { setForm({ ...wh }); setModal('edit'); };
    const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };

    const toggleEvent = (key) => setForm(f => {
        const curr = f.events || [];
        return { ...f, events: curr.includes(key) ? curr.filter(e => e !== key) : [...curr, key] };
    });

    const save = async () => {
        setSaving(true);
        try {
            if (modal === 'create') {
                await API.post(namespace + 'pro/webhooks', form);
            } else {
                await API.put(namespace + 'pro/webhooks/' + form.id, form);
            }
            fetchAll();
            closeModal();
        } catch (e) {
            console.warn(e);
        } finally {
            setSaving(false);
        }
    };

    const deleteWebhook = async (id) => {
        if (!window.confirm(__('Delete this webhook?', 'gameengine'))) return;
        await API.delete(namespace + 'pro/webhooks/' + id);
        fetchAll();
    };

    const toggleActive = async (wh) => {
        await API.put(namespace + 'pro/webhooks/' + wh.id, { ...wh, active: !wh.active });
        fetchAll();
    };

    const testWebhook = async (id) => {
        setTesting(id);
        try {
            const res = await API.post(namespace + 'pro/webhooks/' + id + '/test', {});
            setTestResults(r => ({ ...r, [id]: res.data }));
        } catch (e) {
            setTestResults(r => ({ ...r, [id]: { success: false, error: 'Request failed' } }));
        } finally {
            setTesting(null);
        }
    };

    const truncate = (str, n) => str && str.length > n ? str.slice(0, n) + '…' : str;

    const columns = [
        {
            name: __('Name', 'gameengine'),
            cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            name: __('URL', 'gameengine'),
            cell: (row) => <span className="text-xs text-gray-500" style={{ fontFamily: 'monospace' }}>{truncate(row.url, 48)}</span>,
        },
        {
            name: __('Events', 'gameengine'),
            cell: (row) => (
                <span className="text-sm text-gray-500">
                    {(row.events || []).map(e => EVENTS.find(ev => ev.key === e)?.label || e).join(', ') || __('None', 'gameengine')}
                </span>
            ),
        },
        {
            name: __('Active', 'gameengine'),
            cell: (row) => (
                <button onClick={() => toggleActive(row)}
                    style={{ background: row.active ? '#10b981' : '#e2e8f0', color: row.active ? '#fff' : '#64748b', border: 'none', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}>
                    {row.active ? __('On', 'gameengine') : __('Off', 'gameengine')}
                </button>
            ),
        },
        {
            name: __('Last Test', 'gameengine'),
            cell: (row) => {
                const result = testResults[row.id];
                if (!result) {
                    return <span className="text-xs text-gray-400">—</span>;
                }
                return (
                    <span className="text-xs" style={{ color: result.success ? '#166534' : '#991b1b' }}>
                        {result.success
                            ? `✓ ${__('Success', 'gameengine')} (${result.response_code})`
                            : `✗ ${result.error || __('Failed', 'gameengine')}${result.response_code ? ' (' + result.response_code + ')' : ''}`}
                    </span>
                );
            },
        },
        {
            name: __('Actions', 'gameengine'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: 'button',
                            label: testing === row.id ? __('Testing…', 'gameengine') : __('Test', 'gameengine'),
                            icon: <FiSend />,
                            onClick: () => testWebhook(row.id),
                            hasBorder: true,
                        },
                        {
                            type: 'button',
                            label: __('Edit', 'gameengine'),
                            icon: <FiEdit />,
                            onClick: () => openEdit(row),
                            hasBorder: true,
                        },
                        {
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gameengine'),
                            icon: <FiTrash2 />,
                            onClick: () => deleteWebhook(row.id),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            <TopBar path={__('Webhooks', 'gameengine')} rightContent={
                <Button label={__('+ New Webhook', 'gameengine')} onClick={openCreate} />
            } />
            <div className="gameengine-page-content">
                <h2 className="gameengine-page-heading py-6">{__('Webhooks', 'gameengine')}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    {__('Send signed JSON payloads to external URLs when gamification events occur. Verify requests using the HMAC-SHA256 signature in the X-GameEngine-Signature header.', 'gameengine')}
                </p>

                <ListTable
                    columns={columns}
                    data={webhooks}
                    dataFetchingStatus={loading}
                    noDataText={__('No webhooks yet.', 'gameengine')}
                    showSubHeader={false}
                    showColumnFilter={false}
                    showPagination={false}
                    isRowSelectable={false}
                />
            </div>

            <Modal
                isOpen={!!modal}
                title={modal === 'create' ? __('New Webhook', 'gameengine') : __('Edit Webhook', 'gameengine')}
                onRequestClose={closeModal}
                size="medium"
                isFooter={true}
                isFooterContent={
                    <div className="flex justify-end gap-3">
                        <Button label={__('Cancel', 'gameengine')} preset="secondary" onClick={closeModal} />
                        <Button
                            label={modal === 'create' ? __('Create Webhook', 'gameengine') : __('Save Changes', 'gameengine')}
                            isLoading={saving}
                            onClick={save}
                            type="button"
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 p-4">
                    <GameEngineInput label={__('Name', 'gameengine')}>
                        <input className="gameengine-input" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </GameEngineInput>
                    <GameEngineInput label={__('URL', 'gameengine')}>
                        <input className="gameengine-input" type="url" value={form.url}
                            onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com/webhook" />
                    </GameEngineInput>
                    <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <legend style={{ fontSize: '13px', fontWeight: '600', padding: '0 6px' }}>{__('Events', 'gameengine')}</legend>
                        {EVENTS.map(ev => (
                            <label key={ev.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px' }}>
                                <input type="checkbox"
                                    checked={(form.events || []).includes(ev.key)}
                                    onChange={() => toggleEvent(ev.key)} />
                                {ev.label}
                            </label>
                        ))}
                    </fieldset>
                    <GameEngineInput label={__('Secret (for HMAC signature verification)', 'gameengine')}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input className="gameengine-input" style={{ flex: 1 }} type="text" value={form.secret}
                                onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} placeholder={__('optional', 'gameengine')} />
                            <button type="button" onClick={() => setForm(f => ({ ...f, secret: generateSecret() }))}
                                style={{ padding: '0 14px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                {__('Generate', 'gameengine')}
                            </button>
                        </div>
                    </GameEngineInput>
                </div>
            </Modal>
        </>
    );
};

export default Webhooks;
