import React, { useEffect, useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferrals, deleteReferral, setPage, setSearchQuery } from '@GFRedux/Slices/referralSlice/referralSlice';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import { FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const ReferralsTable = () => {
    const dispatch = useDispatch();
    const { items, totalItems, currentPage, perPage, search, status } = useSelector(state => state.referrals);
    const [loading, setLoading] = useState(items.length === 0);

    const fetchHandler = async ({ page = 1, per_page = 15, searchKey = '' }) => {
        try {
            setLoading(true);
            await dispatch(fetchReferrals({ page, per_page, search: searchKey }));
        } catch (error) {
            console.warn(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHandler({ page: currentPage, per_page: perPage, searchKey: search });
    }, [currentPage, perPage, search]);

    const handleDelete = (id) => {
        if (window.confirm(__('Are you sure you want to delete this referral record?', 'gameengine'))) {
            dispatch(deleteReferral(id));
        }
    };

    const columns = [
        {
            name: __('Referrer', 'gameengine'),
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {row.referrer_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium m-0">{row.referrer_name}</p>
                        <p className="text-xs text-gray-500 m-0">{row.referrer_email}</p>
                    </div>
                </div>
            ),
        },
        {
            name: __('Referee (Signed up)', 'gameengine'),
            cell: (row) => row.referee_name ? (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {row.referee_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium m-0">{row.referee_name}</p>
                        <p className="text-xs text-gray-500 m-0">{row.referee_email}</p>
                    </div>
                </div>
            ) : <span className="text-xs" style={{ color: '#999' }}>-</span>,
        },
        {
            name: __('Status', 'gameengine'),
            cell: (row) => (
                <span className={`capitalize rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: __('IP Address', 'gameengine'),
            cell: (row) => <span className="text-sm">{row.ip_address}</span>,
        },
        {
            name: __('Date', 'gameengine'),
            cell: (row) => (
                <div>
                    <p className="m-0">{moment(row.created_at).format('MMMM DD, YYYY')}</p>
                </div>
            ),
        },
        {
            name: __('Action', 'gameengine'),
            cell: (row) => (
                <button
                    onClick={() => handleDelete(row.id)}
                    className="p-2 rounded text-red-500 hover:bg-red-50 transition-all duration-200 border-0"
                    aria-label={__('Delete referral', 'gameengine')}
                >
                    <FiTrash2 size={16} />
                </button>
            ),
            textAlign: 'center',
        },
    ];

    const subHeaderComponentMemo = useMemo(() => {
        const searchHandler = (value = '') => {
            fetchHandler({ page: 1, per_page: perPage, searchKey: value });
            dispatch(setSearchQuery(value));
            dispatch(setPage(1));
        };

        return (
            <div className="gameengine-filter-toolbar flex justify-between items-center w-full border-0 border-b border-solid border-gray-200 mb-4">
                <div className="gameengine-filter-toolbar__tabs flex" />
                <div className="gameengine-table-subheader-right pb-2">
                    <Search
                        placeholder={__('Search referrals...', 'gameengine')}
                        onSearchHandler={searchHandler}
                        defaultValue={search ? search : ''}
                    />
                </div>
            </div>
        );
    }, [search]);

    return (
        <ListTable
            columns={columns}
            data={items}
            showSubHeader={true}
            showColumnFilter={false}
            showPagination={false}
            noDataText={__('No referral data found.', 'gameengine')}
            suffix="referrals-table"
            subHeaderComponent={subHeaderComponentMemo}
            totalItems={totalItems}
            totalRows={items.length}
            dataFetchingStatus={loading}
            rowsPerPage={perPage}
            currentPageNumber={[currentPage]}
        />
    );
};

export default ReferralsTable;
