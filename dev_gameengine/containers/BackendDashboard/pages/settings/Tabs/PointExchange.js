import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Button from '@GFComponents/Button';
import { GoPlus } from 'react-icons/go';
import { FiTrash2 } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const PointExchange = () => {
  const pointTypes = useSelector(state => state.pointTypes?.data || []);
  const [pairs, setPairs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    apiFetch({ path: '/gameengine/v1/pro/exchange/settings' })
      .then(data => Array.isArray(data) ? setPairs(data) : (data?.pairs && setPairs(data.pairs)))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await apiFetch({ path: '/gameengine/v1/pro/exchange/settings', method: 'POST', data: { pairs } });
      setNotice({ type: 'success', message: __('Exchange pairs saved.', 'gameengine') });
    } catch {
      setNotice({ type: 'error', message: __('Failed to save.', 'gameengine') });
    } finally {
      setSaving(false);
    }
  };

  const addPair = () => setPairs(prev => [...prev, { source_type_id: '', dest_type_id: '', source_rate: 1, dest_rate: 1, fee_percent: 0, cooldown_hours: 0 }]);
  const updatePair = (i, key, val) => {
    const updated = [...pairs];
    updated[i] = { ...updated[i], [key]: val };
    setPairs(updated);
  };
  const removePair = (i) => setPairs(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Point Exchange', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Define exchange pairs between point types. Users spend source points to receive destination points at the configured rate.', 'gameengine')}</p>
      </div>

      {notice && (
        <div className={`p-3 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {notice.message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">{__('Exchange Pairs', 'gameengine')}</label>
          <Button preset="gray" label={__('Add Pair', 'gameengine')} icon={<GoPlus size="14px" />} onClick={addPair} />
        </div>

        {pairs.length === 0 && <p className="text-sm text-gray-400">{__('No exchange pairs configured. Add a pair to get started.', 'gameengine')}</p>}

        {pairs.map((pair, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{__('Source Type', 'gameengine')}</label>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm" value={pair.source_type_id} onChange={e => updatePair(i, 'source_type_id', e.target.value)}>
                  <option value="">{__('Select…', 'gameengine')}</option>
                  {pointTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{__('Destination Type', 'gameengine')}</label>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm" value={pair.dest_type_id} onChange={e => updatePair(i, 'dest_type_id', e.target.value)}>
                  <option value="">{__('Select…', 'gameengine')}</option>
                  {pointTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{__('Source Rate', 'gameengine')}</label>
                <input type="number" min="1" className="border border-gray-300 rounded px-2 py-1 text-sm w-20" value={pair.source_rate} onChange={e => updatePair(i, 'source_rate', parseFloat(e.target.value) || 1)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{__('Dest Rate', 'gameengine')}</label>
                <input type="number" min="1" className="border border-gray-300 rounded px-2 py-1 text-sm w-20" value={pair.dest_rate} onChange={e => updatePair(i, 'dest_rate', parseFloat(e.target.value) || 1)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{__('Fee %', 'gameengine')}</label>
                <input type="number" min="0" max="100" className="border border-gray-300 rounded px-2 py-1 text-sm w-20" value={pair.fee_percent} onChange={e => updatePair(i, 'fee_percent', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{__('Cooldown (h)', 'gameengine')}</label>
                <input type="number" min="0" className="border border-gray-300 rounded px-2 py-1 text-sm w-20" value={pair.cooldown_hours} onChange={e => updatePair(i, 'cooldown_hours', parseInt(e.target.value, 10) || 0)} />
              </div>
              <button className="text-red-400 hover:text-red-600 mt-4 p-1" onClick={() => removePair(i)}><FiTrash2 size="14px" /></button>
            </div>
          </div>
        ))}
      </div>

      <Button label={saving ? __('Saving…', 'gameengine') : __('Save Pairs', 'gameengine')} isLoading={saving} isDisabled={saving} onClick={save} />
    </div>
  );
};

export default PointExchange;
