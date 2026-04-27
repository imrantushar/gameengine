import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferrals, deleteReferral, setPage, setSearchQuery } from '@GFRedux/Slices/referralSlice/referralSlice';
import ListTable from '@GFComponents/ListTable';
import Pagination from '@GFComponents/Pagination';
import Search from '@GFComponents/Search';
import { FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const ReferralsTable = () => {
    const dispatch = useDispatch();
    const { items, totalItems, currentPage, perPage, search, status } = useSelector(state => state.referrals);

    useEffect(() => {
        dispatch(fetchReferrals({ page: currentPage, per_page: perPage, search }));
    }, [currentPage, perPage, search]);

    const handleSearch = (value) => {
        dispatch(setSearchQuery(value));
        dispatch(setPage(1));
    };

    const handleDelete = (id) => {
        if (window.confirm(__('Are you sure you want to delete this referral record?', 'gameengine'))) {
            dispatch(deleteReferral(id));
        }
    };

    const columns = [
        {
            header: __('Referrer', 'gameengine'),
            accessor: 'referrer_name',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {row.referrer_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-sm m-0">{row.referrer_name}</p>
                        <p className="text-xs text-gray-500 m-0">{row.referrer_email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: __('Referee (Signed up)', 'gameengine'),
            accessor: 'referee_name',
            cell: (row) => row.referee_name ? (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {row.referee_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-sm m-0">{row.referee_name}</p>
                        <p className="text-xs text-gray-500 m-0">{row.referee_email}</p>
                    </div>
                </div>
            ) : <span className="text-gray-400">--</span>,
        },
        {
            header: __('Status', 'gameengine'),
            accessor: 'status',
            cell: (row) => (
                <span className={`capitalize rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: __('IP Address', 'gameengine'),
            accessor: 'ip_address',
        },
        {
            header: __('Date', 'gameengine'),
            accessor: 'created_at',
            cell: (row) => moment(row.created_at).format('MMM D, YYYY h:mm A'),
        },
        {
            header: __('Action', 'gameengine'),
            accessor: 'id',
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 rounded text-red-500 hover:bg-red-50 transition-all duration-200"
                        title={__('Delete referral', 'gameengine')}
                    >
                        <FiTrash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--gameengine-border-color)' }}>
            <ListTable
                columns={columns}
                data={items}
                loading={status === 'loading'}
                suffix="referrals"
                subHeaderComponent={
                    <Search
                        placeholder={__('Search referrals...', 'gameengine')}
                        onSearch={handleSearch}
                    />
                }
            />

            <Pagination
                totalItems={totalItems}
                perPage={perPage}
                currentPage={currentPage}
                onPageChange={(page) => dispatch(setPage(page))}
            />
        </div>
    );
};

export default ReferralsTable;
