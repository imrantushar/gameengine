import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Button from '@GFComponents/Button';
import { useSelector } from 'react-redux';

const PointsCapSettings = () => {
  const pointTypes = useSelector(state => state.pointTypes?.data || []);
  const [caps, setCaps] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    apiFetch({ path: '/gameengine/v1/pro/points-cap/settings' })
      .then(data => data && setCaps(data))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await apiFetch({ path: '/gameengine/v1/pro/points-cap/settings', method: 'POST', data: caps });
      setNotice({ type: 'success', message: __('Cap settings saved.', 'gameengine') });
    } catch {
      setNotice({ type: 'error', message: __('Failed to save.', 'gameengine') });
    } finally {
      setSaving(false);
    }
  };

  const setCapField = (ptId, key, val) => setCaps(prev => ({
    ...prev,
    [ptId]: { ...(prev[ptId] || {}), [key]: val },
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Points Cap', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Set maximum point balances per point type. Admins always bypass caps. Set to 0 for no limit.', 'gameengine')}</p>
      </div>

      {notice && (
        <div className={`p-3 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {notice.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {pointTypes.map(pt => {
          const cfg = caps[pt.id] || {};
          return (
            <div key={pt.id} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
              <p className="text-sm font-semibold text-gray-800 mb-3">{pt.name}</p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{__('Global Cap', 'gameengine')}</label>
                  <input
                    type="number"
                    min="0"
                    className="border border-gray-300 rounded px-3 py-1 text-sm w-32"
                    value={cfg.global_cap || ''}
                    placeholder="0 = no limit"
                    onChange={e => setCapField(pt.id, 'global_cap', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button label={saving ? __('Saving…', 'gameengine') : __('Save Settings', 'gameengine')} isLoading={saving} isDisabled={saving} onClick={save} />
    </div>
  );
};

export default PointsCapSettings;
