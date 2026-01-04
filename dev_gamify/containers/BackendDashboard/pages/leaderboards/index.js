import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Flex, Spinner, Center } from '@chakra-ui/react';
import Select from 'react-select'; // Using React Select for better control
import { __ } from '@wordpress/i18n';

// Components
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';

// Actions
import {
    fetchLeaderboard,
    fetchPointTypes,
    setPage,
    setRowsPerPage,
    setFilterPointType,
    setFilterTimeRange
} from '../../../../redux/Slices/leaderboardSlice/leaderboardSlice';
import { FaChevronRight } from 'react-icons/fa6';

const Leaderboards = () => {
    const dispatch = useDispatch();

    // Redux State (Safe Access)
    const {
        items = [],
        pointTypes = [],
        selectedPointType,
        selectedTimeRange,
        currentPage,
        rowsPerPage,
        totalItems,
        status
    } = useSelector(state => state.leaderboard || {});

    // Initial Load
    useEffect(() => {
        dispatch(fetchPointTypes());
    }, [dispatch]);

    // Fetch Data when filters/pagination change
    useEffect(() => {
        dispatch(fetchLeaderboard({
            page: currentPage,
            per_page: rowsPerPage,
            point_type: selectedPointType,
            time_range: selectedTimeRange
        }));
    }, [dispatch, currentPage, rowsPerPage, selectedPointType, selectedTimeRange]);

    // Handlers
    const handlePageChange = (newPage) => dispatch(setPage(newPage));
    const handlePerPageChange = (newLimit) => {
        dispatch(setRowsPerPage(newLimit));
        dispatch(setPage(1));
    };

    // Columns
    const columns = useMemo(() => [
        {
            name: __('Rank', 'gamify'),
            cell: (row) => <span style={{ fontWeight: 'bold' }}>{row.rank}</span>,
            width: "100px"
        },
        {
            name: __('User', 'gamify'),
            cell: (row) => row.name || 'Guest',
        },
        {
            name: __('Points', 'gamify'),
            cell: (row) => <span>🪙 {row.total_points}</span>,
        },
        {
            name: __('Achievements', 'gamify'),
            cell: (row) => <span>🏆 {row.achievements_count}</span>,
        },
        {
            name: __('Level', 'gamify'),
            cell: (row) => row.top_level,
        },
    ], []);

    // Filter Options
    const timeRangeOptions = [
        { label: 'All Time', value: '' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
        { label: 'This Year', value: 'this_year' },
        { label: 'Last 30 Days', value: 'last_30_days' },
    ];

    // Sub Header (Filters)
    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Flex justifyContent="space-between" alignItems="center" width="100%">
                <div className="gamify-table__sub-header-left">
                    <GFLabel
                        as="h2"
                        color="var(--gamify-font-color)"
                        fontWeight="700"
                        fontSize='16px'
                        label={__(`Gamify Pro Leaderboard`, 'gamify')}
                    />
                </div>

                <Flex gap='12px' alignItems="flex-end">
                    {/* Point Type Filter */}
                    <Box w="200px">
                        <GFLabel label="Select Point Type" type="miniTitle" mb="5px" />
                        <Select
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            placeholder="All Points"
                            options={pointTypes}
                            isClearable
                            onChange={(opt) => {
                                dispatch(setFilterPointType(opt ? opt.value : null));
                                dispatch(setPage(1)); // Reset page on filter
                            }}
                        />
                    </Box>

                    {/* Time Range Filter */}
                    <Box w="200px">
                        <GFLabel label="Time Range" type="miniTitle" mb="5px" />
                        <Select
                            className="gamify-select"
                            classNamePrefix="gamify-select"
                            defaultValue={timeRangeOptions[0]}
                            options={timeRangeOptions}
                            onChange={(opt) => {
                                dispatch(setFilterTimeRange(opt ? opt.value : null));
                                dispatch(setPage(1));
                            }}
                        />
                    </Box>
                </Flex>
            </Flex>
        );
    }, [pointTypes]);

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify">
                             <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" />
                                <path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" />
                            </svg>
                            </span>
                        <span className="gamify-icon gamify-icon--angle-right">
                            <FaChevronRight />
                            </span>
                        <GFLabel
                            as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="400" 
                            fontSize='12px'
                            label={__(`Gamify Pro  `, 'gamify')}
                        />
                    </>
                )}
            />

            <Box width="1174px" margin="0 auto" pb="50px">
                <ListTable
                    columns={columns}
                    data={items}
                    isLoading={status === 'loading'}
                    showSubHeader={true}
                    subHeaderComponent={subHeaderComponentMemo}
                    showColumnFilter={false}
                    showPagination={true}
                    noDataText="No leaderboard data found"
                    totalItems={totalItems}
                    currentPageNumber={currentPage}
                    rowsPerPage={rowsPerPage}
                    onChangePage={handlePageChange}
                    onChangeItemsPerPage={handlePerPageChange}
                />
            </Box>
        </>
    );
};

export default Leaderboards;