// export default Logs;
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

// Custom Components
import TopBar from "@Components/TopBar";
import GFLabel from '@Components/Labels/GFLabel';
import ListTable from '@Components/ListTable';
import OptionMenu from '@Components/OptionMenu';
import Search from '@Components/Search';
import LabeledInput from "@Components/LabeledInput";
import GFSelect from "@Components/Select";
import WPModal from '@Components/Modal/WPModal';

// Icons
import { FiEdit, FiTrash2, FiEye, FiClock, FiRefreshCw } from "react-icons/fi";
import { primaryBtn } from '../../../../assets/scss/chakra/recipe';

// Redux Actions
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery, manualLogAction } from '../../../redux/Slices/logsSlice';

// Chakra UI Imports
import {
    Box,
    Button,
    Icon,
    Badge,
    Flex,
    Spinner,
} from '@chakra-ui/react';

const Logs = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- State Management ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [manualData, setManualData] = useState({
        user_id: '',
        points: 10,
        type: 'award',
        description: '',
        schedule_date: ''
    });

    // --- Redux Data ---
    const {
        items,
        totalItems,
        currentPage,
        rowsPerPage,
        searchQuery,
        status
    } = useSelector((state) => state.logs);

    // --- Fetch Data ---
    useEffect(() => {
        dispatch(fetchLogs({ page: currentPage, per_page: rowsPerPage, search: searchQuery }));
    }, [dispatch, currentPage, rowsPerPage, searchQuery]);

    // --- Handlers ---
    const handlePageChange = (newPage) => dispatch(setPage(newPage));

    const handlePerPageChange = (newLimit) => {
        dispatch(setRowsPerPage(newLimit));
        dispatch(setPage(1));
    };

    const handleRefresh = () => {
        dispatch(fetchLogs({ page: currentPage, per_page: rowsPerPage, search: searchQuery }));
    };

    const handleSearch = (value) => {
        dispatch(setSearchQuery(value));
        dispatch(setPage(1));
    };

    // --- Manual Action Submit Handler ---
    const handleManualSubmit = async () => {
        if (!manualData.user_id) {
            alert(__('User ID is required', 'gamify'));
            return;
        }

        setIsSubmitting(true);
        const result = await dispatch(manualLogAction(manualData));
        setIsSubmitting(false);

        if (manualLogAction.fulfilled.match(result)) {
            // Success: Close modal and reset form
            setIsModalOpen(false);
            setManualData({ user_id: '', points: 10, type: 'award', description: '', schedule_date: '' });
        } else {
            // Error
            alert(__('Error: ', 'gamify') + (result.payload || 'Failed'));
        }
    };

    // --- Columns Definition ---
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
                <Badge variant="outline">{row.event_name}</Badge>
            ),
        },
        {
            name: __('Message / Details', 'gamify'),
            cell: (row) => {
                let points = 0;

                if (row.points_awarded) {
                    points = parseInt(row.points_awarded);
                }

                else if (row.meta && row.meta.points) {
                    points = parseInt(row.meta.points);
                }

                const scheduled = row.meta?.scheduled_for;

                return (
                    <div>
                        <div title={row.message}>{row.message}</div>

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
                <Badge colorScheme={row.status === 'success' ? 'green' : row.status === 'pending' ? 'yellow' : 'red'}>
                    {row.status}
                </Badge>
            ),
        },
        {
            name: __('Action', 'gamify'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: "button",
                            label: __('View Details', 'gamify'),
                            icon: <Icon as={FiEye} />,
                            onClick: () => console.log('View:', row),
                        }
                    ]}
                />
            ),
        },
    ], []);

    // --- SubHeader ---
    const subHeaderComponentMemo = useMemo(() => {
        return (
            <>
                <div className="gamify-table__sub-header-left">
                    <GFLabel
                        as="h2"
                        color="var(--gamify-font-color)"
                        fontWeight="700"
                        fontSize='16px'
                        label={__(`Logs`, 'gamify')}
                    />

                    <Button
                        background='#F6F7F8'
                        variant="outline"
                        borderRadius="md"
                        color="gray.700"
                        fontWeight='400'
                        fontSize='12px'
                        width='54px'
                        height='24px'
                        marginLeft='5px'
                        borderColor="gray.300"
                        onClick={handleRefresh}
                    >
                        {status === 'loading' ? '...' : <Icon as={FiRefreshCw} />}
                    </Button>
                </div>

                <div className="gamify-table-sub-header-actions-right" style={{ display: 'flex', gap: '10px' }}>
                    <Search
                        placeholder={__('Search Items', 'gamify')}
                        onChange={(e) => handleSearch(e.target ? e.target.value : e)}
                    />

                    {/* Trigger Button */}
                    <Button
                        {...primaryBtn}
                        height="auto"
                        onClick={() => setIsModalOpen(true)}
                    >
                        {__('Manual Trigger', 'gamify')}
                    </Button>
                </div>
            </>
        );
    }, [status]);

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify" />
                        <span className="gamify-icon gamify-icon--angle-right" />
                        <GFLabel
                            as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="medium"
                            label={__(`Dashboard`, 'gamify')}
                        />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto" >
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
            </Box>

            {/* Manual Trigger Modal */}
            <WPModal
                title="Manual Trigger Settings"
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                size="medium"
            >
                <div style={{ padding: '0 20px' }}>
                    <LabeledInput
                        label={'User ID'}
                        placeholder={'e.g. 1'}
                        value={manualData.user_id}
                        onChange={(e) => setManualData({ ...manualData, user_id: e.target.value })}
                    />

                    <Box mt={4}>
                        <GFSelect
                            label="Action Type"
                            placeholder="Choose one"
                            items={[
                                { label: 'Award Points (+)', value: 'award' },
                                { label: 'Deduct Points (-)', value: 'deduct' },
                            ]}
                            onChange={(e) => setManualData({ ...manualData, type: e.target ? e.target.value : e })}
                            value={manualData.type}
                        />
                    </Box>

                    <LabeledInput
                        label="Points Amount"
                        type={"number"}
                        value={manualData.points}
                        onChange={(e) => setManualData({ ...manualData, points: e.target.value })}
                    />

                    <LabeledInput
                        label="Description"
                        type='textarea'
                        placeholder="Reason..."
                        value={manualData.description}
                        onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                    />

                    <LabeledInput
                        label="Schedule Date (Optional)"
                        type="datetime-local"
                        value={manualData.schedule_date}
                        onChange={(e) => setManualData({ ...manualData, schedule_date: e.target.value })}
                    />

                    <Flex justifyContent='flex-end' padding='20px 0'>
                        <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
                            {__('Cancel', 'gamify')}
                        </Button>
                        <Button colorScheme="blue" onClick={handleManualSubmit} isLoading={isSubmitting}>
                            {__('Process', 'gamify')}
                        </Button>
                    </Flex>
                </div>
            </WPModal>
        </>
    );
};

export default Logs;