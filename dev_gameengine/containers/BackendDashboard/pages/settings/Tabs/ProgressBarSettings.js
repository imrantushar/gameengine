import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';

const ProgressBarSettings = () => {
  const { values, setFieldValue } = useFormikContext();
  const pb = values?.progress_bar_settings || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Progress Bar', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Set default appearance for the progress bar shortcode. These defaults can be overridden per shortcode instance.', 'gameengine')}</p>
      </div>

      <div className="flex flex-col gap-5 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Default Mode', 'gameengine')}</label>
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={pb.mode || 'level'}
            onChange={e => setFieldValue('progress_bar_settings.mode', e.target.value)}
          >
            <option value="level">{__('Level Progress', 'gameengine')}</option>
            <option value="achievement">{__('Achievement Progress', 'gameengine')}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Default Color', 'gameengine')}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="h-9 w-16 cursor-pointer border border-gray-300 rounded p-1"
              value={pb.color || '#4f46e5'}
              onChange={e => setFieldValue('progress_bar_settings.color', e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-28"
              value={pb.color || '#4f46e5'}
              onChange={e => setFieldValue('progress_bar_settings.color', e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Height (px)', 'gameengine')}</label>
          <input
            type="number"
            min="4"
            max="40"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-24"
            value={pb.height || 12}
            onChange={e => setFieldValue('progress_bar_settings.height', parseInt(e.target.value, 10) || 12)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Show Percentage Label', 'gameengine')}</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!pb.show_label}
              onChange={e => setFieldValue('progress_bar_settings.show_label', e.target.checked)}
            />
            <span className="text-sm text-gray-600">{__('Display percentage text inside/above the bar', 'gameengine')}</span>
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Animated Fill', 'gameengine')}</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pb.animated !== false}
              onChange={e => setFieldValue('progress_bar_settings.animated', e.target.checked)}
            />
            <span className="text-sm text-gray-600">{__('Animate bar fill on page load', 'gameengine')}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProgressBarSettings;
