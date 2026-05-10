import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { API, namespace } from '@GFUtils/helper';
import Select from 'react-select';

const AvailableHooks = () => {
    const [hooks, setHooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [integrationFilter, setIntegrationFilter] = useState(null);
    const [copiedKey, setCopiedKey] = useState(null);

    useEffect(() => {
        const fetchHooks = async () => {
            try {
                const res = await API.get(namespace + 'tools/available-hooks');
                setHooks(res.data || []);
            } catch (e) {
                setHooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHooks();
    }, []);

    const handleCopy = (hookKey) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(hookKey).then(() => {
                setCopiedKey(hookKey);
                setTimeout(() => setCopiedKey(null), 1500);
            });
        } else {
            const el = document.createElement('textarea');
            el.value = hookKey;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopiedKey(hookKey);
            setTimeout(() => setCopiedKey(null), 1500);
        }
    };

    const integrationOptions = Array.from(
        new Set(hooks.map(h => h.integration).filter(Boolean))
    ).map(i => ({ value: i, label: i }));

    const filtered = hooks.filter(h => {
        const matchSearch = !search ||
            h.hook_key.toLowerCase().includes(search.toLowerCase()) ||
            (h.label && h.label.toLowerCase().includes(search.toLowerCase()));
        const matchIntegration = !integrationFilter || h.integration === integrationFilter.value;
        return matchSearch && matchIntegration;
    });

    const grouped = filtered.reduce((acc, hook) => {
        const key = hook.integration || __('General', 'gameengine');
        if (!acc[key]) acc[key] = [];
        acc[key].push(hook);
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-4">
            <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '6px', padding: '10px 14px', lineHeight: '1.6' }}>
                {__('These are all WordPress action hooks that GameEngine listens to. Developers can copy a hook key and use it as a trigger in Points, Achievements, or Streaks rules to award points when that action fires.', 'gameengine')}
            </p>
            <div className="flex gap-3 items-center flex-wrap">
                <input
                    type="text"
                    className="gameengine-input"
                    style={{ maxWidth: '260px' }}
                    placeholder={__('Search by label or hook key…', 'gameengine')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div style={{ minWidth: '200px' }}>
                    <Select
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        placeholder={__('All Integrations', 'gameengine')}
                        options={integrationOptions}
                        value={integrationFilter}
                        onChange={setIntegrationFilter}
                        isClearable
                    />
                </div>
            </div>

            {loading && (
                <p className="text-sm text-gray-400">{__('Loading hooks…', 'gameengine')}</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className="text-sm text-gray-400">{__('No hooks found.', 'gameengine')}</p>
            )}

            {Object.entries(grouped).map(([integration, items]) => (
                <div key={integration} className="flex flex-col gap-2">
                    <h4
                        style={{
                            margin: 0,
                            padding: '6px 0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#4a5568',
                            borderBottom: '1px solid #e2e8f0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }}
                    >
                        {integration}
                    </h4>
                    {items.map((hook) => (
                        <div
                            key={hook.hook_key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px 12px',
                                background: '#f7fafc',
                                borderRadius: '6px',
                                border: '1px solid #edf2f7',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {hook.label && (
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#2d3748' }}>
                                        {hook.label}
                                    </p>
                                )}
                                <code style={{ fontSize: '12px', color: '#6b46c1', background: 'none' }}>
                                    {hook.hook_key}
                                </code>
                                {hook.description && (
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#718096' }}>
                                        {hook.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleCopy(hook.hook_key)}
                                title={__('Copy hook key', 'gameengine')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: copiedKey === hook.hook_key ? '#38a169' : '#718096',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    flexShrink: 0,
                                    transition: 'color 0.15s',
                                }}
                            >
                                {copiedKey === hook.hook_key ? <FiCheck size={15} /> : <FiCopy size={15} />}
                            </button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default AvailableHooks;
