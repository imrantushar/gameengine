import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';

const NETWORKS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

const SocialSharing = () => {
  const { values, setFieldValue } = useFormikContext();
  const ss = values?.social_sharing || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Social Sharing', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Reward users for sharing achievements and content on social networks. Set the points awarded per successful share.', 'gameengine')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {NETWORKS.map(net => {
          const cfg = ss[net.key] || {};
          return (
            <div key={net.key} className="flex items-center gap-6 border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
              <label className="flex items-center gap-3 w-40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!cfg.enabled}
                  onChange={e => setFieldValue(`social_sharing.${net.key}.enabled`, e.target.checked)}
                />
                <span className="text-sm font-medium">{net.label}</span>
              </label>

              {cfg.enabled && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">{__('Reward points:', 'gameengine')}</label>
                  <input
                    type="number"
                    min="0"
                    className="border border-gray-300 rounded px-3 py-1 text-sm w-24"
                    value={cfg.points || ''}
                    onChange={e => setFieldValue(`social_sharing.${net.key}.points`, parseInt(e.target.value, 10) || 0)}
                  />
                  <label className="text-sm text-gray-600 ml-4">{__('Daily limit:', 'gameengine')}</label>
                  <input
                    type="number"
                    min="0"
                    className="border border-gray-300 rounded px-3 py-1 text-sm w-20"
                    value={cfg.daily_limit || ''}
                    placeholder={__('No limit', 'gameengine')}
                    onChange={e => setFieldValue(`social_sharing.${net.key}.daily_limit`, parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-1">{__('Share Button Text', 'gameengine')}</p>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full max-w-sm"
          value={ss.button_text || ''}
          placeholder={__('Share & Earn Points', 'gameengine')}
          onChange={e => setFieldValue('social_sharing.button_text', e.target.value)}
        />
      </div>
    </div>
  );
};

export default SocialSharing;
