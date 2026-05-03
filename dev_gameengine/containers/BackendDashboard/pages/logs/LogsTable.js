import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import { FiEdit, FiClock } from "react-icons/fi";
import { fetchLogs, } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Icon, } from '@GFComponents/UI';

const LogsTable = ({
  modalOpenHandler
}) => {
  const dispatch = useDispatch();
  const {
    items,
    totalItems,
    currentPage,
    perPage,
    search,
    status
  } = useSelector(state => state.logs);
  const [loading, setLoading] = useState(items.length === 0);
  const handleRefresh = async (page = 1, per_page = 10, serchKey = "") => {
    setLoading(true);
    await dispatch(fetchLogs({
      page,
      per_page,
      search: serchKey
    }));
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const handlePageChange = newPage => {
    handleRefresh(newPage, perPage);
  };

  const handlePerPageChange = itemsPerPage => {
    handleRefresh(currentPage, itemsPerPage);
  };

  const columns = useMemo(() => [
    {
      name: __('User', 'gameengine'),
      cell: row => <div className='gameengine-table-flex-col'>
        <span className="font-semibold">{row.user_name || 'Guest'}</span>
        <span className="text-xs" style={{
          color: '#666'
        }}>{row.user_email || `ID: ${row.user_id}`}</span>
      </div>,
      columnWidth: "180px",
    },
    {
      name: __('Event', 'gameengine'),
      cell: row => <span>{row.event_name}</span>,
      columnWidth: "130px"
    },
    {
      name: __('Message / Details', 'gameengine'),
      cell: row => {
        let points = 0;
        if (row.points_awarded) points = parseInt(row.points_awarded); else if (row.meta && row.meta.points) points = parseInt(row.meta.points);
        const scheduled = row.meta?.scheduled_for;
        const congratsMsg = row.meta?.congratulations_message;
        return <>
          <div title={row.message}>{row.message}</div>

          {congratsMsg && <div className="rounded text-xs" style={{
            marginTop: '6px',
            padding: '6px 8px',
            background: '#f0fff4',
            // Light Green Bg
            border: '1px solid #c6f6d5',
            color: '#2f855a' // Dark Green Text
          }} dangerouslySetInnerHTML={{
            __html: congratsMsg
          }} />}

          {points !== 0 && !isNaN(points) && <span className="inline-block mt-1 text-xs" style={{
            color: points > 0 ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            ({points > 0 ? '+' : ''}{points} Points)
          </span>}

          {scheduled && <div style={{
            fontSize: '11px',
            color: 'purple',
            marginTop: '2px'
          }}>
            <Icon as={FiClock} className="mr-1" style={{
              verticalAlign: 'middle'
            }} />
            {new Date(scheduled).toLocaleString()}
          </div>}
        </>;
      },
      columnWidth: "340px"
    },
    {
      name: __('Date', 'gameengine'),
      cell: row => <p>
        {new Date(row.created_at).toLocaleString()}
      </p>,
      columnWidth: "154px"
    },
    {
      name: __('Status', 'gameengine'),
      cell: row => <span className="rounded-full pl-3 pr-3">
        {row.status}
      </span>,
      columnWidth: "100px"
    },
    {
      name: __('Action', 'gameengine'),
      cell: row => {
        const isEditable = ['manual_adjustment', 'manual_award', 'manual_deduct'].includes(row.trigger_key);
        if (!isEditable) return <p style={{
          "fontSize": "xs",
          "color": "gray.400"
        }}>System Log</p>;
        return <button
          onClick={() => modalOpenHandler(row)} title="Edit Log"
          className='border border-solid border-[var(--gameengine-border-color)] rounded px-2 py-1 text-sm text-[var(--gameengine-font-color)] hover:bg-[var(--gameengine-border-color)] transition-opacity opacity-80 hover:opacity-100'
        >
          <FiEdit className='cursor-pointer' />
        </button>;
      },
      columnWidth: "20px",
    }
  ], []);

  const subHeaderComponentMemo = useMemo(() => {
    return <>
      <div className='flex items-center gap-2'>
        <GFLabel color="var(--gameengine-font-color)" fontWeight="700" fontSize='16px' label={__(`Logs`, 'gameengine')} />

        <button
          onClick={handleRefresh}
          disabled={status === "loading"}
          className='bg-transparent p-1.5 cursor-pointer text-[var(--gameengine-font-color)] [border-color:var(--gameengine-border-color)] border border-solid rounded-[4px]'
        >
          {status === "loading" ? "Loading..." : "Refresh"}
        </button>
      </div>

      <Search placeholder={__('Search Items', 'gameengine')} defaultValue={search} onSearchHandler={val => dispatch(fetchLogs({
        currentPage,
        perPage,
        search: val
      }))} />
    </>;
  }, [status, search]);

  return (
    <ListTable
      columns={columns}
      isRowSelectable={false}
      data={items}
      showSubHeader={true}
      subHeaderComponent={subHeaderComponentMemo}
      showColumnFilter={false}
      showPagination={true}
      noDataText={__("No logs found", "gameengine")}
      totalItems={totalItems}
      currentPageNumber={currentPage}
      perPage={perPage}
      onChangePage={handlePageChange}
      onChangeItemsPerPage={handlePerPageChange}
      dataFetchingStatus={loading} suffix="logs-table"
    />
  );
};

export default LogsTable;
