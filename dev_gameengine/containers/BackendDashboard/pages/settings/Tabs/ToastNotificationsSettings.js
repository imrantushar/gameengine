import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Button from '@GFComponents/Button';

const EVENTS = [
  { key: 'points_added', label: __('Points Awarded', 'gameengine') },
  { key: 'achievement_unlocked', label: __('Achievement Unlocked', 'gameengine') },
  { key: 'level_awarded', label: __('Level Up', 'gameengine') },
  { key: 'transfer_received', label: __('Transfer Received', 'gameengine') },
  { key: 'buy_points_completed', label: __('Purchase Completed', 'gameengine') },
];

const DEFAULT = { position: 'bottom-right', duration: 4000, events: {} };

const ToastNotificationsSettings = () => {
  const [settings, setSettings] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    apiFetch({ path: '/gameengine/v1/pro/toast/settings' })
      .then(data => data && setSettings({ ...DEFAULT, ...data }))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await apiFetch({ path: '/gameengine/v1/pro/toast/settings', method: 'POST', data: settings });
      setNotice({ type: 'success', message: __('Settings saved.', 'gameengine') });
    } catch {
      setNotice({ type: 'error', message: __('Failed to save.', 'gameengine') });
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const setEvent = (key, val) => setSettings(prev => ({ ...prev, events: { ...(prev.events || {}), [key]: val } }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Toast Notifications', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Configure browser toast notifications shown to users for gamification events.', 'gameengine')}</p>
      </div>

      {notice && (
        <div className={`p-3 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {notice.message}
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Position', 'gameengine')}</label>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm" value={settings.position} onChange={e => set('position', e.target.value)}>
            <option value="top-right">{__('Top Right', 'gameengine')}</option>
            <option value="top-left">{__('Top Left', 'gameengine')}</option>
            <option value="bottom-right">{__('Bottom Right', 'gameengine')}</option>
            <option value="bottom-left">{__('Bottom Left', 'gameengine')}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Duration (ms)', 'gameengine')}</label>
          <input
            type="number"
            min="1000"
            step="500"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
            value={settings.duration}
            onChange={e => set('duration', parseInt(e.target.value, 10) || 4000)}
          />
          <p className="text-xs text-gray-500">{__('How long each toast is visible. 4000 = 4 seconds.', 'gameengine')}</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-medium text-gray-700">{__('Enabled Events', 'gameengine')}</label>
          {EVENTS.map(ev => (
            <label key={ev.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings.events?.[ev.key]) !== false}
                onChange={e => setEvent(ev.key, e.target.checked)}
              />
              <span className="text-sm">{ev.label}</span>
            </label>
          ))}
        </div>

        <Button label={saving ? __('Saving…', 'gameengine') : __('Save Settings', 'gameengine')} isLoading={saving} isDisabled={saving} onClick={save} />
      </div>
    </div>
  );
};

export default ToastNotificationsSettings;
