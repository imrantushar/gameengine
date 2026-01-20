import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import { FiEdit, FiClock } from "react-icons/fi";
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Button, Icon, Badge, Flex, Spinner, Text } from '@chakra-ui/react';

const LogsTable = ({ modalOpenHandler }) => {
    const dispatch = useDispatch();
    const {
        items,
        totalItems,
        currentPage,
        perPage,
        search,
        status
    } = useSelector((state) => state.logs);


    const handleRefresh = (page = 1, per_page = 10, serchKey = "") => {
        dispatch(fetchLogs({ page, per_page, search: serchKey }));
    };

    useEffect(() => {
        handleRefresh()
    }, []);

    const handlePageChange = (newPage) => handleRefresh(newPage, perPage);

    const handlePerPageChange = (itemsPerPage) => {
        handleRefresh(currentPage, itemsPerPage)
    };

    const columns = useMemo(() => [
        {
            name: __('User', 'gamify'),
            cell: (row) => (
                <div className='gamify-table-flex-col'>
                    <span style={{ fontWeight: 600 }}>{row.user_name || 'Guest'}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>{row.user_email || `ID: ${row.user_id}`}</span>
                </div>
            ),
            columnWidth: "180px",
            textAlign: "start",
        },
        {
            name: __('Event', 'gamify'),
            cell: (row) => (
                <Badge variant="outline" colorScheme="purple">{row.event_name}</Badge>
            ),
            columnWidth: "130px",
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
                    <>
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
                    </>
                );
            },
            columnWidth: "340px",
        },
        {
            name: __('Date', 'gamify'),
            cell: (row) => <Text>
                {new Date(row.created_at).toLocaleString()}
            </Text>,
            columnWidth: "154px",
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
            columnWidth: "100px",
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
            columnWidth: "20px",
            textAlign: "end",
        },
    ], []);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <>

                <div className='gamify-table__sub-header-left-items'>
                    <GFLabel color="var(--gamify-font-color)" fontWeight="700" fontSize='16px' label={__(`Logs`, 'gamify')} />

                    <Button
                        bg="var(--gamify-secondary-color)"
                        color="var(--gamify-font-color)"
                        boxShadow="var(--gamify-shadow)"
                        height="auto"
                        p="4px 8px"
                        fontSize="12px"
                        fontWeight="400"
                        lineHeight="16px"
                        borderRadius="4px"
                        onClick={handleRefresh}
                    >
                        {status === "loading" ? "loading..." : "refresh"}
                    </Button>
                </div>

                <Search
                    placeholder={__('Search Items', 'gamify')}
                    defaultValue={search}
                    onSearchHandler={(val) => {
                        dispatch(setSearchQuery(val));
                        dispatch(setPage(1));
                    }}
                />
            </>
        );
    }, [status, search]);

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
                    noDataText={__("No logs found", "gamify")}
                    totalItems={totalItems}
                    currentPageNumber={currentPage}
                    perPage={perPage}
                    onChangePage={handlePageChange}
                    onChangeItemsPerPage={handlePerPageChange}
                    suffix="logs-table"
                />
            )}
        </>
    );
};

export default LogsTable;
