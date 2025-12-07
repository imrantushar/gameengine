import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VStack, Spinner, Center } from "@chakra-ui/react";
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';

// Components
import TopUsers from "./TopUsers";
import Distribution from "./Distribution";
import Overview from "./Overview";

// Action
import { fetchDashboardData } from '../../../../redux/Slices/dashboardSlice/dashboardSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { overview, chart, topUsers, status } = useSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    if (status === 'loading') {
        return <Center h="100vh"><Spinner size="xl" /></Center>;
    }

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
                            label={__(`Game Engine`, 'gamify')}
                        />
                    </>
                )}
            />
            <VStack gap='24px' w='1320px' margin="0 auto" pb='136px'>
                <Overview data={overview} />
                <Distribution chartData={chart} />
                <TopUsers users={topUsers} />
            </VStack>
        </>
    );
};

export default Dashboard;