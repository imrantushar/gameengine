import React, { useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import TopBar from '@GFComponents/TopBar';
import GameEngineBox from '@GFComponents/GameEngineBox';
import Button from '@GFComponents/Button';
import GetHelp from '@GFComponents/GetHelp';
import GFLabel from '@GFComponents/Labels/GFLabel';

const EXPORT_TYPES = [
  { key: 'points_log', label: __('Points Log', 'gameengine') },
  { key: 'achievements', label: __('Achievements', 'gameengine') },
  { key: 'ranks', label: __('Ranks / Levels', 'gameengine') },
];

const ImportExport = () => {
  const [importType, setImportType] = useState('points_log');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState(null);
  const fileRef = useRef(null);

  const handleExport = (type) => {
    const nonce = window.wpApiSettings?.nonce || '';
    window.location.href = (window.wpApiSettings?.root || '/wp-json/') + `gameengine/v1/export?type=${type}&_wpnonce=${nonce}`;
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', importType);

      const res = await window.fetch(
        window.wpApiSettings?.root + 'gameengine/v1/import',
        {
          method: 'POST',
          headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' },
          body: formData,
        }
      );
      const json = await res.json();
      if (res.ok) {
        setNotice({ type: 'success', message: json?.message || __('Import completed.', 'gameengine') });
        setImportFile(null);
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setNotice({ type: 'error', message: json?.message || __('Import failed.', 'gameengine') });
      }
    } catch {
      setNotice({ type: 'error', message: __('An unexpected error occurred.', 'gameengine') });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <TopBar path={__('Import / Export', 'gameengine')} rightContent={<GetHelp filterText={['import', 'export']} />} />

      <div className="gameengine-page-content">
        <div className="flex justify-between items-center py-6 px-1">
          <GFLabel type="plainHeading" margin={0} label={__('Data Import / Export', 'gameengine')} />
        </div>

        {notice && (
          <div className={`p-3 mb-4 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {notice.message}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <GameEngineBox dynamicClasses="export-section" heading={__('Export Data', 'gameengine')}>
            <p className="text-sm text-gray-600 mb-4">
              {__('Download your gamification data as CSV files for backup or migration.', 'gameengine')}
            </p>
            <div className="flex flex-wrap gap-3">
              {EXPORT_TYPES.map(({ key, label }) => (
                <Button
                  key={key}
                  preset="gray"
                  label={`${__('Export', 'gameengine')} ${label}`}
                  onClick={() => handleExport(key)}
                />
              ))}
            </div>
          </GameEngineBox>

          <GameEngineBox dynamicClasses="import-section" heading={__('Import Data', 'gameengine')}>
            <p className="text-sm text-gray-600 mb-4">
              {__('Upload a CSV file to import points, achievements, or rank data. Existing records are updated by user ID.', 'gameengine')}
            </p>

            <div className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{__('Data Type', 'gameengine')}</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  value={importType}
                  onChange={e => setImportType(e.target.value)}
                >
                  {EXPORT_TYPES.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{__('CSV File', 'gameengine')}</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  onChange={e => setImportFile(e.target.files[0] || null)}
                />
                <p className="text-xs text-gray-500">{__('Accepted format: CSV with headers matching the export format.', 'gameengine')}</p>
              </div>

              <Button
                label={importing ? __('Importing…', 'gameengine') : __('Start Import', 'gameengine')}
                isDisabled={!importFile || importing}
                isLoading={importing}
                onClick={handleImport}
              />
            </div>
          </GameEngineBox>
        </div>
      </div>
    </>
  );
};

export default ImportExport;
