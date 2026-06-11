import React, { useEffect, useMemo, useState } from 'react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import OptionMenu from '@GFComponents/OptionMenu';
import Search from '@GFComponents/Search';
import StatusOptions from '@GFComponents/StatusOptions';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPayoutList,
  payoutSearch,
  updatePayoutStatus,
} from '@GFRedux/Slices/payoutSlice/payoutSlice';
import { reactDebounce } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';
import TopBar from '@GFComponents/TopBar';
import GetHelp from '@GFComponents/GetHelp';

export default function Wallet() {
  const {
    data: payouts,
    search: searchValue,
    total,
    perPage,
  } = useSelector(state => state.payouts);

  const [tableStatus, setTableStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [dataFetchingStatus, setDataFetchingStatus] = useState(false);

  const dispatch = useDispatch();

  const fetchPayouts = async ({
    status = 'all',
    page = 1,
    per_page = 15,
    search = '',
  }) => {
    setDataFetchingStatus(true);
    try {
      await dispatch(
        fetchPayoutList({
          status,
          page,
          per_page,
          search,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to load payouts:', error);
    } finally {
      setDataFetchingStatus(false);
    }
  };

  useEffect(() => {
    if (!payouts?.length || payouts?.length < 2) {
      (async () => {
        await fetchPayouts({});
      })();
    }
  }, []);

  const handleSearch = reactDebounce(async value => {
    dispatch(payoutSearch(value));
    await fetchPayouts({
      search: value,
    });
  }, 500);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await dispatch(
        updatePayoutStatus({
          id,
          status: newStatus,
        })
      ).unwrap();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const hasPendingRow = payouts?.some(row => row.status === 'pending');

  const walletStatusOptions = [
    { value: 'pending', label: __('Pending', 'gameengine') },
    { value: 'approved', label: __('Approved', 'gameengine') },
    { value: 'rejected', label: __('Rejected', 'gameengine') },
    { value: 'completed', label: __('Completed', 'gameengine') },
  ];

  const columns = [
    {
      name: __('User', 'gameengine'),
      cell: row => (
        <p className="font-medium">{row.display_name || '—'}</p>
      ),
      columnWidth: '22%',
    },
    {
      name: __('Points', 'gameengine'),
      cell: row => row.points || '—',
      columnWidth: '10%',
    },
    {
      name: __('Amount', 'gameengine'),
      cell: row => row.amount || '—',
      columnWidth: '12%',
    },
    {
      name: __('Method', 'gameengine'),
      cell: row => row.method || '—',
      columnWidth: '12%',
    },
    {
      name: __('Account Details', 'gameengine'),
      cell: row => {
        const [showFull, setShowFull] = useState(false);

        const notes = row.notes || '—';
        const maxVisible = 60;
        const isLong = notes.length > maxVisible;

        const visibleText =
          showFull || !isLong
            ? notes
            : notes.substring(0, maxVisible).trim() + '...';

        return (
          <div className="flex flex-col gap-1">
            <p
              className="whitespace-pre-wrap break-words"
              style={{
                fontSize: 'sm',
                maxWidth: '220px',
                color: notes === '—' ? 'gray.500' : 'inherit',
              }}
            >
              {visibleText}
            </p>

            {isLong && (
              <button
                className="p-0 h-auto self-center"
                style={{ color: 'blue' }}
                onClick={() => setShowFull(!showFull)}
              >
                {showFull
                  ? __('Show less', 'gameengine')
                  : __('Show more', 'gameengine')}
              </button>
            )}
          </div>
        );
      },
      columnWidth: '20%',
    },
    {
      name: __('Status', 'gameengine'),
      cell: row => {
        const statusUpdateHandler = newStatus => {
          handleUpdateStatus(row.id, newStatus);
        };

        return (
          <StatusOptions
            value={row?.status || 'pending'}
            options={{ items: walletStatusOptions }}
            onChangeHandler={statusUpdateHandler}
          />
        );
      },
      columnWidth: '14%',
    },
    ...(hasPendingRow
      ? [
          {
            name: __('Action', 'gameengine'),
            cell: row => {
              if (row.status !== 'pending') return null;

              const options = [
                {
                  type: 'button',
                  label: __('Completed', 'gameengine'),
                  icon: <FiCheckCircle />,
                  onClick: () =>
                    handleUpdateStatus(row.id, 'completed'),
                  hasBorder: true,
                },
                {
                  type: 'button',
                  label: __('Rejected', 'gameengine'),
                  suffix: 'trash',
                  icon: <FiTrash2 />,
                  onClick: () =>
                    handleUpdateStatus(row.id, 'rejected'),
                },
              ];

              return <OptionMenu options={options} />;
            },
            columnWidth: '14%',
          },
        ]
      : []),
  ].filter(Boolean);

  const filterTabs = [
    { value: 'all', label: __('All', 'gameengine') },
    { value: 'pending', label: __('Pending', 'gameengine') },
    { value: 'completed', label: __('Completed', 'gameengine') },
    { value: 'rejected', label: __('Rejected', 'gameengine') },
  ];

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div className="gameengine-filter-toolbar flex justify-between items-center w-full border-0 border-b border-solid border-gray-200 mb-4">
        <div className="gameengine-filter-toolbar__tabs flex">
          {filterTabs.map((tab, index) => {
            const isActive = tableStatus === tab.value;

            return (
              <button
                key={index}
                className={`gameengine-filter-toolbar__tab !text-sm font-medium transition-all${
                  isActive ? ' is-active' : ''
                }`}
                onClick={() => {
                  setTableStatus(tab.value);
                  fetchPayouts({ status: tab.value });
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="gameengine-table-subheader-right pb-2">
          <Search
            placeholder={__('Search wallets', 'gameengine')}
            onSearchHandler={handleSearch}
            defaultValue={searchValue}
          />
        </div>
      </div>
    );
  }, [tableStatus, searchValue]);

  return (
    <>
      <TopBar path={__('Withdraw Lists', 'gameengine')} rightContent={<GetHelp filterText={['withdraw']} />} />

      <div className="gameengine-page-content">
        <div
          className="flex justify-between items-center"
          style={{ padding: '24px 0' }}
        >
          <GFLabel
            type="plainHeading"
            margin={0}
            label={__('Withdraw Lists', 'gameengine')}
          />
        </div>

        <ListTable
          key={'wallet-payouts-' + payouts.length}
          columns={columns}
          showColumnFilter={false}
          data={payouts}
          showSubHeader={true}
          subHeaderComponent={subHeaderComponentMemo}
          isRowSelectable={false}
          showPagination={false}
          noDataText={__('No data found for Wallet', 'gameengine')}
          totalItems={total}
          totalRows={total}
          rowsPerPage={perPage || 10}
          currentPageNumber={[1]}
          dataFetchingStatus={dataFetchingStatus}
          getSelectRowValue={setSelectedRows}
        />
      </div>
    </>
  );
}
