import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import BoxView from '@GFComponents/BoxView/BoxView';
import Button from '@GFComponents/Button';
import { FiDownload } from 'react-icons/fi';
import { API, namespace } from '@GFUtils/helper';

const TopUsers = ({ users, startDate, endDate }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const res = await API.get(namespace + 'dashboard/export', {
                params,
                responseType: 'blob',
            });

            const contentDisposition = res.headers['content-disposition'] || '';
            const match = contentDisposition.match(/filename="?([^";\s]+)"?/);
            const filename = match ? match[1] : `gameengine-users-${new Date().toISOString().slice(0, 10)}.csv`;

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

    return <BoxView
        width='100%'
        title={__('Top 5 Users', 'gameengine')}
        rightContent={
            <Button
                label={__('Export CSV', 'gameengine')}
                icon={<FiDownload size="14px" />}
                preset="secondary"
                border="gray"
                isLoading={exporting}
                onClick={handleExport}
            />
        }
    >
        {!users || users.length === 0 ? (
            <p>{__("No data available yet.", "gameengine")}</p>
        ) : (
            <table className="w-full border-separate border-spacing-y-2">
                <thead>
                    <tr className="bg-[var(--gameengine-primary)]">
                        <th className="w-[6.21%] rounded-l-[4px] px-6 py-2 text-left text-sm font-medium text-[var(--gameengine-background)]">
                            {__('Rank', 'gameengine')}
                        </th>
                        <th className="w-[27.62%] px-4 py-2 text-left text-sm font-medium text-[var(--gameengine-background)]">
                            {__('User', 'gameengine')}
                        </th>
                        <th className="w-[22.06%] px-4 py-2 text-left text-sm font-medium text-[var(--gameengine-background)]">
                            {__('Points', 'gameengine')}
                        </th>
                        <th className="w-[22.06%] px-4 py-2 text-left text-sm font-medium text-[var(--gameengine-background)]">
                            {__('Achievements', 'gameengine')}
                        </th>
                        <th className="w-[22.06%] rounded-r-[4px] px-4 py-2 text-left text-sm font-medium text-[var(--gameengine-background)]">
                            {__('Levels', 'gameengine')}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((item, index) => (
                        <tr
                            key={index}
                            className={index % 2 === 0 ? 'bg-[var(--gameengine-background)]' : 'bg-[var(--gameengine-secondary-color)]'}
                        >
                            <td className={`px-6 py-3 text-sm ${index % 2 !== 0 ? 'rounded-l-[4px]' : ''}`}>
                                #{index + 1}
                            </td>

                            <td className={`px-4 py-3 text-sm ${index % 2 !== 0 ? '' : ''}`}>
                                {item.name}
                            </td>

                            <td className="px-4 py-3 text-sm">
                                {parseInt(item.total_points).toLocaleString()}
                            </td>

                            <td className="px-4 py-3 text-sm font-medium">
                                {item.achievements_count}
                            </td>

                            <td className={`px-4 py-3 text-sm ${index % 2 !== 0 ? 'rounded-r-[4px]' : ''}`}>
                                {item.top_level || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </BoxView>;
};

export default TopUsers;
