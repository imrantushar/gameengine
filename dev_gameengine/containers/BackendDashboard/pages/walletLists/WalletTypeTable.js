import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  Text,
} from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiEye, FiCheckCircle, FiXCircle, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import Search from '@GFComponents/Search';
import SnackbarAction from '@GFComponents/BulkAction/SnackbarAction';
import moment from 'moment';
import { API, namespace } from '@GFUtils/helper';
import Tooltip from "@GFComponents/Tooltip";
import StatusOptions from '@GFComponents/StatusOptions';

const WalletTypesTable = () => {
  const [payouts, setPayouts] = useState([]);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [tableStatus, setTableStatus] = useState('all'); 
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [actionSelected, setActionSelected] = useState({
    value: false,
    type: '',
    message: '',
  });

  const fetchPayouts = async () => {
    try {
      const response = await API.get(`${namespace}pro/payout/list`);
      const data = Array.isArray(response?.data) ? response.data : [];
      setPayouts(data);
      applyFilters(data, tableStatus, searchValue);
    } catch (error) {
      console.error('Failed to load payouts:', error);
      setPayouts([]);
      setFilteredPayouts([]);
    }
  };

  const applyFilters = (data, statusFilter, search) => {
    let result = [...data];

    if (statusFilter !== 'all') {
      result = result.filter(row => row.status === statusFilter);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(row =>
        (row.user_name || '').toLowerCase().includes(lower) ||
        (row.user_email || '').toLowerCase().includes(lower) ||
        (row.method || '').toLowerCase().includes(lower) ||
        String(row.points || '').includes(lower) ||
        String(row.amount || '').includes(lower)
      );
    }

    setFilteredPayouts(result);
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  useEffect(() => {
    applyFilters(payouts, tableStatus, searchValue);
  }, [tableStatus, searchValue, payouts]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const updatePayoutStatus = async (id, newStatus) => {
    try {
      await API.post(`${namespace}pro/payout/update`, {
        id,
        status: newStatus,
      });
      fetchPayouts();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Could not update status');
    }
  };

  // const deletePayout = async (id) => {
  //   if (!window.confirm(__('Delete this payout permanently?', 'gameengine'))) return;

  //   try {
  //     await API.delete(`${namespace}pro/payout/delete/${id}`);
  //     fetchPayouts();
  //   } catch (err) {
  //     console.error('Delete failed:', err);
  //   }
  // };

  const columns = useMemo(() => [
    {
      name: __('User', 'gameengine'),
      cell: row => (
        <Box>
          <Text fontWeight="500">{row.display_name || '—'}</Text>
          {/* <Text fontSize="12px" color="gray.500">{row.user_email || '—'}</Text> */}
        </Box>
      ),
      columnWidth: "22%",
    },
    {
      name: __('Points', 'gameengine'),
      cell: row => row.points || '—',
      columnWidth: "10%",
    },
    {
      name: __('Amount', 'gameengine'),
      cell: row => row.amount || '—',
      columnWidth: "12%",
    },
    {
      name: __('Method', 'gameengine'),
      cell: row => row.method || '—',
      columnWidth: "12%",
    },
    {
      name: __('Account Details', 'gameengine'),
      cell: row => {
        const [showFull, setShowFull] = useState(false);
        const notes = row.notes || '—';
        
        const maxVisible = 60; 
        const isLong = notes.length > maxVisible;
        const visibleText = showFull || !isLong 
          ? notes 
          : notes.substring(0, maxVisible).trim() + '...';

        return (
          <Flex direction="column" gap={1}>
            <Text 
              fontSize="sm" 
              whiteSpace="pre-wrap"           
              wordBreak="break-word"
              maxW="220px"
              color={notes === '—' ? 'gray.500' : 'inherit'}
            >
              {visibleText}
            </Text>

            {isLong && (
              <Button
                variant="link"
                color="blue"
                size="xs"
                p={0}
                height="auto"
                onClick={() => setShowFull(!showFull)}
                alignSelf="center"
              >
                {showFull ? 'Show less' : 'Show more'}
              </Button>
            )}
          </Flex>
        );
      },
      columnWidth: "20%",
    },
    {
      name: __('Status', 'gameengine'),
      cell: (row) => {
        const walletStatusOptions = [
          { value: 'pending', label: __('Pending', 'gameengine') },
          { value: 'approved', label: __('Approved', 'gameengine') },
          { value: 'rejected', label: __('Rejected', 'gameengine') },
          { value: 'completed', label: __('Completed', 'gameengine') },
        ];

        const statusUpdateHandler = (newStatus) => {
          updatePayoutStatus(row.id, newStatus);
        };

        return (
          <StatusOptions
            value={row?.status || 'pending'}           
            options={{
              items: walletStatusOptions,              
            }}
            onChangeHandler={statusUpdateHandler}
          />
        );
      },
      columnWidth: "14%",
    },
    // {
    //   name: __('Date', 'gameengine'),
    //   cell: row => row.created_at ? moment(row.created_at).format('MMM DD, YYYY') : '—',
    //   columnWidth: "10%",
    // },
    {
      name: __('Action', 'gameengine'),
      cell: row => {
        if (row.status !== 'pending') {
          return null; 
        }

        const options = [
          {
            type: 'button',
            label: __('Completed', 'gameengine'),
            icon: <Icon as={FiCheckCircle} />,
            onClick: () => updatePayoutStatus(row.id, 'completed')
          },
          {
            type: 'button',
            label: __('Rejected', 'gameengine'),
            icon: <Icon as={FiTrash2} />,
            onClick: () => updatePayoutStatus(row.id, 'rejected')
          }
        ];
        return <OptionMenu options={options} />;
      },
      columnWidth: "14%",
      textAlign: "end",
    },
  ], []);

  const filterTabs = [
    { value: 'all', label: __('All', 'gameengine') },
    { value: 'pending', label: __('Pending', 'gameengine') },
    { value: 'completed', label: __('Completed', 'gameengine') },
    { value: 'rejected', label: __('Rejected', 'gameengine') },
  ];

  const subHeaderComponentMemo = useMemo(() => (
    <Flex justifyContent="space-between" width="100%">
      <Flex className='gameengine-table-subheader-left' justifyContent={'space-between'}>
        {filterTabs.map((tab, index) => (
          <Button
            key={index}
            variant={'plain'} 
            minW="auto"
            bg={'transparent'}
            height={'auto'}
            fontSize={'12px'}
            fontWeight={'500'}
            lineHeight={'20px'}
            color={'var(--gameengine-font-color)'}
            paddingInline={'0'}
            padding={'16px 16px 0 16px'}
            _after={{
                content: '""',
                position: "absolute",
                left: 0,
                bottom: "-18px",
                width: "100%",
                height: "2px",
                bg: "var(--gameengine-primary)",
                transform:
                    tableStatus === tab.value ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.2s ease",
            }}
            _hover={{
                _after: {
                    transform: "scaleX(1)", 
                },
            }}
            onClick={() => setTableStatus(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </Flex>

      <Box>
        <Search
          placeholder={__('Search question', 'gameengine')}
          onSearchHandler={handleSearch}
          defaultValue={searchValue}
        />
      </Box>
    </Flex>
  ), [tableStatus, searchValue]);

  // const applyBulkAction = (rows, actionType) => {
  //   if (!rows.length) return;

  //   let message = actionType === 'delete'
  //     ? __('Delete selected payouts permanently?', 'gameengine')
  //     : '';

  //   setActionSelected({
  //     value: true,
  //     type: actionType,
  //     message,
  //   });
  // };

  // const confirmBulkHandler = async () => {
  //   if (actionSelected.type === 'delete') {
  //     try {
  //       for (const row of selectedRows) {
  //         await API.delete(`${namespace}pro/payout/delete/${row.id}`);
  //       }
  //       setSelectedRows([]);
  //       setActionSelected({ value: false });
  //       fetchPayouts();
  //     } catch (err) {
  //       console.error('Bulk delete error:', err);
  //     }
  //   }
  // };

  // const snackbarActionButtons = [
  //   {
  //     label: __('Delete', 'gameengine'),
  //     onClick: () => applyBulkAction(selectedRows, 'delete'),
  //     className: 'gameengine-btn--delete',
  //   },
  // ];

  return (
    <>
      <ListTable
        key={'wallet-payouts-' + filteredPayouts.length}
        columns={columns}
        showColumnFilter={false}
        data={filteredPayouts}
        showSubHeader={true}
        subHeaderComponent={subHeaderComponentMemo}
        isRowSelectable={false}
        showPagination={false}
        noDataText={__('No data found for Wallet', 'gameengine')}
        totalItems={filteredPayouts.length}
        totalRows={filteredPayouts.length}
        rowsPerPage={filteredPayouts.length || 10}
        currentPageNumber={[1]}
        getSelectRowValue={setSelectedRows}
      />

      {/* <SnackbarAction
        itemsLength={selectedRows.length}
        actionButtons={snackbarActionButtons}
        isActionSelected={actionSelected}
        confirmHandler={confirmBulkHandler}
        resetHandler={() => {
          setSelectedRows([]);
          setActionSelected({ value: false });
        }}
      /> */}
    </>
  );
};

export default WalletTypesTable;