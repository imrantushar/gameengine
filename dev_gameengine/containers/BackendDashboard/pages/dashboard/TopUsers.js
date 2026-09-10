import React from 'react';
import { __ } from '@wordpress/i18n';
import BoxView from '@GFComponents/BoxView/BoxView';

const TopUsers = ({ users }) => {
    // Built per render, not at module scope: __() must run after the script's
    // translations have been registered.
    const columns = [
        { key: 'rank', label: __('Rank', 'gameengine'), width: 'w-[10%]' },
        { key: 'user', label: __('User', 'gameengine'), width: 'w-[30%]' },
        { key: 'points', label: __('Points', 'gameengine'), width: 'w-[20%]' },
        { key: 'achievements', label: __('Achievements', 'gameengine'), width: 'w-[20%]' },
        { key: 'levels', label: __('Levels', 'gameengine'), width: 'w-[20%]' },
    ];

    return <BoxView width='100%' title={__('Top 5 Users', 'gameengine')}>
        {!users || users.length === 0 ? (
            <p className='text-sm m-0 text-[var(--gameengine-warn-muted)]'>
                {__("No data available yet.", "gameengine")}
            </p>
        ) : (
            // Neutral header on a hairline-separated body — the same table
            // treatment the rest of the admin uses, so the dashboard doesn't
            // introduce a second table style of its own.
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-[var(--gameengine-secondary-color)]">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`${column.width} px-4 py-3 text-left text-sm font-semibold text-[var(--gameengine-font-color)]`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {users.map((item, index) => (
                        <tr
                            key={index}
                            className={index === users.length - 1 ? '' : '[border-bottom:1px_solid_var(--gameengine-border-color)]'}
                        >
                            <td className="px-4 py-3 text-sm text-[var(--gameengine-warn-muted)]">
                                #{index + 1}
                            </td>

                            <td className="px-4 py-3 text-sm font-medium text-[var(--gameengine-font-color)]">
                                {item.name}
                            </td>

                            <td className="px-4 py-3 text-sm text-[var(--gameengine-font-color)]">
                                {parseInt(item.total_points).toLocaleString()}
                            </td>

                            <td className="px-4 py-3 text-sm text-[var(--gameengine-font-color)]">
                                {item.achievements_count}
                            </td>

                            <td className="px-4 py-3 text-sm text-[var(--gameengine-font-color)]">
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
