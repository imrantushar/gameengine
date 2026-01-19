import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, Center, Flex } from "@chakra-ui/react";
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import TopUsers from "./TopUsers";
import Distribution from "./Distribution";
import Overview from "./Overview";
import { fetchDashboardData } from '@GFRedux/Slices/dashboardSlice/dashboardSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { overview, chart, topUsers, status } = useSelector(state => state.dashboard);

    // Keep Date State here so it doesn't get lost on re-render
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Initial Load
    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    const handleFilterChange = useCallback((start, end) => {
        dispatch(fetchDashboardData({ start_date: start, end_date: end }));
    }, [dispatch]);

    // Only show full page spinner on very first load (Initial loading)
    if (status === 'loading' && overview.points === 0) {
        return <Center h="100vh"><Spinner size="xl" color="blue.500" /></Center>;
    }

    return (
        <>
            <TopBar path={__("Dashboard", "gamify")} />

            <Flex direction="column" gap={6} className='gamify-page-content'>
                <Overview
                    data={overview}
                    onFilterChange={handleFilterChange}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />

                <Distribution chartData={chart} />

                <TopUsers users={topUsers} />
            </Flex>
        </>
    );
};

export default Dashboard;
