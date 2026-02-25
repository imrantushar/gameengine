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
import { FiTrash2, FiEye } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import Search from '@GFComponents/Search';
import SnackbarAction from '@GFComponents/BulkAction/SnackbarAction';
import moment from 'moment';
import { API, namespace,  } from '@GFUtils/helper';



const WalletTypesTable = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [actionSelected, setActionSelected] = useState({
    value: false,
    type: '',
    message: ''
  });

const fetchHandler = async (searchKey = "") => {
  try {
    setLoading(true);
    const response = await API.get(
      `${namespace}pro/payout/list`
    );
    console.log(response);
    setPayouts(Array.isArray(response?.data) ? response.data : []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};



useEffect(() => {
    fetchHandler();
}, []);

  const deleteHandler = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await fetch(
        `${namespace}pro/payout/delete/${id}`,
        { method: "DELETE" }
      );
      fetchHandler();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = {
    pending: 'orange',
    completed: 'green',
    rejected: 'red'
  };

  const columns = [
    { 
      name: __('User', 'gameengine'),
      cell: row => (
        <Box>
          <Text fontWeight="500">
            {row.user_name}
          </Text>
          <Text fontSize="12px" color="gray.500">
            {row.user_email}
          </Text>
        </Box>
      ),
      columnWidth: "18%"
    },
    { 
      name: __('Points', 'gameengine'),
      cell: row => row.points,
      columnWidth: "10%"
    },
    {
      name: __('Amount', 'gameengine'),
      cell: row => row.amount,
      columnWidth: "12%"
    },
    {
      name: __('Method', 'gameengine'),
      cell: row => row.method,
      columnWidth: "12%"
    },
    {
      name: __('Account Details', 'gameengine'),
      cell: row => row.account_details,
      columnWidth: "20%"
    },
    {
      name: __('Status', 'gameengine'),
      cell: row => (
        <Badge colorScheme={statusColor[row.status]}>
          {row.status}
        </Badge>
      ),
      columnWidth: "10%"
    },
    {
      name: __('Date', 'gameengine'),
      cell: row => (
        moment(row.created_at).format('MMM DD, YYYY')
      ),
      columnWidth: "10%"
    },
    {
      name: __('Action', 'gameengine'),
      cell: row => (
        <OptionMenu
          options={[
            {
              type: 'button',
              label: "View",
              icon: <Icon as={FiEye} />,
              onClick: () => console.log(row)
            },
            {
              type: 'button',
              label: "Delete",
              icon: <Icon as={FiTrash2} />,
              onClick: () => deleteHandler(row.id)
            }
          ]}
        />
      ),
      columnWidth: "8%"
    }
  ];

  const subHeaderComponentMemo = useMemo(() => {
    const searchHandler = (value) => {
      fetchHandler(value);
    };
    return (
      <Flex justifyContent="flex-end">
        <Search
          placeholder="Search user"
          onSearchHandler={searchHandler}
        />
      </Flex>
    );
  }, []);

  const applyBulkActionHandler = (rows) => {
    if (!rows.length) return;
    setActionSelected({
      value: true,
      type: 'delete',
      message: "Delete selected payouts?"
    });
  };

  const confirmBulkHandler = async () => {
    for (const row of selectedRows) {
      await fetch(
        `/wp-json/gameengine/v1/pro/payout/delete/${row.id}`,
        { method: "DELETE" }
      );
    }
    setSelectedRows([]);
    setActionSelected({ value: false });
    fetchHandler();
  };

  const snackbarActionButtons = [
    {
      label: "Delete",
      onClick: () => applyBulkActionHandler(selectedRows),
      className: 'gameengine-btn--delete'
    }
  ];

  return (
    <>
      <ListTable
        columns={columns}
        data={payouts}
        showSubHeader
        subHeaderComponent={subHeaderComponentMemo}
        isRowSelectable={false}
        noDataText="No payout found"
        dataFetchingStatus={loading ? 'pending' : 'success'}
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