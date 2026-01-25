import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Flex, } from '@chakra-ui/react';
import Select from 'react-select';
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import ListTable from '@GFComponents/ListTable';
import {
    fetchLeaderboard,
    fetchPointTypes,
    setPage,
    setRowsPerPage,
    setFilterPointType,
    setFilterTimeRange
} from '../../../../redux/Slices/leaderboardSlice/leaderboardSlice';

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
            name: __('Rank', 'gameengine'),
            cell: (row) => <span style={{ fontWeight: 'bold' }}>{row.rank}</span>,
            width: "100px"
        },
        {
            name: __('User', 'gameengine'),
            cell: (row) => row.name || 'Guest',
        },
        {
            name: __('Points', 'gameengine'),
            cell: (row) => <span>🪙 {row.total_points}</span>,
        },
        {
            name: __('Achievements', 'gameengine'),
            cell: (row) => <span>🏆 {row.achievements_count}</span>,
        },
        {
            name: __('Level', 'gameengine'),
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

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                <GFLabel type="plainHeading" margin={0} label={__("Leaderboards", "gameengine")} />

                <Flex gap='16px' alignItems="flex-end">
                    <Select
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        placeholder="All Points"
                        options={pointTypes}
                        isClearable
                        onChange={(opt) => {
                            dispatch(setFilterPointType(opt ? opt.value : null));
                            dispatch(setPage(1));
                        }}
                    />

                    <Select
                        className="gameengine-select"
                        classNamePrefix="gameengine-select"
                        defaultValue={timeRangeOptions[0]}
                        options={timeRangeOptions}
                        onChange={(opt) => {
                            dispatch(setFilterTimeRange(opt ? opt.value : null));
                            dispatch(setPage(1));
                        }}
                    />
                </Flex>
            </Flex>
        );
    }, [pointTypes]);

    return (
        <>
            <TopBar path={__("Leaderboards", "gameengine")} />

            <div className='gameengine-page-content'>
                {subHeaderComponentMemo}

                <ListTable
                    columns={columns}
                    data={items}
                    isLoading={status === 'loading'}
                    showSubHeader={false}
                    showColumnFilter={false}
                    showPagination={true}
                    isRowSelectable={false}
                    noDataText="No leaderboard data found"
                    totalItems={totalItems}
                    currentPageNumber={currentPage}
                    rowsPerPage={rowsPerPage}
                    onChangePage={handlePageChange}
                    onChangeItemsPerPage={handlePerPageChange}
                />
            </div>
        </>
    );
};

export default Leaderboards;
