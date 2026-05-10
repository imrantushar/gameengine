import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@GFComponents/TopBar';
import Button from '@GFComponents/Button';
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

                {loading ? (
                    <p style={{ color: '#94a3b8' }}>{__('Loading…', 'gameengine')}</p>
                ) : (
                    <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,.07)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Name', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('URL', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Events', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>{__('Active', 'gameengine')}</th>
                                    <th style={{ padding: '10px 16px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {webhooks.map(wh => (
                                    <React.Fragment key={wh.id}>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 16px', fontWeight: '500' }}>{wh.name}</td>
                                            <td style={{ padding: '10px 16px', color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{truncate(wh.url, 48)}</td>
                                            <td style={{ padding: '10px 16px', color: '#64748b' }}>
                                                {(wh.events || []).map(e => EVENTS.find(ev => ev.key === e)?.label || e).join(', ') || __('None', 'gameengine')}
                                            </td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <button onClick={() => toggleActive(wh)}
                                                    style={{ background: wh.active ? '#10b981' : '#e2e8f0', color: wh.active ? '#fff' : '#64748b', border: 'none', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px' }}>
                                                    {wh.active ? __('On', 'gameengine') : __('Off', 'gameengine')}
                                                </button>
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <button onClick={() => testWebhook(wh.id)} disabled={testing === wh.id}
                                                    style={{ marginRight: '8px', cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
                                                    {testing === wh.id ? '…' : __('Test', 'gameengine')}
                                                </button>
                                                <button onClick={() => openEdit(wh)} style={{ marginRight: '8px', cursor: 'pointer', background: 'none', border: 'none', color: '#6c5ce7', fontWeight: '500' }}>{__('Edit', 'gameengine')}</button>
                                                <button onClick={() => deleteWebhook(wh.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: '500' }}>{__('Delete', 'gameengine')}</button>
                                            </td>
                                        </tr>
                                        {testResults[wh.id] && (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '8px 16px', background: testResults[wh.id].success ? '#f0fdf4' : '#fef2f2', fontSize: '12px', color: testResults[wh.id].success ? '#166534' : '#991b1b' }}>
                                                    {testResults[wh.id].success
                                                        ? `✓ ${__('Success', 'gameengine')} (HTTP ${testResults[wh.id].response_code})`
                                                        : `✗ ${testResults[wh.id].error || __('Failed', 'gameengine')} ${testResults[wh.id].response_code ? '(HTTP ' + testResults[wh.id].response_code + ')' : ''}`
                                                    }
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {webhooks.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>{__('No webhooks yet.', 'gameengine')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', width: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,.15)' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '17px' }}>
                            {modal === 'create' ? __('New Webhook', 'gameengine') : __('Edit Webhook', 'gameengine')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Name', 'gameengine')}
                                <input className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </label>
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('URL', 'gameengine')}
                                <input className="gameengine-input" style={{ marginTop: '4px', width: '100%' }} type="url" value={form.url}
                                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com/webhook" />
                            </label>
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
                            <label style={{ fontSize: '13px', fontWeight: '500' }}>
                                {__('Secret (for HMAC signature verification)', 'gameengine')}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <input className="gameengine-input" style={{ flex: 1 }} type="text" value={form.secret}
                                        onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} placeholder={__('optional', 'gameengine')} />
                                    <button type="button" onClick={() => setForm(f => ({ ...f, secret: generateSecret() }))}
                                        style={{ padding: '0 14px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        {__('Generate', 'gameengine')}
                                    </button>
                                </div>
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                            <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>{__('Cancel', 'gameengine')}</button>
                            <Button label={modal === 'create' ? __('Create Webhook', 'gameengine') : __('Save Changes', 'gameengine')} isLoading={saving} onClick={save} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Webhooks;
