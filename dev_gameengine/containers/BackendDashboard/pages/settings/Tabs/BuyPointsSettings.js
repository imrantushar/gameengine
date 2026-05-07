import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Button from '@GFComponents/Button';
import { GoPlus } from 'react-icons/go';
import { FiTrash2 } from 'react-icons/fi';

const DEFAULT_SETTINGS = { gateway: 'paypal', paypal_email: '', stripe_publishable_key: '', stripe_secret_key: '', packages: [] };

const BuyPointsSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    apiFetch({ path: '/gameengine/v1/pro/buy-points/settings' })
      .then(data => data && setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await apiFetch({ path: '/gameengine/v1/pro/buy-points/settings', method: 'POST', data: settings });
      setNotice({ type: 'success', message: __('Settings saved.', 'gameengine') });
    } catch {
      setNotice({ type: 'error', message: __('Failed to save.', 'gameengine') });
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const addPackage = () => set('packages', [...(settings.packages || []), { label: '', points: '', price: '' }]);
  const updatePackage = (i, key, val) => {
    const updated = [...(settings.packages || [])];
    updated[i] = { ...updated[i], [key]: val };
    set('packages', updated);
  };
  const removePackage = (i) => set('packages', settings.packages.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Buy Points Settings', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Configure payment gateways and define purchasable point packages.', 'gameengine')}</p>
      </div>

      {notice && (
        <div className={`p-3 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {notice.message}
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-lg">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Default Gateway', 'gameengine')}</label>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm" value={settings.gateway} onChange={e => set('gateway', e.target.value)}>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>

        {settings.gateway === 'paypal' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{__('PayPal Business Email', 'gameengine')}</label>
            <input type="email" className="border border-gray-300 rounded px-3 py-2 text-sm" value={settings.paypal_email || ''} onChange={e => set('paypal_email', e.target.value)} />
          </div>
        )}

        {settings.gateway === 'stripe' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{__('Stripe Publishable Key', 'gameengine')}</label>
              <input type="text" className="border border-gray-300 rounded px-3 py-2 text-sm" value={settings.stripe_publishable_key || ''} onChange={e => set('stripe_publishable_key', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{__('Stripe Secret Key', 'gameengine')}</label>
              <input type="password" className="border border-gray-300 rounded px-3 py-2 text-sm" value={settings.stripe_secret_key || ''} onChange={e => set('stripe_secret_key', e.target.value)} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{__('Point Packages', 'gameengine')}</label>
            <Button preset="gray" label={__('Add Package', 'gameengine')} icon={<GoPlus size="14px" />} onClick={addPackage} />
          </div>
          {(settings.packages || []).map((pkg, i) => (
            <div key={i} className="flex items-center gap-2 border border-gray-200 rounded p-2">
              <input type="text" className="border border-gray-300 rounded px-2 py-1 text-sm flex-1" placeholder={__('Label', 'gameengine')} value={pkg.label} onChange={e => updatePackage(i, 'label', e.target.value)} />
              <input type="number" min="1" className="border border-gray-300 rounded px-2 py-1 text-sm w-24" placeholder={__('Points', 'gameengine')} value={pkg.points} onChange={e => updatePackage(i, 'points', e.target.value)} />
              <input type="number" min="0" step="0.01" className="border border-gray-300 rounded px-2 py-1 text-sm w-24" placeholder={__('Price $', 'gameengine')} value={pkg.price} onChange={e => updatePackage(i, 'price', e.target.value)} />
              <button className="text-red-400 hover:text-red-600 p-1" onClick={() => removePackage(i)}><FiTrash2 size="14px" /></button>
            </div>
          ))}
        </div>

        <Button label={saving ? __('Saving…', 'gameengine') : __('Save Settings', 'gameengine')} isLoading={saving} isDisabled={saving} onClick={save} />
      </div>
    </div>
  );
};

export default BuyPointsSettings;
