import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import TopBar from '@GFComponents/TopBar';
import GFLabel from '@GFComponents/Labels/GFLabel';
import Search from '@GFComponents/Search';
import GetHelp from '@GFComponents/GetHelp';
import ListTable from '@GFComponents/ListTable';
import OptionMenu from '@GFComponents/OptionMenu';
import { FiRefreshCw } from 'react-icons/fi';
import { reactDebounce } from '@GFUtils/helper';

const STATUS_TABS = [
  { value: 'all', label: __('All', 'gameengine') },
  { value: 'pending', label: __('Pending', 'gameengine') },
  { value: 'completed', label: __('Completed', 'gameengine') },
  { value: 'refunded', label: __('Refunded', 'gameengine') },
];

const BuyPointsAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchOrders = async ({ status = 'all', search: q = '', page = 1 } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 20, page });
      if (status !== 'all') params.append('status', status);
      if (q) params.append('search', q);
      const res = await apiFetch({ path: `/gameengine/v1/pro/buy-points/orders?${params}`, parse: false });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data?.items || []);
      setTotal(parseInt(res.headers?.get('X-WP-Total') || data?.total || 0, 10));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleRefund = async (id) => {
    try {
      await apiFetch({ path: `/gameengine/v1/pro/buy-points/orders/${id}/refund`, method: 'POST' });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'refunded' } : o));
    } catch {}
  };

  const handleSearch = reactDebounce(value => {
    setSearch(value);
    fetchOrders({ status: filterStatus, search: value });
  }, 400);

  const handleTabChange = (status) => {
    setFilterStatus(status);
    fetchOrders({ status, search });
  };

  const columns = [
    { name: __('User', 'gameengine'), cell: row => row.user_display_name || '—', columnWidth: '20%' },
    { name: __('Package', 'gameengine'), cell: row => row.package_label || '—', columnWidth: '18%' },
    { name: __('Points', 'gameengine'), cell: row => row.points ?? '—', columnWidth: '10%' },
    { name: __('Amount Paid', 'gameengine'), cell: row => row.amount_paid ? `$${row.amount_paid}` : '—', columnWidth: '13%' },
    { name: __('Gateway', 'gameengine'), cell: row => row.gateway || '—', columnWidth: '10%' },
    {
      name: __('Status', 'gameengine'),
      cell: row => (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          row.status === 'completed' ? 'bg-green-100 text-green-700' :
          row.status === 'refunded' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      ),
      columnWidth: '12%',
    },
    { name: __('Date', 'gameengine'), cell: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—', columnWidth: '12%' },
    {
      name: __('Action', 'gameengine'),
      cell: row => {
        if (row.status !== 'completed') return null;
        return (
          <OptionMenu options={[{
            type: 'button',
            label: __('Refund', 'gameengine'),
            icon: <FiRefreshCw />,
            onClick: () => handleRefund(row.id),
          }]} />
        );
      },
      columnWidth: '5%',
    },
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
      <TopBar path={__('Buy Points', 'gameengine')} rightContent={<GetHelp filterText={['buy-points']} />} />

      <div className="gameengine-page-content">
        <div className="flex justify-between items-center py-6 px-1">
          <GFLabel type="plainHeading" margin={0} label={__('Buy Points Orders', 'gameengine')} />
        </div>

        <ListTable
          columns={columns}
          data={orders}
          showSubHeader
          subHeaderComponent={subHeader}
          isRowSelectable={false}
          showPagination
          noDataText={__('No orders found.', 'gameengine')}
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

export default BuyPointsAdmin;
