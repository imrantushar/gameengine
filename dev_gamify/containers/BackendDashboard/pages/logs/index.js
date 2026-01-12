import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import Search from '@GFComponents/Search';
import WPModal from '@GFComponents/Modal/WPModal';
import { FiEdit, FiClock } from "react-icons/fi";
import { fetchLogs, setPage, setRowsPerPage, setSearchQuery, manualLogAction, updateLogAction } from '@GFRedux/Slices/logsSlice/logsSlice';
import { Button, Icon, Badge, Flex, Spinner, Text, Input, Textarea, } from '@chakra-ui/react';
import Select from 'react-select';
import { commonInput, primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { GoPlus } from 'react-icons/go';
import GamifyInput from '@GFComponents/GamifyInput';

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
        if (!formData?.user_id && modalMode === 'create') {
            alert(__('User ID is required', 'gamify'));
            return;
        }

        setIsSubmitting(true);
        let result;

        // Prepare Payload
        const payload = {
            ...formData,
            // Map 'reference' to 'trigger_key' for backend compatibility if needed
            trigger_key: formData?.reference
        };

        if (modalMode === 'edit') {
            // Update Action
            result = await dispatch(updateLogAction({
                id: formData?.log_id,
                data: {
                    points_awarded: formData?.points,
                    type: formData?.type,
                    message: formData?.description
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

    const userOptions = [
        { value: 1, label: "User 1" },
        { value: 2, label: "User 2" },
        { value: 3, label: "User 3" },
    ];

    return (
        <>
            <TopBar path={__("Logs", "gamify")} />

            <div className='gamify-page-content'>
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel type="plainHeading" margin={0} label={__("Logs", "gamify")} />

                    <Button {...primaryBtn} onClick={openCreateModal}>
                        <Icon as={GoPlus} boxSize="20px" />  {__('Manual Trigger', 'gamify')}
                    </Button>
                </Flex>

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
            </div>

            <WPModal
                title={modalMode === 'edit' ? `Edit Log #${formData?.log_id}` : "Manual Trigger"}
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                size="medium"
                suffix='manual-trigger'
            >
                <Flex gap={4}>
                    <GamifyInput label={__("User ID", "gamify")}>
                        <Select
                            classNamePrefix='gamify-select'
                            className='gamify-select'
                            placeholder="e.g. 1"
                            options={userOptions}
                            value={userOptions.find(opt => opt.value === formData?.user_id)}
                            onChange={(selected) =>
                                setFormData({
                                    ...formData,
                                    user_id: selected ? selected.value : ""
                                })
                            }
                            isDisabled={modalMode === "edit"}
                            styles={{
                                container: (base) => ({
                                    ...base,
                                    width: "100%",
                                    opacity: modalMode === "edit" ? 0.6 : 1,
                                }),
                            }}
                        />
                    </GamifyInput>

                    <GamifyInput label={__("Action Type", "gamify")}>
                        <Select
                            classNamePrefix='gamify-select'
                            className='gamify-select'
                            defaultValue={formData?.type ?? formData?.type?.items?.label}
                            onChange={(val) => setFormData({ ...formData, type: val?.value })}
                            options={[
                                { label: 'Award Points (+)', value: 'award' },
                                { label: 'Deduct Points (-)', value: 'deduct' },
                            ]}
                        />
                    </GamifyInput>
                </Flex>

                <Flex gap={4}>
                    <GamifyInput label={__("Points Amount", "gamify")}>
                        <Input
                            placeholder={__("Exp: 50", "gamify")}
                            type="number"
                            value={formData?.points}
                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                            {...commonInput}
                        />
                    </GamifyInput>

                    {modalMode === 'create' && (
                        <GamifyInput label={__("Schedule(Optional)", "gamify")}>
                            <Input
                                placeholder={__("Exp: 50", "gamify")}
                                type="datetime-local"
                                value={formData?.schedule_date}
                                onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                {...commonInput}
                            />
                        </GamifyInput>
                    )}
                </Flex>

                <GamifyInput label={__("Description(Optional)", "gamify")}>
                    <Textarea
                        placeholder={__("Reason for adjustment...", "gamify")}
                        size="md"
                        minH="100px"
                        value={formData?.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </GamifyInput>

                <Flex gap={3} justifyContent='flex-end' pt="20px" borderTop="1px solid var(--gamify-border-color)">
                    <Button variant="ghost" border="1px solid var(--gamify-border-color)" onClick={() => setIsModalOpen(false)}>
                        {__('Cancel', 'gamify')}
                    </Button>
                    <Button
                        {...primaryBtn}
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        border="1px solid var(--gamify-primary)"
                    >
                        {modalMode === 'edit' ? __('Update Log', 'gamify') : __('Process Trigger', 'gamify')}
                    </Button>
                </Flex>
            </WPModal>
        </>
    );
};

export default Logs;
