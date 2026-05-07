import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Button from '@GFComponents/Button';

const TransfersSettings = () => {
  const [settings, setSettings] = useState({ fee_type: 'flat', fee_amount: 0, min_amount: 1, max_amount: 0, daily_limit: 0 });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    apiFetch({ path: '/gameengine/v1/pro/transfers/settings' })
      .then(data => data && setSettings(data))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await apiFetch({ path: '/gameengine/v1/pro/transfers/settings', method: 'POST', data: settings });
      setNotice({ type: 'success', message: __('Settings saved.', 'gameengine') });
    } catch {
      setNotice({ type: 'error', message: __('Failed to save settings.', 'gameengine') });
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Point Transfers Settings', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Configure transfer fees, minimum/maximum amounts, and daily limits.', 'gameengine')}</p>
      </div>

      {notice && (
        <div className={`p-3 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {notice.message}
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Fee Type', 'gameengine')}</label>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm" value={settings.fee_type} onChange={e => set('fee_type', e.target.value)}>
            <option value="flat">{__('Flat amount', 'gameengine')}</option>
            <option value="percent">{__('Percentage of transfer', 'gameengine')}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{settings.fee_type === 'percent' ? __('Fee %', 'gameengine') : __('Fee Amount', 'gameengine')}</label>
          <input type="number" min="0" className="border border-gray-300 rounded px-3 py-2 text-sm w-32" value={settings.fee_amount} onChange={e => set('fee_amount', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{__('Minimum Transfer', 'gameengine')}</label>
            <input type="number" min="1" className="border border-gray-300 rounded px-3 py-2 text-sm w-28" value={settings.min_amount} onChange={e => set('min_amount', parseInt(e.target.value, 10) || 1)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{__('Maximum Transfer', 'gameengine')}</label>
            <input type="number" min="0" className="border border-gray-300 rounded px-3 py-2 text-sm w-28" placeholder={__('No limit', 'gameengine')} value={settings.max_amount || ''} onChange={e => set('max_amount', parseInt(e.target.value, 10) || 0)} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Daily Transfer Limit (per user)', 'gameengine')}</label>
          <input type="number" min="0" className="border border-gray-300 rounded px-3 py-2 text-sm w-32" placeholder={__('No limit', 'gameengine')} value={settings.daily_limit || ''} onChange={e => set('daily_limit', parseInt(e.target.value, 10) || 0)} />
        </div>
        <Button label={saving ? __('Saving…', 'gameengine') : __('Save Settings', 'gameengine')} isLoading={saving} isDisabled={saving} onClick={save} />
      </div>
    </div>
  );
};

export default TransfersSettings;
