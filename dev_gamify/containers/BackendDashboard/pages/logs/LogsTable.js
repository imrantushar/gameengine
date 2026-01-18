import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import { FiEdit, FiClock } from "react-icons/fi";
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Button, Icon, Badge, Flex, Spinner, Text } from '@chakra-ui/react';

const LogsTable = ({modalOpenHandler}) => {
  const dispatch = useDispatch();
  const {
    items,
    totalItems,
    currentPage,
    rowsPerPage,
    searchQuery,
    status
  } = useSelector((state) => state.logs);
  
  useEffect(() => {
      dispatch(fetchLogs({ page: currentPage, per_page: rowsPerPage, search: searchQuery }));
  }, [dispatch, currentPage, rowsPerPage, searchQuery]);

  const handlePageChange = (newPage) => dispatch(setPage(newPage));

  const handlePerPageChange = (newLimit) => {
      dispatch(setRowsPerPage(newLimit));
      dispatch(setPage(1));
  };

  const handleRefresh = () => {
      dispatch(fetchLogs({ page: currentPage, per_page: rowsPerPage, search: searchQuery }));
  };

  const columns = useMemo(() => [
    {
        name: __('User', 'gamify'),
        cell: (row) => (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{row.user_name || 'Guest'}</span>
                <span style={{ fontSize: '12px', color: '#666' }}>{row.user_email || `ID: ${row.user_id}`}</span>
            </div>
        )
    },
    {
        name: __('Event', 'gamify'),
        cell: (row) => (
            <Badge variant="outline" colorScheme="purple">{row.event_name}</Badge>
        ),
    },
    {
        name: __('Message / Details', 'gamify'),
        cell: (row) => {
            let points = 0;
            if (row.points_awarded) points = parseInt(row.points_awarded);
            else if (row.meta && row.meta.points) points = parseInt(row.meta.points);

            const scheduled = row.meta?.scheduled_for;
            const congratsMsg = row.meta?.congratulations_message;

            return (
                <div>
                    <div title={row.message}>{row.message}</div>
                    {congratsMsg && (
                        <div
                            style={{
                                marginTop: '6px',
                                padding: '6px 8px',
                                background: '#f0fff4', // Light Green Bg
                                border: '1px solid #c6f6d5',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#2f855a' // Dark Green Text
                            }}
                            // Using dangerouslySetInnerHTML because it may contain HTML formatting from the editor
                            dangerouslySetInnerHTML={{ __html: congratsMsg }}
                        />
                    )}
                    {points !== 0 && !isNaN(points) && (
                        <span style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            color: points > 0 ? 'green' : 'red',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}>
                            ({points > 0 ? '+' : ''}{points} Points)
                        </span>
                    )}
                    {scheduled && (
                        <div style={{ fontSize: '11px', color: 'purple', marginTop: '2px' }}>
                            <Icon as={FiClock} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            {new Date(scheduled).toLocaleString()}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        name: __('Date', 'gamify'),
        cell: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
        name: __('Status', 'gamify'),
        cell: (row) => (
            <Badge
                colorScheme={row.status === 'success' ? 'green' : row.status === 'pending' ? 'yellow' : 'red'}
                borderRadius="full" px={3}
            >
                {row.status}
            </Badge>
        ),
    },
    {
        name: __('Action', 'gamify'),
        cell: (row) => {
            const isEditable = ['manual_adjustment', 'manual_award', 'manual_deduct'].includes(row.trigger_key);

            if (!isEditable) return <Text fontSize="xs" color="gray.400">System Log</Text>;

            return (
                <Button
                    onClick={() => modalOpenHandler(row)}
                    size="sm" variant="ghost"
                    title="Edit Log"
                >
                    <Icon as={FiEdit} />
                </Button>
            );
        },
    },
  ], []);

  const subHeaderComponentMemo = useMemo(() => {
    return (
        <>
            <div className="gamify-table__sub-header-left">
                <GFLabel as="h2" color="var(--gamify-font-color)" fontWeight="700" fontSize='16px' label={__(`Logs`, 'gamify')} />
                <Button
                    bg="#F6F7F8"
                    variant="outline"
                    borderRadius="8px"
                    color="gray.700"
                    height="32px"
                    fontSize="14px"
                    fontWeight="500"
                    borderColor="gray.300"
                    _hover={{ bg: "#F1F3F5" }}
                    _active={{ bg: "#E9ECEF" }}
                    onClick={handleRefresh}
                    marginLeft='8px'
                >
                    {status === "loading" ? "loading..." : "refresh"}
                </Button>
            </div>

            <div className="gamify-table-sub-header-actions-right" style={{ display: 'flex', gap: '10px' }}>
                <Search
                    placeholder={__('Search Items', 'gamify')}
                    defaultValue={searchQuery}
                    onSearchHandler={(val) => {
                        dispatch(setSearchQuery(val));
                        dispatch(setPage(1));
                    }}
                />
            </div>
        </>
    );
  }, [status, searchQuery]);

  return (
    <>
      {status === 'loading' && (!items || items.length === 0) ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner />
        </Flex>
      ) : (
        <ListTable
          columns={columns}
          isRowSelectable={false}
          data={items}
          showSubHeader={true}
          subHeaderComponent={subHeaderComponentMemo}
          showColumnFilter={false}
          showPagination={true}
          noDataText="No logs found"
          totalItems={totalItems}
          currentPageNumber={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeItemsPerPage={handlePerPageChange}
        />
      )}
    </>
  );
};

export default LogsTable;