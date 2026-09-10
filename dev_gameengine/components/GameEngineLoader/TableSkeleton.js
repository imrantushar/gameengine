import React from 'react';
import Skeleton from './Skeleton';

const TableLoading = ({ rows = 5, cols = 5 }) => {
    return (
        <table className="w-full border-separate border-spacing-y-2">
            <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {[...Array(cols)].map((_, colIndex) => (
                        <td key={colIndex}>
                            <Skeleton />
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default TableLoading;
