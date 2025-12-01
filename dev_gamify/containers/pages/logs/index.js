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
import { FiMoreHorizontal, FiEdit, FiClock, FiRefreshCw, FiPlus } from "react-icons/fi";
import { primaryBtn } from '../../../../assets/scss/chakra/recipe';

// Redux Actions
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery, manualLogAction, updateLogAction } from '../../../redux/Slices/logsSlice';

// Chakra UI Imports
import {
    Box,
    Button,
    Icon,
    Badge,
    Flex,
    Spinner,
    Text,
    Tooltip,
} from '@chakra-ui/react';

const Logs = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- State Management ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

    // Form Data
    const [formData, setFormData] = useState({
        log_id: null,
        user_id: '',
        points: 10,
        type: 'award',
        reference: 'manual_adjustment',
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

    // --- Helper: Open Modal for Create ---
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            log_id: null,
            user_id: '',
            points: 10,
            type: 'award',
            reference: 'manual_adjustment',
            description: '',
            schedule_date: ''
        });
        setIsModalOpen(true);
    };

    // --- Helper: Open Modal for Edit ---
    const openEditModal = (row) => {
        // Prevent editing automatic system logs (like level up)
        const editableTriggers = ['manual_adjustment', 'manual_award', 'manual_deduct'];
        if (!editableTriggers.includes(row.trigger_key)) {
            alert('System generated logs cannot be edited manually.');
            return;
        }

        const points = parseInt(row.points_awarded || row.meta?.points || 0);

        setModalMode('edit');
        setFormData({
            log_id: row.id,
            user_id: row.user_id, // Usually readonly in edit
            points: Math.abs(points),
            type: points >= 0 ? 'award' : 'deduct',
            reference: row.trigger_key,
            description: row.message || '',
            schedule_date: '' // Can't reschedule easily, so keep empty or hide
        });
        setIsModalOpen(true);
    };

    // --- Submit Handler (Create & Update) ---
    const handleSubmit = async () => {
        if (!formData.user_id && modalMode === 'create') {
            alert(__('User ID is required', 'gamify'));
            return;
        }

        setIsSubmitting(true);
        let result;

        // Prepare Payload
        const payload = {
            ...formData,
            // Map 'reference' to 'trigger_key' for backend compatibility if needed
            trigger_key: formData.reference
        };

        if (modalMode === 'edit') {
            // Update Action
            result = await dispatch(updateLogAction({
                id: formData.log_id,
                data: {
                    points_awarded: formData.points,
                    type: formData.type,
                    message: formData.description
                }
            }));
        } else {
            // Create Action
            result = await dispatch(manualLogAction(payload));
        }

        setIsSubmitting(false);

        if (manualLogAction.fulfilled.match(result) || updateLogAction.fulfilled.match(result)) {
            setIsModalOpen(false);
        } else {
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
                // Check if row is editable (Only manual adjustments)
                const isEditable = ['manual_adjustment', 'manual_award', 'manual_deduct'].includes(row.trigger_key);

                if (!isEditable) return <Text fontSize="xs" color="gray.400">System Log</Text>;

                return (
                    <Button
                        onClick={() => openEditModal(row)}
                        size="sm" variant="ghost"
                        title="Edit Log"
                    >
                        <Icon as={FiEdit} />
                    </Button>
                );
            },
        },
    ], []);

    // --- SubHeader ---
    const subHeaderComponentMemo = useMemo(() => {
        return (
            <>
                <div className="gamify-table__sub-header-left">
                    <GFLabel as="h2" color="var(--gamify-font-color)" fontWeight="700" fontSize='16px' label={__(`Logs`, 'gamify')} />
                    <Button
                        background='#F6F7F8' variant="outline" borderRadius="md"
                        color="gray.700" width='54px' height='24px' ml='5px' borderColor="gray.300"
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
                    <Button
                        {...primaryBtn}
                        height="32px"
                        onClick={openCreateModal}
                        leftIcon={<Icon as={FiPlus} />}
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
                        <GFLabel as="h2" color="var(--gamify-font-color)" type="subtitle" fontWeight="medium" label={__(`Dashboard`, 'gamify')} />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto" >
                {status === 'loading' && (!items || items.length === 0) ? (
                    <Flex justify="center" align="center" height="200px"><Spinner /></Flex>
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

            {/* --- Unified Create/Edit Modal --- */}
            <WPModal
                title={modalMode === 'edit' ? `Edit Log #${formData.log_id}` : "Manual Trigger"}
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                size="medium"
            >
                <Box px={4}>
                    <Flex gap={4} mb={4}>
                        <Box flex="1">
                            {/* User ID (ReadOnly in Edit Mode) */}
                            <LabeledInput
                                label={'User ID'}
                                placeholder={'e.g. 1'}
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                disabled={modalMode === 'edit'}
                                style={{ width: '100%', opacity: modalMode === 'edit' ? 0.6 : 1 }}
                            />
                        </Box>
                        <Box flex="1">
                            {/* Action Type Select - Fixed Handler */}
                            <GFSelect
                                label="Action Type"
                                // placeholder="Select Action"
                                items={[
                                    { label: 'Award Points (+)', value: 'award' },
                                    { label: 'Deduct Points (-)', value: 'deduct' },
                                ]}

                                onChange={(val) => setFormData({ ...formData, type: val })}
                                value={formData.type}
                            />
                        </Box>
                    </Flex>

                    <Flex gap={4} mb={4}>
                        <Box flex="1">
                            <LabeledInput
                                label={'Points Amount'}
                                type="number"
                                placeholder={'e.g. 50'}
                                value={formData.points}
                                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </Box>
                        <Box flex="1">
                            {/* Only show schedule for new triggers */}
                            {modalMode === 'create' && (
                                <LabeledInput
                                    label="Schedule (Optional)"
                                    type="datetime-local"
                                    value={formData.schedule_date}
                                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            )}
                        </Box>
                    </Flex>

                    <Box mb={4}>
                        <LabeledInput
                            label="Description / Message"
                            type='textarea'
                            placeholder="Reason for adjustment..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </Box>

                    <Flex justifyContent='flex-end' py={4}>
                        <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
                            {__('Cancel', 'gamify')}
                        </Button>
                        <Button
                            {...primaryBtn}
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                        >
                            {modalMode === 'edit' ? __('Update Log', 'gamify') : __('Process Trigger', 'gamify')}
                        </Button>
                    </Flex>
                </Box>
            </WPModal>
        </>
    );
};

export default Logs;