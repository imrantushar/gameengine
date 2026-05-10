import React, { useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { API, namespace } from '@GFUtils/helper';
import Button from '@GFComponents/Button';
import GameEngineInput from '@GFComponents/GameEngineInput';
import Select from 'react-select';

const exportTypeOptions = [
    { value: 'achievements', label: __('Achievements', 'gameengine') },
    { value: 'levels', label: __('Levels', 'gameengine') },
    { value: 'point_types', label: __('Point Types', 'gameengine') },
    { value: 'ranks', label: __('Ranks', 'gameengine') },
    { value: 'streaks', label: __('Streaks', 'gameengine') },
    { value: 'user_points', label: __('User Points', 'gameengine') },
    { value: 'user_achievements', label: __('User Achievements', 'gameengine') },
    { value: 'user_levels', label: __('User Levels', 'gameengine') },
    { value: 'user_ranks', label: __('User Ranks', 'gameengine') },
    { value: 'logs', label: __('Point Logs', 'gameengine') },
];

const formatOptions = [
    { value: 'csv', label: __('CSV', 'gameengine') },
    { value: 'json', label: __('JSON', 'gameengine') },
];

const ExportImport = () => {
    const fileRef = useRef(null);

    const [exportType, setExportType] = useState(exportTypeOptions[0]);
    const [exportFormat, setExportFormat] = useState(formatOptions[0]);
    const [exporting, setExporting] = useState(false);

    const [importType, setImportType] = useState(exportTypeOptions[0]);
    const [overwrite, setOverwrite] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await API.get(namespace + 'tools/export', {
                params: { type: exportType.value, format: exportFormat.value },
                responseType: 'blob',
            });

            const contentDisposition = res.headers['content-disposition'] || '';
            const match = contentDisposition.match(/filename="?([^";\s]+)"?/);
            const filename = match ? match[1] : `gameengine-export-${exportType.value}.${exportFormat.value}`;

            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert(__('Export failed. Please try again.', 'gameengine'));
        } finally {
            setExporting(false);
        }
    };

    const handleImport = async () => {
        const file = fileRef.current && fileRef.current.files[0];
        if (!file) {
            alert(__('Please select a file to import.', 'gameengine'));
            return;
        }

        setImporting(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', importType.value);
        formData.append('overwrite', overwrite ? '1' : '0');

        try {
            const res = await API.post(namespace + 'tools/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportResult(res.data);
        } catch (e) {
            const msg = e.response && e.response.data && e.response.data.message
                ? e.response.data.message
                : __('Import failed. Please check your file and try again.', 'gameengine');
            setImportResult({ error: msg });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <h3 className="text-base font-semibold m-0">{__('Export Data', 'gameengine')}</h3>
                <p className="text-sm text-gray-500 m-0">
                    {__('Download your data as CSV or JSON. Exports are capped at 10,000 rows.', 'gameengine')}
                </p>

                <div className="flex gap-4 items-end flex-wrap">
                    <div style={{ minWidth: '200px' }}>
                        <GameEngineInput label={__('Data Type', 'gameengine')}>
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                options={exportTypeOptions}
                                value={exportType}
                                onChange={(opt) => setExportType(opt)}
                            />
                        </GameEngineInput>
                    </div>
                    <div style={{ minWidth: '130px' }}>
                        <GameEngineInput label={__('Format', 'gameengine')}>
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                options={formatOptions}
                                value={exportFormat}
                                onChange={(opt) => setExportFormat(opt)}
                            />
                        </GameEngineInput>
                    </div>
                    <Button
                        label={__('Export', 'gameengine')}
                        isLoading={exporting}
                        onClick={handleExport}
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex flex-col gap-4">
                <h3 className="text-base font-semibold m-0">{__('Import Data', 'gameengine')}</h3>
                <p className="text-sm text-gray-500 m-0">
                    {__('Upload a CSV or JSON file exported from GameEngine. Limited to 1,000 rows per import.', 'gameengine')}
                </p>

                <div className="flex gap-4 items-end flex-wrap">
                    <div style={{ minWidth: '200px' }}>
                        <GameEngineInput label={__('Data Type', 'gameengine')}>
                            <Select
                                className="gameengine-select"
                                classNamePrefix="gameengine-select"
                                options={exportTypeOptions}
                                value={importType}
                                onChange={(opt) => setImportType(opt)}
                            />
                        </GameEngineInput>
                    </div>
                    <GameEngineInput label={__('File', 'gameengine')}>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv,.json"
                            className="gameengine-input"
                            style={{ paddingTop: '6px' }}
                        />
                    </GameEngineInput>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                        type="checkbox"
                        checked={overwrite}
                        onChange={(e) => setOverwrite(e.target.checked)}
                    />
                    {__('Overwrite existing records with matching slugs/IDs', 'gameengine')}
                </label>

                <div>
                    <Button
                        label={__('Import', 'gameengine')}
                        isLoading={importing}
                        onClick={handleImport}
                    />
                </div>

                {importResult && (
                    <div
                        style={{
                            padding: '12px 16px',
                            borderRadius: '6px',
                            background: importResult.error ? '#fff5f5' : '#f0fff4',
                            border: `1px solid ${importResult.error ? '#fc8181' : '#68d391'}`,
                            fontSize: '13px',
                            color: importResult.error ? '#c53030' : '#276749',
                        }}
                    >
                        {importResult.error ? (
                            <span>{importResult.error}</span>
                        ) : (
                            <span>
                                {__('Import complete.', 'gameengine')}
                                {' '}
                                {__('Imported:', 'gameengine')} <strong>{importResult.imported || 0}</strong>
                                {importResult.skipped > 0 && (
                                    <>{' '}{__('Skipped:', 'gameengine')} <strong>{importResult.skipped}</strong></>
                                )}
                                {importResult.errors > 0 && (
                                    <>{' '}{__('Errors:', 'gameengine')} <strong>{importResult.errors}</strong></>
                                )}
                                {importResult.truncated && (
                                    <>{' '}<em>({__('File was truncated to 1,000 rows.', 'gameengine')})</em></>
                                )}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportImport;
