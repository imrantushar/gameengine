import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Search from '@GFComponents/Search';
import GetHelp from '@GFComponents/GetHelp';
import ListTable from '@GFComponents/ListTable';
import { reactDebounce } from '@GFUtils/helper';

const STATUS_TABS = [
  { value: 'all', label: __('All', 'gameengine') },
  { value: 'completed', label: __('Completed', 'gameengine') },
];

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchTransfers = async ({ status = 'all', search: q = '', page = 1 } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 20, page });
      if (status !== 'all') params.append('status', status);
      if (q) params.append('search', q);
      const res = await apiFetch({ path: `/gameengine/v1/pro/transfers?${params}`, parse: false });
      const data = await res.json();
      setTransfers(Array.isArray(data) ? data : data?.items || []);
      setTotal(parseInt(res.headers?.get('X-WP-Total') || data?.total || 0, 10));
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  const handleSearch = reactDebounce(value => {
    setSearch(value);
    fetchTransfers({ status: filterStatus, search: value });
  }, 400);

  const handleTabChange = (status) => {
    setFilterStatus(status);
    fetchTransfers({ status, search });
  };

  const columns = [
    { name: __('Sender', 'gameengine'), cell: row => row.sender_name || '—', columnWidth: '20%' },
    { name: __('Receiver', 'gameengine'), cell: row => row.receiver_name || '—', columnWidth: '20%' },
    { name: __('Point Type', 'gameengine'), cell: row => row.point_type_name || '—', columnWidth: '15%' },
    { name: __('Amount', 'gameengine'), cell: row => row.amount ?? '—', columnWidth: '10%' },
    { name: __('Fee', 'gameengine'), cell: row => row.fee ?? 0, columnWidth: '10%' },
    { name: __('Date', 'gameengine'), cell: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—', columnWidth: '15%' },
    { name: __('Status', 'gameengine'), cell: row => row.status || 'completed', columnWidth: '10%' },
  ];

  const subHeader = (
    <div className="gameengine-filter-toolbar flex justify-between items-center w-full border-0 border-b border-solid border-gray-200 mb-4">
      <div className="gameengine-filter-toolbar__tabs flex">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            className={`gameengine-filter-toolbar__tab !text-sm font-medium transition-all${filterStatus === tab.value ? ' is-active' : ''}`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pb-2">
        <Search placeholder={__('Search users…', 'gameengine')} onSearchHandler={handleSearch} />
      </div>
    </div>
  );

  return (
    <>
      <TopBar path={__('Transfers', 'gameengine')} rightContent={<GetHelp filterText={['transfers']} />} />

      <div className="gameengine-page-content">
        <div className="flex justify-between items-center py-6 px-1">
          <GFLabel type="plainHeading" margin={0} label={__('Point Transfers', 'gameengine')} />
        </div>

        <ListTable
          columns={columns}
          data={transfers}
          showSubHeader
          subHeaderComponent={subHeader}
          isRowSelectable={false}
          showPagination
          noDataText={__('No transfer records found.', 'gameengine')}
          totalItems={total}
          totalRows={total}
          rowsPerPage={20}
          currentPageNumber={[1]}
          dataFetchingStatus={loading}
          getSelectRowValue={() => {}}
        />
      </div>
    </>
  );
};

export default Transfers;
