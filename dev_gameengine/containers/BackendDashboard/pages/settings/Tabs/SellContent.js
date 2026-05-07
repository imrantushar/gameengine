import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';

const SellContent = () => {
  const pointTypes = useSelector(state => state.pointTypes?.data || []);
  const { values, setFieldValue } = useFormikContext();
  const sc = values?.sell_content || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Sell Content', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Lock posts/pages behind a points paywall. Configure defaults for content locking. Override per post using the meta box.', 'gameengine')}</p>
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Default Point Type', 'gameengine')}</label>
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={sc.default_point_type_id || ''}
            onChange={e => setFieldValue('sell_content.default_point_type_id', e.target.value)}
          >
            <option value="">{__('Select point type…', 'gameengine')}</option>
            {pointTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Teaser Length (characters)', 'gameengine')}</label>
          <input
            type="number"
            min="0"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
            value={sc.teaser_length || 200}
            onChange={e => setFieldValue('sell_content.teaser_length', parseInt(e.target.value, 10) || 200)}
          />
          <p className="text-xs text-gray-500">{__('Number of characters to show before the paywall. 0 = show nothing.', 'gameengine')}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Unlock Button Text', 'gameengine')}</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={sc.button_text || ''}
            placeholder={__('Unlock for {price} points', 'gameengine')}
            onChange={e => setFieldValue('sell_content.button_text', e.target.value)}
          />
          <p className="text-xs text-gray-500">{__('Use {price} as a placeholder for the point cost.', 'gameengine')}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Default: Permanent Unlock', 'gameengine')}</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sc.default_permanent !== false}
              onChange={e => setFieldValue('sell_content.default_permanent', e.target.checked)}
            />
            <span className="text-sm text-gray-600">{__('Once purchased, users keep access forever', 'gameengine')}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SellContent;
