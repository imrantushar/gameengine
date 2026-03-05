import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Icon,
    Text,
} from '@chakra-ui/react';
import ListTable from '@GFComponents/ListTable';
import { __ } from '@wordpress/i18n';
import { FiCheckCircle, FiTrash2 } from "react-icons/fi";
import OptionMenu from '@GFComponents/OptionMenu';
import Search from '@GFComponents/Search';
import StatusOptions from '@GFComponents/StatusOptions';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayoutList, payoutSearch, updatePayoutStatus } from '@GFRedux/Slices/payoutSlice/payoutSlice';
import { reactDebounce } from '@GFUtils/helper';
import GFLabel from '@GFComponents/Labels/GFLabel';
import TopBar from '@GFComponents/TopBar';

export default function Wallet() {
    const { data: payouts, search: searchValue, total, perPage } = useSelector(state => state.payouts);

    const [tableStatus, setTableStatus] = useState('all');
    const [selectedRows, setSelectedRows] = useState([]);
    const [dataFetchingStatus, setDataFetchingStatus] = useState(false);

    const dispatch = useDispatch();

    const fetchPayouts = async ({
        status = 'all',
        page = 1,
        per_page = 15,
        search = ""
    }) => {
        setDataFetchingStatus(true);
        try {
            await dispatch(fetchPayoutList({ status, page, per_page, search })).unwrap();
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
            })()
        }
    }, []);

    const handleSearch = reactDebounce(async (value) => {
        dispatch(payoutSearch(value));
        await fetchPayouts({ search: value });
    }, 500);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await dispatch(updatePayoutStatus({ id, status: newStatus })).unwrap();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const hasPendingRow = payouts.some(row => row.status === 'pending');

    const columns = [
        {
            name: __('User', 'gameengine'),
            cell: row => (
                <Text fontWeight="500">{row.display_name || '—'}</Text>
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
                                {showFull ? __('Show less', 'gameengine') : __('Show more', 'gameengine')}
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
                    handleUpdateStatus(row.id, newStatus);
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
        ...(hasPendingRow
            ? [{
                name: __('Action', 'gameengine'),
                cell: row => {
                    if (row.status !== 'pending') return null;

                    const options = [
                        {
                            type: 'button',
                            label: __('Completed', 'gameengine'),
                            icon: <Icon as={FiCheckCircle} />,
                            onClick: () => handleUpdateStatus(row.id, 'completed')
                        },
                        {
                            type: 'button',
                            label: __('Rejected', 'gameengine'),
                            icon: <Icon as={FiTrash2} />,
                            onClick: () => handleUpdateStatus(row.id, 'rejected')
                        }
                    ];

                    return <OptionMenu options={options} />;
                },
                columnWidth: "14%",
                textAlign: "end",
            }]
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
                            onClick={() => {
                                fetchPayouts({ status: tab.value });
                                setTableStatus(tab.value);
                            }}
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
        )
    }, [tableStatus, searchValue]);

    return (
        <>
            <TopBar path={__("Wallet Lists", "gameengine")} />

            <div className='gameengine-page-content'>
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Wallet Lists", "gameengine")} />
                </Flex>
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
};