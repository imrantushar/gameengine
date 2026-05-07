import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';

const OpenBadgesSettings = () => {
  const { values, setFieldValue } = useFormikContext();
  const ob = values?.open_badges || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{__('Open Badges', 'gameengine')}</h3>
        <p className="text-sm text-gray-500">{__('Issue IMS Open Badges v2.0 digital credentials when users unlock achievements. Configure the badge issuer identity below.', 'gameengine')}</p>
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Issuer Name', 'gameengine')}</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={ob.issuer_name || ''}
            placeholder={__('My Website', 'gameengine')}
            onChange={e => setFieldValue('open_badges.issuer_name', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Issuer URL', 'gameengine')}</label>
          <input
            type="url"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={ob.issuer_url || ''}
            placeholder="https://example.com"
            onChange={e => setFieldValue('open_badges.issuer_url', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Issuer Email', 'gameengine')}</label>
          <input
            type="email"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={ob.issuer_email || ''}
            placeholder="badges@example.com"
            onChange={e => setFieldValue('open_badges.issuer_email', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{__('Issuer Description', 'gameengine')}</label>
          <textarea
            rows="3"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={ob.issuer_description || ''}
            placeholder={__('Brief description of your organization.', 'gameengine')}
            onChange={e => setFieldValue('open_badges.issuer_description', e.target.value)}
          />
        </div>

        <div className="border border-blue-100 bg-blue-50 rounded p-3 text-sm text-blue-700">
          <strong>{__('Note:', 'gameengine')}</strong> {__('Badges are automatically issued to users when they unlock an achievement. Users can download their badge from the achievements page.', 'gameengine')}
        </div>
      </div>
    </div>
  );
};

export default OpenBadgesSettings;
