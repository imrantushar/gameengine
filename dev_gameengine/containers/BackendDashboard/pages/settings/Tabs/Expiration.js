import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import SettingsInput from '../Components/SettingsInput';

const Expiration = () => {
  const pointTypes = useSelector(state => state.pointTypes?.data || []);
  const { values, setFieldValue } = useFormikContext();
  const exp = values?.expiration || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Points Expiration', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Configure automatic expiration rules per point type. Points expire the set number of days after they were awarded.', 'gameengine')}</p>
      </div>

      {pointTypes.length === 0 && (
        <p className="text-sm text-gray-400">{__('No point types found. Create a point type first.', 'gameengine')}</p>
      )}

      {pointTypes.map(pt => {
        const key = `pt_${pt.id}`;
        const rule = exp[key] || {};
        return (
          <div key={pt.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">{pt.name}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!rule.enabled}
                  onChange={e => setFieldValue(`expiration.${key}.enabled`, e.target.checked)}
                />
                <span className="text-sm">{__('Enable expiration', 'gameengine')}</span>
              </label>
            </div>
            {rule.enabled && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">{__('Expire after', 'gameengine')}</label>
                <input
                  type="number"
                  min="1"
                  className="border border-gray-300 rounded px-3 py-1 text-sm w-24"
                  value={rule.days || ''}
                  onChange={e => setFieldValue(`expiration.${key}.days`, parseInt(e.target.value, 10) || '')}
                />
                <span className="text-sm text-gray-600">{__('days', 'gameengine')}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Expiration;
